import { DEFAULTS, deep, getChangedTopLevelPaths, normalizeState } from "@/lib/dashboard-defaults";
import { ensureAdminUser } from "@/lib/auth";
import { query, withTransaction } from "@/lib/db";

function mapDashboardRow(row) {
  return {
    id: row.id,
    title: row.title,
    version: row.version,
    state: normalizeState(row.state_json),
    updatedAt: row.updated_at
  };
}

export async function getOrCreateDashboardForUser(userId) {
  await ensureAdminUser();

  const existing = await query(
    `select id, title, state_json, version, updated_at
     from dashboard_state
     where user_id = $1
     limit 1`,
    [userId]
  );

  if (existing.rowCount > 0) {
    return mapDashboardRow(existing.rows[0]);
  }

  const inserted = await query(
    `insert into dashboard_state (user_id, title, state_json, version)
     values ($1, 'CodexPaycheckDashboard', $2::jsonb, 1)
     returning id, title, state_json, version, updated_at`,
    [userId, JSON.stringify(deep(DEFAULTS))]
  );

  return mapDashboardRow(inserted.rows[0]);
}

export async function updateDashboardForUser(userId, nextState, expectedVersion) {
  return withTransaction(async (client) => {
    const current = await client.query(
      `select id, title, state_json, version, updated_at
       from dashboard_state
       where user_id = $1
       limit 1
       for update`,
      [userId]
    );

    if (current.rowCount === 0) {
      throw new Error("Dashboard missing for user.");
    }

    const currentRow = current.rows[0];
    if (Number(expectedVersion) !== Number(currentRow.version)) {
      const error = new Error("Version conflict");
      error.code = "VERSION_CONFLICT";
      error.current = mapDashboardRow(currentRow);
      throw error;
    }

    const normalizedNext = normalizeState(nextState);
    const changedPaths = getChangedTopLevelPaths(currentRow.state_json, normalizedNext);
    const nextVersion = Number(currentRow.version) + 1;

    const updated = await client.query(
      `update dashboard_state
       set state_json = $2::jsonb,
           version = $3,
           updated_at = now()
       where user_id = $1
       returning id, title, state_json, version, updated_at`,
      [userId, JSON.stringify(normalizedNext), nextVersion]
    );

    const updatedRow = updated.rows[0];
    const auditPaths = changedPaths.length > 0 ? changedPaths : ["state"];

    for (const fieldPath of auditPaths) {
      await client.query(
        `insert into dashboard_audit_log
         (user_id, dashboard_state_id, action_type, field_path, old_value_json, new_value_json)
         values ($1, $2, 'update', $3, $4::jsonb, $5::jsonb)`,
        [
          userId,
          updatedRow.id,
          fieldPath,
          JSON.stringify(currentRow.state_json?.[fieldPath] ?? null),
          JSON.stringify(normalizedNext?.[fieldPath] ?? null)
        ]
      );
    }

    return mapDashboardRow(updatedRow);
  });
}

export async function resetDashboardForUser(userId) {
  return withTransaction(async (client) => {
    const current = await client.query(
      `select id, state_json, version
       from dashboard_state
       where user_id = $1
       limit 1
       for update`,
      [userId]
    );

    if (current.rowCount === 0) {
      throw new Error("Dashboard missing for user.");
    }

    const currentRow = current.rows[0];
    const nextVersion = Number(currentRow.version) + 1;
    const normalized = normalizeState(DEFAULTS);

    const updated = await client.query(
      `update dashboard_state
       set state_json = $2::jsonb,
           version = $3,
           updated_at = now()
       where user_id = $1
       returning id, title, state_json, version, updated_at`,
      [userId, JSON.stringify(normalized), nextVersion]
    );

    await client.query(
      `insert into dashboard_audit_log
       (user_id, dashboard_state_id, action_type, field_path, old_value_json, new_value_json)
       values ($1, $2, 'reset', 'state', $3::jsonb, $4::jsonb)`,
      [userId, updated.rows[0].id, JSON.stringify(currentRow.state_json), JSON.stringify(normalized)]
    );

    return mapDashboardRow(updated.rows[0]);
  });
}

export async function listAuditForUser(userId, limit = 20) {
  const result = await query(
    `select id, action_type, field_path, old_value_json, new_value_json, created_at
     from dashboard_audit_log
     where user_id = $1
     order by created_at desc
     limit $2`,
    [userId, limit]
  );

  return result.rows.map((row) => ({
    id: row.id,
    actionType: row.action_type,
    fieldPath: row.field_path,
    oldValue: row.old_value_json,
    newValue: row.new_value_json,
    createdAt: row.created_at
  }));
}
