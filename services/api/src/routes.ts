import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { signSession } from "./auth/jwt";
import { requireRole, requireRestaurantAccess } from "./auth/middleware";
import { presignPut, presignGet } from "./s3";
import { LoginSchema, CreateRestaurantSchema, UpsertMenuSchema } from "@mtb/shared";

export const router = Router();

router.get("/health", (_req, res) => res.json({ ok: true }));

router.post("/auth/login", async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return res.status(401).json({ error: "invalid_credentials" });

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "invalid_credentials" });

  const token = signSession({ userId: user.id });
  res.cookie("session", token, { httpOnly: true, sameSite: "lax", secure: false, path: "/" });
  res.json({ ok: true });
});

router.post("/auth/logout", async (_req, res) => {
  res.clearCookie("session", { path: "/" });
  res.json({ ok: true });
});

router.get("/auth/me", async (req, res) => {
  // @ts-ignore
  if (!req.user) return res.status(401).json({ error: "unauthorized" });
  // @ts-ignore
  res.json({ user: req.user, roles: req.roles, restaurantIds: req.restaurantIds });
});


// Admin: list restaurants current user can access
router.get("/admin/my/restaurants", async (req, res) => {
  // @ts-ignore
  if (!req.user) return res.status(401).json({ error: "unauthorized" });

  // @ts-ignore
  const isSuper = req.roles?.includes("SUPERADMIN");
  if (isSuper) {
    const items = await prisma.restaurant.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
    return res.json({ restaurants: items });
  }

  // @ts-ignore
  const ids = req.restaurantIds ?? [];
  const items = await prisma.restaurant.findMany({ where: { id: { in: ids } } });
  return res.json({ restaurants: items });
});

// Public restaurant by slug
router.get("/restaurants/:slug", async (req, res) => {
  const restaurant = await prisma.restaurant.findUnique({ where: { slug: req.params.slug } });
  if (!restaurant) return res.status(404).json({ error: "not_found" });
  res.json({ restaurant });
});

// Superadmin create restaurant
router.post("/admin/restaurants", requireRole("SUPERADMIN"), async (req, res) => {
  const parsed = CreateRestaurantSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
  const created = await prisma.restaurant.create({ data: parsed.data });
  res.status(201).json({ restaurant: created });
});

// Public menu
router.get("/restaurants/:slug/menus/:type", async (req, res) => {
  const restaurant = await prisma.restaurant.findUnique({ where: { slug: req.params.slug } });
  if (!restaurant) return res.status(404).json({ error: "not_found" });

  const menu = await prisma.menu.findUnique({
    where: { restaurantId_type: { restaurantId: restaurant.id, type: req.params.type as any } },
    include: { pdf: true },
  });
  if (!menu || !menu.isPublished) return res.status(404).json({ error: "not_found" });

  let pdfDownloadUrl: string | null = null;
  if (menu.pdf?.status === "CLEAN") {
    pdfDownloadUrl = await presignGet(menu.pdf.objectKey);
  }

  res.json({ menu, pdfDownloadUrl });
});


// Admin get menu (includes unpublished)
router.get("/admin/restaurants/:restaurantId/menus/:type", requireRestaurantAccess("restaurantId"), async (req, res) => {
  const restaurantId = req.params.restaurantId;
  const type = req.params.type as any;

  const menu = await prisma.menu.findUnique({
    where: { restaurantId_type: { restaurantId, type } },
    include: { pdf: true },
  });

  if (!menu) return res.status(404).json({ error: "not_found" });
  return res.json({ menu });
});

// Admin init PDF upload (presigned PUT)
router.post("/admin/restaurants/:restaurantId/menus/:type/pdf/init", requireRestaurantAccess("restaurantId"), async (req, res) => {
  const restaurantId = req.params.restaurantId;
  const type = req.params.type as any;

  const menu = await prisma.menu.upsert({
    where: { restaurantId_type: { restaurantId, type } },
    update: {},
    create: { restaurantId, type, content: "", isPublished: false },
  });

  const objectKey = `restaurants/${restaurantId}/menus/${menu.id}/${Date.now()}.pdf`;
  const uploadUrl = await presignPut(objectKey, "application/pdf");

  const pdf = await prisma.menuPdf.upsert({
    where: { menuId: menu.id },
    update: { objectKey, status: "CREATED" },
    create: { menuId: menu.id, objectKey, status: "CREATED" },
  });

  return res.json({ upload: { objectKey, uploadUrl }, pdf });
});

// Admin finalize PDF upload (mark pending scan → CLEAN for now)
router.post("/admin/restaurants/:restaurantId/menus/:type/pdf/finalize", requireRestaurantAccess("restaurantId"), async (req, res) => {
  const restaurantId = req.params.restaurantId;
  const type = req.params.type as any;

  const menu = await prisma.menu.findUnique({ where: { restaurantId_type: { restaurantId, type } } });
  if (!menu) return res.status(404).json({ error: "not_found" });

  const pdf = await prisma.menuPdf.update({
    where: { menuId: menu.id },
    data: { status: "CLEAN" }, // TODO: real AV scan + quarantine flow
  });

  return res.json({ pdf });
});

// Admin upsert menu (SUPERADMIN only in scaffold; restaurant admin gating added next)
router.put("/admin/restaurants/:restaurantId/menus/:type", requireRestaurantAccess("restaurantId"), async (req, res) => {
  const parsed = UpsertMenuSchema.safeParse({ type: req.params.type, content: req.body?.content, isPublished: req.body?.isPublished });
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });

  const restaurantId = req.params.restaurantId;
  const type = req.params.type as any;

  const menu = await prisma.menu.upsert({
    where: { restaurantId_type: { restaurantId, type } },
    update: { content: parsed.data.content ?? "", isPublished: parsed.data.isPublished ?? false, version: { increment: 1 } },
    create: { restaurantId, type, content: parsed.data.content ?? "", isPublished: parsed.data.isPublished ?? false },
  });

  res.json({ menu });
});

// Public create reservation (availability checks added later)
router.post("/restaurants/:slug/reservations", async (req, res) => {
  const restaurant = await prisma.restaurant.findUnique({ where: { slug: req.params.slug } });
  if (!restaurant) return res.status(404).json({ error: "not_found" });

  const time = new Date(req.body?.time);
  const partySize = Number(req.body?.partySize);
  const guestName = String(req.body?.guestName ?? "");
  const guestContact = String(req.body?.guestContact ?? "");

  if (!time.getTime() || !partySize || !guestName || !guestContact) return res.status(400).json({ error: "invalid_input" });

  const reservation = await prisma.reservation.create({ data: { restaurantId: restaurant.id, time, partySize, guestName, guestContact } });
  res.status(201).json({ reservation });
});
