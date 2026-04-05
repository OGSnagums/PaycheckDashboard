import crypto from "node:crypto";
import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set.");
}
if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
  throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false }
});

const salt = crypto.randomBytes(16).toString("hex");
const hash = crypto.scryptSync(process.env.ADMIN_PASSWORD, salt, 64).toString("hex");
const passwordHash = `scrypt:${salt}:${hash}`;

await pool.query(`
  create table if not exists app_user (
    id bigserial primary key,
    email text not null unique,
    password_hash text not null,
    created_at timestamptz not null default now()
  );
`);

const result = await pool.query(
  `insert into app_user (email, password_hash)
   values ($1, $2)
   on conflict (email) do update set email = excluded.email
   returning id, email`,
  [process.env.ADMIN_EMAIL.toLowerCase(), passwordHash]
);

console.log(`Seeded admin user: ${result.rows[0].email}`);
await pool.end();
