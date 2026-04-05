import { Pool } from "pg";

let pool;
let schemaReadyPromise;

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set.");
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false }
    });
  }

  return pool;
}

export async function query(text, params = []) {
  await ensureSchema();
  return getPool().query(text, params);
}

export async function withTransaction(run) {
  await ensureSchema();
  const client = await getPool().connect();
  try {
    await client.query("begin");
    const result = await run(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function ensureSchema() {
  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      const client = await getPool().connect();
      try {
        await client.query(`
          create table if not exists app_user (
            id bigserial primary key,
            email text not null unique,
            password_hash text not null,
            created_at timestamptz not null default now()
          );

          create table if not exists dashboard_state (
            id bigserial primary key,
            user_id bigint not null references app_user(id) on delete cascade,
            title text not null default 'CodexPaycheckDashboard',
            state_json jsonb not null,
            version integer not null default 1,
            created_at timestamptz not null default now(),
            updated_at timestamptz not null default now(),
            unique (user_id)
          );

          create table if not exists dashboard_audit_log (
            id bigserial primary key,
            user_id bigint not null references app_user(id) on delete cascade,
            dashboard_state_id bigint not null references dashboard_state(id) on delete cascade,
            action_type text not null,
            field_path text not null,
            old_value_json jsonb,
            new_value_json jsonb,
            created_at timestamptz not null default now()
          );
        `);
      } finally {
        client.release();
      }
    })();
  }

  return schemaReadyPromise;
}
