import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULTS, normalizeState, getChangedTopLevelPaths, getPayDates } from "../lib/dashboard-defaults.js";

test("legacy migration preserves user balances and adds missing cards once", () => {
  const saved = {
    creditCards: [{ id: "acc", label: "Old Apple label", balance: 123.45 }],
    ccStatements: { acc: 456.78 },
    goals: { trip: { label: "Trip", target: 2000, saved: 321 } }
  };
  const original = structuredClone(saved);
  const migrated = normalizeState(saved);
  assert.deepEqual(saved, original);
  assert.equal(migrated.creditCards.find(card => card.id === "acc").balance, 123.45);
  assert.equal(migrated.ccStatements.acc, 456.78);
  assert.equal(migrated.goals[0].saved, 321);
  assert.deepEqual(normalizeState(migrated), migrated);
  assert.equal(new Set(migrated.creditCards.map(card => card.id)).size, migrated.creditCards.length);
  for (const card of DEFAULTS.creditCards) {
    assert.ok(migrated.creditCards.some(item => item.id === card.id));
  }
});

test("new dashboard state does not share mutable defaults", () => {
  const before = structuredClone(DEFAULTS);
  const state = normalizeState(null);
  state.creditCards[0].label = "Changed";
  assert.deepEqual(DEFAULTS, before);
  assert.notEqual(normalizeState(null).creditCards[0].label, "Changed");
});

test("audit diff identifies changed and removed fields without unrelated entries", () => {
  assert.deepEqual(
    getChangedTopLevelPaths({ paycheck: 100, goals: [], old: true }, { paycheck: 200, goals: [] }),
    ["paycheck", "old"]
  );
  assert.deepEqual(getChangedTopLevelPaths(DEFAULTS, structuredClone(DEFAULTS)), []);
});

test("payday cadence crosses year boundaries every fourteen calendar days", () => {
  const dates = getPayDates("2026-12-23T12:00:00", 3);
  assert.deepEqual(dates.map(date => [date.getFullYear(), date.getMonth() + 1, date.getDate()]),
    [[2026, 12, 23], [2027, 1, 6], [2027, 1, 20]]);
});
