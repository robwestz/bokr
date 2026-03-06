import type { Request, Response, NextFunction } from "express";
import type { Membership } from "@prisma/client";
import { prisma } from "../prisma";
import { verifySession } from "./jwt";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string };
      roles?: string[];
      restaurantIds?: string[];
    }
  }
}

export type AuthedRequest = Request;

export async function authMiddleware(req: AuthedRequest, _res: Response, next: NextFunction) {
  const token = (req as any).cookies?.session;
  if (!token) return next();
  const decoded = verifySession(token);
  if (!decoded) return next();

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user) return next();

  const memberships = await prisma.membership.findMany({ where: { userId: user.id } });
  req.user = { id: user.id, email: user.email };
  req.roles = memberships.map((m: Membership) => m.role);
  req.restaurantIds = memberships.filter((m: Membership) => m.restaurantId != null).map((m) => m.restaurantId!);
  next();
}


export function requireRole(role: string) {

  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "unauthorized" });
    if (!req.roles?.includes(role)) return res.status(403).json({ error: "forbidden" });
    next();
  };
}


export function requireRestaurantAccess(paramName: string) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const restaurantId = (req as any).params?.[paramName];
    if (!restaurantId) return res.status(400).json({ error: "missing_restaurantId" });

    if (!req.user) return res.status(401).json({ error: "unauthorized" });
    if (req.roles?.includes("SUPERADMIN")) return next();

    if (!req.roles?.includes("RESTAURANT_ADMIN")) return res.status(403).json({ error: "forbidden" });
    if (!req.restaurantIds?.includes(restaurantId)) return res.status(403).json({ error: "forbidden" });

    next();
  };
}
