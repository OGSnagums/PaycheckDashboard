import crypto from "node:crypto";
import { query } from "@/lib/db";

const HASH_PREFIX = "scrypt";

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${HASH_PREFIX}:${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  const [prefix, salt, hash] = String(storedHash || "").split(":");
  if (prefix !== HASH_PREFIX || !salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(candidate, "hex"));
}

export async function ensureAdminUser() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set.");
  }

  const existing = await query("select id from app_user where email = $1 limit 1", [email.toLowerCase()]);
  if (existing.rowCount > 0) {
    return existing.rows[0];
  }

  const passwordHash = hashPassword(password);
  const inserted = await query(
    `insert into app_user (email, password_hash)
     values ($1, $2)
     returning id, email`,
    [email.toLowerCase(), passwordHash]
  );

  return inserted.rows[0];
}

export async function authenticateUser(email, password) {
  await ensureAdminUser();

  const result = await query(
    "select id, email, password_hash from app_user where email = $1 limit 1",
    [String(email || "").trim().toLowerCase()]
  );

  if (result.rowCount === 0) return null;
  const user = result.rows[0];
  if (!verifyPassword(password, user.password_hash)) return null;
  return { id: user.id, email: user.email };
}
