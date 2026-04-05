import crypto from "node:crypto";
import { cookies } from "next/headers";
import { query } from "@/lib/db";

const COOKIE_NAME = "codex_paycheck_session";
const SESSION_DAYS = 30;

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET must be set.");
  }
  return secret;
}

function signValue(value) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function encodeSession(payload) {
  const raw = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = signValue(raw);
  return `${raw}.${signature}`;
}

function decodeSession(token) {
  if (!token) return null;
  const [raw, signature] = token.split(".");
  if (!raw || !signature) return null;
  if (signValue(raw) !== signature) return null;

  const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
  if (!parsed.exp || Date.now() > parsed.exp) return null;
  return parsed;
}

export async function createSessionCookie(user) {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const token = encodeSession({ userId: user.id, email: user.email, exp: expires });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expires)
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0)
  });
}

export async function getCurrentUserFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const session = decodeSession(token);
  if (!session?.userId) return null;

  const result = await query("select id, email from app_user where id = $1 limit 1", [session.userId]);
  if (result.rowCount === 0) return null;
  return result.rows[0];
}
