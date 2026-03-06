import jwt from "jsonwebtoken";
import { env } from "../env";

export function signSession(payload: { userId: string }) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
}
export function verifySession(token: string): { userId: string } | null {
  try { return jwt.verify(token, env.JWT_SECRET) as any; } catch { return null; }
}
