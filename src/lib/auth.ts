import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "optiforge_2026_default_secret_jwt";

export interface SessionUser {
  id: string;
  role: "ADMIN" | "JUDGE" | "TEAM";
  name: string;
  code?: string;
  email?: string;
  domainId?: string | null;
}

export function signToken(payload: SessionUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch {
    return null;
  }
}

export function signRegistrationToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "2d" });
}

export function verifyRegistrationToken(token: string): any | null {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getServerSession(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("optiforge_session")?.value;
  if (!token) return null;
  return verifyToken(token);
}
