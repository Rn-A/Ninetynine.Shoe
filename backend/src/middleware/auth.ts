import type { Request, Response, NextFunction } from "express";
import { verifyToken, type JwtPayload } from "../utils/auth.js";

export type AuthedRequest = Request & { auth?: JwtPayload };

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7);
}

export function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: "Login diperlukan" });
  }
  try {
    req.auth = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ error: "Token tidak valid atau kedaluwarsa" });
  }
}

export function requireAdmin(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: "Login admin diperlukan" });
  }
  try {
    const payload = verifyToken(token);
    if (payload.role !== "admin") {
      return res.status(403).json({ error: "Akses khusus admin" });
    }
    req.auth = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Token tidak valid atau kedaluwarsa" });
  }
}

export function requireOwnerOrAdmin(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: "Login diperlukan" });
  }
  try {
    const payload = verifyToken(token);
    req.auth = payload;
    const requestedUserId = req.query.userId;
    if (payload.role === "admin") return next();
    if (
      requestedUserId &&
      String(payload.id) === String(requestedUserId)
    ) {
      return next();
    }
    return res.status(403).json({ error: "Akses ditolak" });
  } catch {
    return res.status(401).json({ error: "Token tidak valid atau kedaluwarsa" });
  }
}
