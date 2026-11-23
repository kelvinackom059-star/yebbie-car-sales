import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// HOW LOGIN SESSIONS WORK
// 1. When someone logs in, we create a small signed token (a JWT) that says
//    "this is user X, role Y, valid until Z".
// 2. We store it in an httpOnly cookie, so the browser sends it with every
//    request, but JavaScript on the page can't read or steal it.
// 3. On every request we check the signature with SESSION_SECRET. If anyone
//    edits the token (e.g. changes CUSTOMER to ADMIN), the signature breaks
//    and we reject it.

const COOKIE_NAME = "yebbie_session";
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export type SessionPayload = {
  userId: string;
  role: "CUSTOMER" | "ADMIN";
};

function getKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET is missing or too short. Add it to your .env file.");
  }
  return new TextEncoder().encode(secret);
}

export async function encrypt(payload: SessionPayload, expiresAt: Date) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getKey());
}

export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(), { algorithms: ["HS256"] });
    return { userId: payload.userId as string, role: payload.role as SessionPayload["role"] };
  } catch {
    return null; // expired, tampered with, or not a real token
  }
}

export async function createSession(payload: SessionPayload) {
  const expiresAt = new Date(Date.now() + SEVEN_DAYS);
  const token = await encrypt(payload, expiresAt);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true, // JavaScript in the browser can't read it
    secure: process.env.NODE_ENV === "production", // HTTPS only once live
    sameSite: "lax", // not sent on requests from other websites
    expires: expiresAt,
    path: "/",
  });
}

export async function readSession() {
  const cookieStore = await cookies();
  return decrypt(cookieStore.get(COOKIE_NAME)?.value);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
