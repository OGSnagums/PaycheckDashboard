export const STORAGE_KEY = "ogs_budget_v3";

export const DEFAULTS = {
  paycheck: 2378.71,
  payStartDate: "2026-03-25",
  theme: "dark",
  accentColor: "#c9a84c",
  bills: [
    { id: "rent", label: "Rent", amount: 764.0, category: "housing", account: "fidelity", icon: "🏠", active: true, rollsTo: null },
    { id: "water", label: "Water Bill", amount: 54.03, category: "bills", account: "checking", icon: "💧", active: true, rollsTo: null, note: "Variable monthly — update each cycle" },
    { id: "carIns", label: "Car Insurance", amount: 37.52, category: "insurance", account: "checking", icon: "🚗", active: true, rollsTo: null, note: "Zelle sister EOM" },
    { id: "att", label: "AT&T Cellular", amount: 22.0, category: "bills", account: "checking", icon: "📱", active: true, rollsTo: "acc" },
    { id: "visaRecurring", label: "Visa Recurring", amount: 22.57, category: "subs", account: "checking", icon: "💳", active: true, rollsTo: "fcc" },
    { id: "balanceXfer", label: "Balance Transfer", amount: 65.5, category: "debt", account: "fidelity", icon: "🏦", active: true, rollsTo: null },
    { id: "appleRecurring", label: "Apple Card Recurring", amount: 29.07, category: "subs", account: "checking", icon: "🍎", active: true, rollsTo: "acc" },
    { id: "appleWatch", label: "Apple Watch + AirPods", amount: 98.08, category: "subs", account: "checking", icon: "⌚", active: true, rollsTo: "acc" },
    { id: "internet", label: "Internet (AT&T)", amount: 30.0, category: "bills", account: "checking", icon: "📡", active: true, rollsTo: null, note: "AT&T reduced rate" },
    { id: "packery", label: "Packery", amount: 75.0, category: "bills", account: "checking", icon: "📦", active: true, rollsTo: null },
    { id: "otherCarIns", label: "Other Half Car + Internet", amount: 67.52, category: "insurance", account: "checking", icon: "🚘", active: true, rollsTo: null }
  ],
  investments: [
    { id: "roth", label: "Roth IRA", amount: 0, icon: "📈", active: true, pct: 10 },
    { id: "crypto", label: "Crypto", amount: 0, icon: "₿", active: true },
    { id: "travelFund", label: "Travel Fund", amount: 0, icon: "✈️", account: "fidelity", active: true },
    { id: "savings", label: "Savings", amount: 0, icon: "🏦", active: true },
    { id: "stocks", label: "Stocks", amount: 0, icon: "📊", active: true }
  ],
  creditCards: [
    { id: "acc", label: "Apple Card", balance: 88.59, minPayment: 29.07, color: "#8b5cf6" },
    { id: "fcc", label: "Fidelity Visa Signature", balance: 0, minPayment: 22.57, color: "#3b82f6" },
    { id: "ccc", label: "Chase Credit Card", balance: 989.06, minPayment: 0, color: "#22c55e" },
    { id: "krw", label: "Kroger Rewards World Elite MasterCard", balance: 0, minPayment: 0, color: "#ef4444" }
  ],
  ccDebitAcct: 1006.0,
  ccStatements: { acc: 3041.14, fcc: 1820.39, ccc: 989.06, krw: 0 },
  ccDebitBalance: 4959.75,
  travelCashback: { balance: 2323.25, spaxxPct: 80, strkPct: 20 },
  chaseChecking: 0,
  p1Buffer: 67.52,
  p1BufferLabel: "Internet + Car Ins from P1",
  goals: [
    { id: "brazil", label: "Brazil Trip", icon: "🇧🇷", target: 2500, saved: 413, targetDate: "2026-08-25", color: "#ec4899" }
  ],
  installments: [
    { id: "airpods", label: "AirPods Pro 3", icon: "🎧", totalFinanced: 249, totalPaid: 207.5, remaining: 41.5, monthlyPayment: 41.5, currentInstallment: 6, totalInstallments: 6, nextDueDate: "2026-03-31", color: "#84cc16" },
    { id: "appleWatch", label: "Apple Watch", icon: "⌚", totalFinanced: 679, totalPaid: 509.22, remaining: 169.78, monthlyPayment: 56.58, currentInstallment: 10, totalInstallments: 12, nextDueDate: "2026-03-31", color: "#06b6d4" }
  ],
  balanceTransfer: { label: "BOA Visa -1006", original: 13580, current: 13036.4, limit: 14000, minPayment: 130, minBiweekly: 65.5, startDate: "2025-08-20", zeroEndDate: "2026-08-20" },
  scenarios: []
};

export const BONUS_PRESET = {
  paycheck: 5898.5,
  ccDebitAcct: 2921,
  billOverrides: { rent: 778.32, balanceXfer: 66.5, packery: 100, internet: 23.71, otherCarIns: 61.23 },
  investOverrides: { roth: 596, travelFund: 413 },
  ccOverrides: { acc: 947, fcc: 76, ccc: 0, krw: 0 }
};

export const THEMES = {
  dark: { bg: "#060606", surface: "#0f0f0f", surface2: "#181818" },
  midnight: { bg: "#030712", surface: "#0c1224", surface2: "#151e38" },
  navy: { bg: "#0a1628", surface: "#132044", surface2: "#1e3a5f" },
  carbon: { bg: "#080808", surface: "#111", surface2: "#1b1b1b" }
};

export const ACCENT_COLORS = ["#c9a84c", "#d97706", "#3b82f6", "#8b5cf6", "#10b981", "#ec4899", "#06b6d4", "#f97316"];
export const PIE_COLORS = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#3b82f6", "#06b6d4", "#8b5cf6", "#10b981", "#ec4899", "#c9a84c", "#6366f1", "#a855f7"];

export const fmt = (n) => "$" + Math.abs(+n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const pct = (p, w) => (w === 0 ? "0%" : ((p / w) * 100).toFixed(1) + "%");
export const deep = (o) => JSON.parse(JSON.stringify(o));

export function migrateState(s) {
  if (s.goals && !Array.isArray(s.goals)) {
    s.goals = Object.entries(s.goals).map(([id, g]) => ({ id, ...g, color: g.color || "#ec4899" }));
  }
  if (Array.isArray(s.creditCards)) {
    const nameMap = {
      acc: "Apple Card",
      fcc: "Fidelity Visa Signature",
      ccc: "Chase Credit Card",
      krw: "Kroger Rewards World Elite MasterCard"
    };
    const existingCards = s.creditCards.map((c) => ({ ...c, label: nameMap[c.id] || c.label }));
    const existingIds = new Set(existingCards.map((card) => card.id));
    const missingCards = DEFAULTS.creditCards
      .filter((card) => !existingIds.has(card.id))
      .map((card) => deep(card));
    s.creditCards = [...existingCards, ...missingCards];
  } else {
    s.creditCards = deep(DEFAULTS.creditCards);
  }
  if (!s.ccStatements || typeof s.ccStatements !== "object" || Array.isArray(s.ccStatements)) {
    s.ccStatements = deep(DEFAULTS.ccStatements);
  } else {
    s.ccStatements = {
      ...deep(DEFAULTS.ccStatements),
      ...s.ccStatements
    };
  }
  if (Array.isArray(s.bills)) {
    const rollsToMap = { att: "acc", visaRecurring: "fcc", appleRecurring: "acc", appleWatch: "acc" };
    s.bills = s.bills.map((b) => ({ rollsTo: rollsToMap[b.id] ?? null, ...b }));
  }
  if (Array.isArray(s.investments)) {
    s.investments = s.investments.map((i) => (i.id === "roth" && !i.pct ? { ...i, pct: 10, amount: 0 } : i));
  }
  return s;
}

export function normalizeState(stateJson) {
  return migrateState({ ...deep(DEFAULTS), ...deep(stateJson || {}) });
}

export function getPayDates(start, count = 8) {
  const dates = [];
  const d = new Date(start || "2026-03-25");
  for (let i = 0; i < count; i += 1) {
    dates.push(new Date(d));
    d.setDate(d.getDate() + 14);
  }
  return dates;
}

export function getChangedTopLevelPaths(prevState, nextState) {
  const keys = new Set([...Object.keys(prevState || {}), ...Object.keys(nextState || {})]);
  return [...keys].filter((key) => JSON.stringify(prevState?.[key]) !== JSON.stringify(nextState?.[key]));
}
