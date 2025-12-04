import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { UserWithoutPassword } from "./db";
import type { Usuario } from "@prisma/client";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

export interface SessionData {
  user: UserWithoutPassword;
  expires: string;
}

export interface UsuarioSessionData {
  user: Omit<Usuario, "passwordHash">;
  expires: string;
}

export async function createSession(user: UserWithoutPassword) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const session = await new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expires)
    .sign(SECRET_KEY);

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
}

export async function createUsuarioSession(
  user: Omit<Usuario, "passwordHash">
) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const session = await new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expires)
    .sign(SECRET_KEY);

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) return null;

  try {
    const { payload } = await jwtVerify(session, SECRET_KEY);
    return payload as unknown as SessionData;
  } catch (error) {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.tipoUsuario !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }
  return session;
}

export async function getCurrentUser(): Promise<Omit<
  Usuario,
  "passwordHash"
> | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) return null;

  try {
    const { payload } = await jwtVerify(session, SECRET_KEY);
    return (payload as any).user;
  } catch (error) {
    return null;
  }
}

export async function requireUsuarioAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireUsuarioAdmin() {
  const user = await requireUsuarioAuth();
  if (user.tipoUsuario !== "Admin") {
    throw new Error("Forbidden: Admin access required");
  }
  return user;
}

export async function requireGerenciaPermission() {
  const user = await requireUsuarioAuth();
  if (user.cargo !== "Gerente" && user.cargo !== "Diretor") {
    throw new Error("Forbidden: Manager or Director access required");
  }
  return user;
}
