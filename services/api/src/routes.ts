import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { signSession } from "./auth/jwt";
import { requireRole, requireRestaurantAccess } from "./auth/middleware";
import { presignPut, presignGet } from "./s3";
import { LoginSchema, CreateRestaurantSchema, UpsertMenuSchema } from "@mtb/shared";

export const router = Router();

router.get("/health", (_req, res) => res.json({ ok: true }));

// ── Auth ──────────────────────────────────────────────

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
  if (!req.user) return res.status(401).json({ error: "unauthorized" });
  res.json({ user: req.user, roles: req.roles, restaurantIds: req.restaurantIds });
});

// ── Admin: restaurants ────────────────────────────────

router.get("/admin/my/restaurants", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "unauthorized" });

  const isSuper = req.roles?.includes("SUPERADMIN");
  if (isSuper) {
    const items = await prisma.restaurant.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
    return res.json({ restaurants: items });
  }

  const ids = req.restaurantIds ?? [];
  const items = await prisma.restaurant.findMany({ where: { id: { in: ids } } });
  return res.json({ restaurants: items });
});

router.get("/restaurants/:slug", async (req, res) => {
  const restaurant = await prisma.restaurant.findUnique({ where: { slug: req.params.slug } });
  if (!restaurant) return res.status(404).json({ error: "not_found" });
  res.json({ restaurant });
});

router.post("/admin/restaurants", requireRole("SUPERADMIN"), async (req, res) => {
  const parsed = CreateRestaurantSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
  const created = await prisma.restaurant.create({ data: parsed.data });
  res.status(201).json({ restaurant: created });
});

// ── Menus ─────────────────────────────────────────────

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

// ── Sittings (admin) ──────────────────────────────────

router.get("/admin/restaurants/:restaurantId/sittings", requireRestaurantAccess("restaurantId"), async (req, res) => {
  const sittings = await prisma.sitting.findMany({
    where: { restaurantId: req.params.restaurantId },
    orderBy: { startTime: "asc" },
  });
  res.json({ sittings });
});

router.post("/admin/restaurants/:restaurantId/sittings", requireRestaurantAccess("restaurantId"), async (req, res) => {
  const { label, startTime, endTime, maxCapacity, dayOfWeek, specificDate } = req.body ?? {};

  if (!label || !startTime || !endTime || !maxCapacity) {
    return res.status(400).json({ error: "invalid_input", fields: "label, startTime, endTime, maxCapacity required" });
  }

  const sitting = await prisma.sitting.create({
    data: {
      restaurantId: req.params.restaurantId,
      label: String(label),
      startTime: String(startTime),
      endTime: String(endTime),
      maxCapacity: Number(maxCapacity),
      dayOfWeek: dayOfWeek != null ? Number(dayOfWeek) : null,
      specificDate: specificDate ? new Date(specificDate) : null,
    },
  });

  res.status(201).json({ sitting });
});

router.patch("/admin/restaurants/:restaurantId/sittings/:sittingId", requireRestaurantAccess("restaurantId"), async (req, res) => {
  const { label, startTime, endTime, maxCapacity, dayOfWeek, specificDate, isActive } = req.body ?? {};
  const data: Record<string, any> = {};
  if (label !== undefined) data.label = String(label);
  if (startTime !== undefined) data.startTime = String(startTime);
  if (endTime !== undefined) data.endTime = String(endTime);
  if (maxCapacity !== undefined) data.maxCapacity = Number(maxCapacity);
  if (dayOfWeek !== undefined) data.dayOfWeek = dayOfWeek != null ? Number(dayOfWeek) : null;
  if (specificDate !== undefined) data.specificDate = specificDate ? new Date(specificDate) : null;
  if (isActive !== undefined) data.isActive = Boolean(isActive);

  const sitting = await prisma.sitting.update({
    where: { id: req.params.sittingId },
    data,
  });

  res.json({ sitting });
});

// ── Availability (public) ─────────────────────────────

router.get("/restaurants/:slug/availability", async (req, res) => {
  const restaurant = await prisma.restaurant.findUnique({ where: { slug: req.params.slug } });
  if (!restaurant) return res.status(404).json({ error: "not_found" });

  const dateStr = req.query.date as string;
  if (!dateStr) return res.status(400).json({ error: "date query param required (YYYY-MM-DD)" });

  const date = new Date(dateStr + "T00:00:00Z");
  const dayOfWeek = date.getUTCDay(); // 0=Sun

  // Find sittings for this day: specific date match OR matching dayOfWeek (recurring)
  const sittings = await prisma.sitting.findMany({
    where: {
      restaurantId: restaurant.id,
      isActive: true,
      OR: [
        { specificDate: date },
        { specificDate: null, dayOfWeek },
      ],
    },
    orderBy: { startTime: "asc" },
  });

  // Count confirmed reservations per sitting time window
  const dayStart = new Date(dateStr + "T00:00:00Z");
  const dayEnd = new Date(dateStr + "T23:59:59Z");

  const reservations = await prisma.reservation.findMany({
    where: {
      restaurantId: restaurant.id,
      status: "CONFIRMED",
      time: { gte: dayStart, lte: dayEnd },
    },
  });

  const slots = sittings.map((sitting) => {
    const sittingStart = new Date(`${dateStr}T${sitting.startTime}:00Z`);
    const sittingEnd = new Date(`${dateStr}T${sitting.endTime}:00Z`);

    const booked = reservations.filter((r) => r.time >= sittingStart && r.time < sittingEnd);
    const bookedCount = booked.reduce((sum, r) => sum + r.partySize, 0);

    return {
      sittingId: sitting.id,
      label: sitting.label,
      startTime: sitting.startTime,
      endTime: sitting.endTime,
      maxCapacity: sitting.maxCapacity,
      bookedCount,
      availableCapacity: Math.max(0, sitting.maxCapacity - bookedCount),
    };
  });

  res.json({ date: dateStr, timezone: restaurant.timezone, slots });
});

// ── Reservations (public) ─────────────────────────────

router.post("/restaurants/:slug/reservations", async (req, res) => {
  const restaurant = await prisma.restaurant.findUnique({ where: { slug: req.params.slug } });
  if (!restaurant) return res.status(404).json({ error: "not_found" });

  const time = new Date(req.body?.time);
  const partySize = Number(req.body?.partySize);
  const guestName = String(req.body?.guestName ?? "");
  const guestContact = String(req.body?.guestContact ?? "");
  const idempotencyKey = req.body?.idempotencyKey ? String(req.body.idempotencyKey) : null;

  if (!time.getTime() || !partySize || !guestName || !guestContact) {
    return res.status(400).json({ error: "invalid_input" });
  }

  // Idempotency: if key provided and already used, return existing reservation
  if (idempotencyKey) {
    const existing = await prisma.reservation.findUnique({ where: { idempotencyKey } });
    if (existing) return res.status(201).json({ reservation: existing });
  }

  // Availability check: find sitting that covers this time
  const dateStr = time.toISOString().slice(0, 10);
  const dayOfWeek = time.getUTCDay();

  const sittings = await prisma.sitting.findMany({
    where: {
      restaurantId: restaurant.id,
      isActive: true,
      OR: [
        { specificDate: new Date(dateStr + "T00:00:00Z") },
        { specificDate: null, dayOfWeek },
      ],
    },
  });

  if (sittings.length > 0) {
    // Find the sitting this reservation falls into
    const timeStr = time.toISOString().slice(11, 16); // HH:MM
    const matchingSitting = sittings.find((s) => timeStr >= s.startTime && timeStr < s.endTime);

    if (!matchingSitting) {
      return res.status(400).json({ error: "no_sitting_for_time", message: "No sitting available at the requested time" });
    }

    // Concurrency-safe capacity check using a transaction
    try {
      const reservation = await prisma.$transaction(async (tx) => {
        const sittingStart = new Date(`${dateStr}T${matchingSitting.startTime}:00Z`);
        const sittingEnd = new Date(`${dateStr}T${matchingSitting.endTime}:00Z`);

        const bookedTotal = await tx.reservation.aggregate({
          where: {
            restaurantId: restaurant.id,
            status: "CONFIRMED",
            time: { gte: sittingStart, lt: sittingEnd },
          },
          _sum: { partySize: true },
        });

        const currentBooked = bookedTotal._sum.partySize ?? 0;
        if (currentBooked + partySize > matchingSitting.maxCapacity) {
          throw new Error("CAPACITY_EXCEEDED");
        }

        return tx.reservation.create({
          data: { restaurantId: restaurant.id, time, partySize, guestName, guestContact, idempotencyKey },
        });
      });

      return res.status(201).json({ reservation });
    } catch (err: any) {
      if (err?.message === "CAPACITY_EXCEEDED") {
        return res.status(409).json({ error: "capacity_exceeded", message: "This sitting is fully booked" });
      }
      throw err;
    }
  }

  // No sittings configured — allow free booking (backwards compat)
  const reservation = await prisma.reservation.create({
    data: { restaurantId: restaurant.id, time, partySize, guestName, guestContact, idempotencyKey },
  });

  res.status(201).json({ reservation });
});
