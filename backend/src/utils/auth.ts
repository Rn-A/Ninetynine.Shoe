import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 10;

export const JWT_SECRET =
  process.env.JWT_SECRET || "dev-secret-ganti-di-production";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export interface JwtPayload {
  id: number;
  email: string;
  name: string;
  role: "admin" | "customer";
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  stored: string
): Promise<{ valid: boolean; needsRehash: boolean }> {
  if (stored.startsWith("$2a$") || stored.startsWith("$2b$")) {
    const valid = await bcrypt.compare(password, stored);
    return { valid, needsRehash: false };
  }
  if (stored === password) {
    return { valid: true, needsRehash: true };
  }
  return { valid: false, needsRehash: false };
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
