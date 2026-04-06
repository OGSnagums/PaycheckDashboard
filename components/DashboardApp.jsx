"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ACCENT_COLORS,
  BONUS_PRESET,
  PIE_COLORS,
  THEMES,
  deep,
  fmt,
  normalizeState,
  pct
} from "@/lib/dashboard-defaults";

function DonutChart({ data, size = 190, thickness = 26 }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return null;

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;
  const slices = data.map((item) => {
    const portion = item.value / total;
    const dash = circumference * portion;
    const offset = circumference * (1 - cumulative);
    cumulative += portion;
    return { ...item, dash, gap: circumference - dash, offset };
  });

  const topFive = data.filter((item) => item.value > 0).sort((a, b) => b.value - a.value).slice(0, 5);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,.05)" strokeWidth={thickness} />
        <g transform={`translate(${size / 2},${size / 2}) rotate(-90)`}>
          {slices.filter((slice) => slice.value > 0).map((slice) => (
            <circle
              key={slice.name}
              cx={0}
              cy={0}
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth={thickness}
              strokeLinecap="round"
              strokeDasharray={`${slice.dash - 1} ${slice.gap + 1}`}
              strokeDashoffset={-slice.offset + circumference}
            />
          ))}
        </g>
        <text x={size / 2} y={size / 2 - 9} textAnchor="middle" fill="#f0f0f0" fontSize="15" fontWeight="800">
          {fmt(total)}
        </text>
        <text x={size / 2} y={size / 2 + 10} textAnchor="middle" fill="#555" fontSize="9" fontWeight="700" letterSpacing="1">
          TOTAL
        </text>
      </svg>
      <div style={{ flex: 1, minWidth: 120 }}>
        {topFive.map((item) => (
          <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
            <div style={{ width: 7, height: 7, borderRadius: 3.5, background: item.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#999", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: item.color }}>{fmt(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StackedBars({ data, accentColor }) {
  const maxVal = Math.max(...data.map((item) => (item.bills || 0) + (item.invest || 0) + (item.left || 0)), 1);
  const width = 400;
  const height = 140;
  const barWidth = 34;
  const gap = 10;
  const total = data.length * (barWidth + gap) - gap;
  const xOffset = (width - total) / 2;

  return (
    <svg viewBox={`0 0 ${width} ${height + 22}`} style={{ width: "100%", height: "auto" }}>
      {[0.25, 0.5, 0.75, 1].map((fraction) => (
        <line
          key={fraction}
          x1={xOffset - 4}
          y1={height * (1 - fraction)}
          x2={xOffset + total + 4}
          y2={height * (1 - fraction)}
          stroke="rgba(255,255,255,.04)"
          strokeWidth="1"
        />
      ))}
      {data.map((item, index) => {
        const x = xOffset + index * (barWidth + gap);
        const billHeight = ((item.bills || 0) / maxVal) * height;
        const investHeight = ((item.invest || 0) / maxVal) * height;
        const leftHeight = ((item.left || 0) / maxVal) * height;
        let y = height;
        return (
          <g key={item.date}>
            {billHeight > 0 ? (() => {
              y -= billHeight;
              return <rect x={x} y={y} width={barWidth} height={billHeight} fill="#ef4444" opacity=".75" />;
            })() : null}
            {investHeight > 0 ? (() => {
              y -= investHeight;
              return <rect x={x} y={y} width={barWidth} height={investHeight} fill="#3b82f6" opacity=".8" />;
            })() : null}
            {leftHeight > 0 ? (() => {
              y -= leftHeight;
              return <rect x={x} y={y} width={barWidth} height={leftHeight} fill={accentColor} opacity=".9" rx="3" ry="3" />;
            })() : null}
            <text x={x + barWidth / 2} y={height + 15} textAnchor="middle" fill="#444" fontSize="8" fontWeight="700">
              {item.date}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function StatCard({ label, value, sub, color = "#c9a84c" }) {
  return (
    <div className="stat-card">
      <div className="label-cap" style={{ marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      {sub ? <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>{sub}</div> : null}
    </div>
  );
}

function ProgressBar({ value, max, color = "#c9a84c", label, showAmounts = true }) {
  const progress = Math.min(((value || 0) / (max || 1)) * 100, 100);
  return (
    <div style={{ marginBottom: 9 }}>
      {label ? (
        <div className="row-between" style={{ fontSize: 11, color: "#777", marginBottom: 5 }}>
          <span>{label}</span>
          {showAmounts ? <span style={{ color, fontWeight: 700 }}>{fmt(value)}</span> : null}
        </div>
      ) : null}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%`, background: color }} />
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange, color = "#c9a84c" }) {
  return (
    <div className="toggle-wrap" onClick={onChange}>
      <div className="toggle-track" style={{ background: checked ? color : "rgba(255,255,255,.08)" }}>
        <div className="toggle-thumb" style={{ left: checked ? 22 : 3 }} />
      </div>
      {label ? <span style={{ fontSize: 13, color: "#bbb" }}>{label}</span> : null}
    </div>
  );
}

function SliderRow({ label, value, onChange, min = 0, max = 1000, step = 5, color, icon }) {
  const accent = color || "#c9a84c";
  const [inputVal, setInputVal] = useState((+value || 0).toFixed(2));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setInputVal((+value || 0).toFixed(2));
  }, [value, focused]);

  function commit(raw) {
    const next = parseFloat(raw);
    if (!Number.isNaN(next) && next >= 0) onChange(Math.round(next * 100) / 100);
    else setInputVal((+value || 0).toFixed(2));
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div className="row-between" style={{ marginBottom: 7, gap: 8 }}>
        <span className="label-cap">{icon ? `${icon} ` : ""}{label}</span>
        <input
          type="number"
          inputMode="decimal"
          step=".01"
          min={min}
          className="num-input"
          value={inputVal}
          style={{ color: accent, width: 96 }}
          onFocus={() => setFocused(true)}
          onChange={(event) => setInputVal(event.target.value)}
          onBlur={(event) => {
            setFocused(false);
            commit(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              commit(event.currentTarget.value);
              event.currentTarget.blur();
            }
          }}
        />
      </div>
      <input
        type="range"
        className="slider"
        min={min}
        max={Math.max(max, +value || 0)}
        step={step}
        value={Math.min(+value || 0, Math.max(max, +value || 0))}
        onChange={(event) => onChange(parseFloat(event.target.value))}
        style={{ accentColor: accent }}
      />
    </div>
  );
}

function MoneyInput({ label, value, onChange, color, note }) {
  const accent = color || "#c9a84c";
  const [inputVal, setInputVal] = useState((+value || 0).toFixed(2));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setInputVal((+value || 0).toFixed(2));
  }, [value, focused]);

  function commit(raw) {
    const next = parseFloat(raw);
    if (!Number.isNaN(next) && next >= 0) onChange(Math.round(next * 100) / 100);
    else setInputVal((+value || 0).toFixed(2));
  }

  return (
    <div style={{ marginBottom: 10 }}>
      <div className="row-between" style={{ gap: 8 }}>
        <div>
          <div className="label-cap">{label}</div>
          {note ? <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>{note}</div> : null}
        </div>
        <input
          type="number"
          inputMode="decimal"
          step=".01"
          className="num-input"
          value={inputVal}
          style={{ color: accent, width: 110 }}
          onFocus={() => setFocused(true)}
          onChange={(event) => setInputVal(event.target.value)}
          onBlur={(event) => {
            setFocused(false);
            commit(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              commit(event.currentTarget.value);
              event.currentTarget.blur();
            }
          }}
        />
      </div>
    </div>
  );
}

function Toast({ msg, onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2600);
    return () => clearTimeout(timer);
  }, [onDone]);

  return <div className="toast">{msg}</div>;
}

function saveStatusTone(status) {
  if (status === "saving") return { color: "#c9a84c", label: "Saving..." };
  if (status === "error") return { color: "#ef4444", label: "Save failed" };
  if (status === "conflict") return { color: "#f97316", label: "Reload required" };
  if (status === "dirty") return { color: "#eab308", label: "Pending save" };
  return { color: "#22c55e", label: "Saved" };
}

function toCommandLabel(value, fallback = "goal") {
  const label = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  return label || fallback;
}

export default function DashboardApp({ initialDashboard, initialAudit, user }) {
  const [state, setStateRaw] = useState(() => normalizeState(initialDashboard.state));
  const [version, setVersion] = useState(initialDashboard.version);
  const [auditItems, setAuditItems] = useState(initialAudit || []);
  const [activeTab, setActiveTab] = useState("overview");
  const [isBonus, setIsBonus] = useState(false);
  const [toast, setToast] = useState(null);
  const [scenarioName, setScenarioName] = useState("");
  const [payMode, setPayMode] = useState("p2");
  const [saveStatus, setSaveStatus] = useState("saved");
  const [resetPending, setResetPending] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const lastSyncedRef = useRef(JSON.stringify(normalizeState(initialDashboard.state)));
  const saveTimerRef = useRef(null);

  const setState = (updater) => {
    setStateRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return next;
    });
    setSaveStatus("dirty");
  };

  useEffect(() => {
    const theme = THEMES[state.theme] || THEMES.dark;
    const root = document.documentElement.style;
    root.setProperty("--bg", theme.bg);
    root.setProperty("--surface", theme.surface);
    root.setProperty("--surface2", theme.surface2);
    root.setProperty("--accent", state.accentColor || "#c9a84c");
    root.setProperty("--gold", state.accentColor || "#c9a84c");
  }, [state.theme, state.accentColor]);

  async function refreshAudit() {
    const response = await fetch("/api/dashboard/audit");
    if (!response.ok) return;
    const payload = await response.json();
    setAuditItems(payload.items || []);
  }

  async function saveDashboard(snapshot) {
    setSaveStatus("saving");

    const response = await fetch("/api/dashboard", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: snapshot, version })
    });

    const payload = await response.json();

    if (response.status === 409) {
      setSaveStatus("conflict");
      setToast("Another session saved newer data. Reloaded latest.");
      setStateRaw(normalizeState(payload.current.state));
      setVersion(payload.current.version);
      lastSyncedRef.current = JSON.stringify(normalizeState(payload.current.state));
      await refreshAudit();
      return;
    }

    if (!response.ok) {
      throw new Error(payload.error || "Save failed.");
    }

    const normalized = normalizeState(payload.state);
    setStateRaw(normalized);
    setVersion(payload.version);
    lastSyncedRef.current = JSON.stringify(normalized);
    setSaveStatus("saved");
    await refreshAudit();
  }

  useEffect(() => {
    const snapshot = JSON.stringify(state);
    if (snapshot === lastSyncedRef.current) {
      if (saveStatus === "dirty") setSaveStatus("saved");
      return undefined;
    }

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveDashboard(state).catch((error) => {
        setSaveStatus("error");
        setToast(error.message || "Save failed");
      });
    }, 900);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [state]);

  const totals = useMemo(() => {
    const tBills = state.bills.filter((bill) => bill.active).reduce((sum, bill) => sum + (bill.amount || 0), 0);
    const tInvest = state.investments.filter((investment) => investment.active).reduce((sum, investment) => {
      const amount = investment.pct ? Math.round(state.paycheck * (investment.pct / 100) * 100) / 100 : investment.amount || 0;
      return sum + amount;
    }, 0);
    const tAlloc = tBills + tInvest + state.ccDebitAcct;
    const leftover = state.paycheck - tAlloc;
    return { tBills, tInvest, tAlloc, leftover, investPct: ((tInvest / state.paycheck) * 100).toFixed(1) };
  }, [state]);

  const modeLeftover = useMemo(() => {
    // Both P1 and P2 show checking-only leftover so the number is consistent.
    // P2 adds the p1Buffer (bills pre-paid by P1 that don't hit checking again).
    const checkingBills = state.bills.filter((bill) => bill.active && bill.rollsTo === null).reduce((sum, bill) => sum + (bill.amount || 0), 0);
    const tInvest = state.investments.filter((investment) => investment.active).reduce((sum, investment) => {
      const amount = investment.pct ? Math.round(state.paycheck * (investment.pct / 100) * 100) / 100 : investment.amount || 0;
      return sum + amount;
    }, 0);
    const buffer = payMode === "p2" ? (state.p1Buffer || 0) : 0;
    return state.paycheck + buffer - checkingBills - tInvest - state.ccDebitAcct;
  }, [payMode, state]);

  // effectiveLeft = what actually remains in Chase after bills, factoring in existing balance
  const effectiveLeft = modeLeftover + (state.chaseChecking || 0);

  const health = useMemo(() => {
    const left = effectiveLeft;
    if (left < 0) return { color: "#ef4444", label: "Over Budget", emoji: "🔴", bg: "rgba(239,68,68,.08)", border: "rgba(239,68,68,.3)" };
    if (left < 50) return { color: "#f97316", label: "Tight", emoji: "🟡", bg: "rgba(249,115,22,.08)", border: "rgba(249,115,22,.3)" };
    if (left < 150) return { color: "#eab308", label: "OK", emoji: "🟡", bg: "rgba(234,179,8,.08)", border: "rgba(234,179,8,.3)" };
    return { color: "#22c55e", label: "Healthy", emoji: "🟢", bg: "rgba(34,197,94,.08)", border: "rgba(34,197,94,.3)" };
  }, [effectiveLeft]);

  const btInfo = useMemo(() => {
    const bt = state.balanceTransfer;
    const end = new Date(bt.zeroEndDate);
    const now = new Date();
    const moLeft = Math.max(0, Math.floor((end - now) / (1000 * 60 * 60 * 24 * 30.44)));
    return { moLeft, util: ((bt.current / bt.limit) * 100).toFixed(1), avail: bt.limit - bt.current };
  }, [state.balanceTransfer]);

  const goalInfo = useMemo(() => {
    const now = new Date();
    return (state.goals || []).map((goal) => {
      const trip = new Date(goal.targetDate || "2099-01-01");
      const cycles = Math.max(0, Math.floor((trip - now) / (1000 * 60 * 60 * 24 * 14)));
      const gap = Math.max(0, (goal.target || 0) - (goal.saved || 0));
      return { ...goal, cyc: cycles, gap, perCycle: cycles > 0 ? gap / cycles : gap, pct: goal.target > 0 ? ((goal.saved || 0) / goal.target) * 100 : 0 };
    });
  }, [state.goals]);

  const ccPlan = useMemo(() => {
    const statements = state.ccStatements || { acc: 0, fcc: 0, ccc: 0 };
    const total = (statements.acc || 0) + (statements.fcc || 0) + (statements.ccc || 0);
    const perCycle = total / 2;
    const covered = state.ccDebitBalance || 0;
    const gap = Math.max(0, total - covered);
    const tc = state.travelCashback || { balance: 0, spaxxPct: 80, strkPct: 20 };
    const tcAfter = tc.balance - gap;
    const spaxx = tc.balance * (tc.spaxxPct / 100);
    const strk = tc.balance * (tc.strkPct / 100);
    const twoPayBudget = (state.ccDebitAcct || 0) * 2;
    const monthlyGap = Math.max(0, total - twoPayBudget);
    return {
      total,
      perCycle,
      covered,
      gap,
      tcAfter,
      spaxx,
      strk,
      twoPayBudget,
      monthlyGap,
      accHalf: (statements.acc || 0) / 2,
      fccHalf: (statements.fcc || 0) / 2,
      cccHalf: (statements.ccc || 0) / 2,
      tc
    };
  }, [state.ccStatements, state.ccDebitBalance, state.travelCashback, state.ccDebitAcct]);

  const pieData = useMemo(() => {
    const categories = {};
    state.bills.filter((bill) => bill.active).forEach((bill) => {
      categories[bill.label] = (categories[bill.label] || 0) + bill.amount;
    });
    if (state.ccDebitAcct > 0) categories["CC Debit Acct"] = state.ccDebitAcct;
    state.investments.filter((investment) => investment.active && investment.amount > 0).forEach((investment) => {
      categories[investment.label] = investment.amount;
    });
    if (totals.leftover > 0) categories["Left Over"] = totals.leftover;
    return Object.entries(categories).filter(([, value]) => value > 0).sort((a, b) => b[1] - a[1]).map(([name, value], index) => ({
      name,
      value,
      color: PIE_COLORS[index % PIE_COLORS.length]
    }));
  }, [state, totals.leftover]);

  const fidelity = [
    { label: "Rent", amount: state.bills.find((bill) => bill.id === "rent")?.amount || 0 },
    { label: "Balance Transfer", amount: state.bills.find((bill) => bill.id === "balanceXfer")?.amount || 0 },
    { label: "CC Debit Acct", amount: state.ccDebitAcct },
    { label: "Travel Fund", amount: state.investments.find((investment) => investment.id === "travelFund")?.amount || 0 }
  ];

  const checking = [
    { label: "Car Ins (Zelle)", amount: state.bills.find((bill) => bill.id === "carIns")?.amount || 0 },
    { label: "Internet (AT&T)", amount: state.bills.find((bill) => bill.id === "internet")?.amount || 0 },
    { label: "Water Bill", amount: state.bills.find((bill) => bill.id === "water")?.amount || 0 },
    { label: "Packery", amount: state.bills.find((bill) => bill.id === "packery")?.amount || 0 },
    { label: "Chase Balance", amount: state.chaseChecking || 0 },
    { label: "What's Left", amount: Math.max(0, modeLeftover) }
  ];

  const dispatchCommands = useMemo(() => {
    const rentBill = state.bills.find((bill) => bill.id === "rent");
    const primaryGoal = state.goals?.[0];
    const goalCommand = primaryGoal ? `${toCommandLabel(primaryGoal.label, "goal")} ${Math.round(primaryGoal.saved || 0)}` : "goal 0";

    return [
      { command: `rent ${Math.round(rentBill?.amount || 0)}`, description: `Set ${rentBill?.label || "Rent"} to ${fmt(rentBill?.amount || 0)}` },
      { command: `acc statement ${Math.round(state.ccStatements?.acc || 0)}`, description: "Update ACC statement balance" },
      { command: `fcc statement ${Math.round(state.ccStatements?.fcc || 0)}`, description: "Update FCC statement balance" },
      { command: `ccc statement ${Math.round(state.ccStatements?.ccc || 0)}`, description: "Update CCC statement balance" },
      { command: `travel cashback ${Math.round(state.travelCashback?.balance || 0)}`, description: "Update Travel/Cashback balance" },
      { command: `cc debit ${Math.round(state.ccDebitBalance || 0)}`, description: "Update CC debit balance" },
      { command: goalCommand, description: primaryGoal ? `Update ${primaryGoal.label} saved amount` : "Update goal saved amount" },
      { command: "bonus check", description: "Load bonus preset" },
      { command: "regular check", description: "Reset to regular" },
      { command: "i'm short", description: "Show what to cut" }
    ];
  }, [state.bills, state.ccDebitBalance, state.ccStatements, state.goals, state.travelCashback]);

  function showToast(message) {
    setToast(message);
  }

  function updateBill(id, amount) {
    setState((prev) => ({ ...prev, bills: prev.bills.map((bill) => bill.id === id ? { ...bill, amount: +amount || 0 } : bill) }));
  }

  function updateInvest(id, amount) {
    setState((prev) => ({ ...prev, investments: prev.investments.map((investment) => investment.id === id ? { ...investment, amount: +amount || 0 } : investment) }));
  }

  function toggleBill(id) {
    setState((prev) => ({ ...prev, bills: prev.bills.map((bill) => bill.id === id ? { ...bill, active: !bill.active } : bill) }));
  }

  function updateCCStat(card, value) {
    setState((prev) => ({ ...prev, ccStatements: { ...prev.ccStatements, [card]: +value || 0 } }));
  }

  function handleBonus() {
    if (!isBonus) {
      setState((prev) => ({
        ...prev,
        paycheck: BONUS_PRESET.paycheck,
        ccDebitAcct: BONUS_PRESET.ccDebitAcct,
        bills: prev.bills.map((bill) => ({ ...bill, amount: BONUS_PRESET.billOverrides[bill.id] ?? bill.amount })),
        investments: prev.investments.map((investment) => ({ ...investment, amount: BONUS_PRESET.investOverrides[investment.id] ?? investment.amount })),
        creditCards: prev.creditCards.map((card) => ({ ...card, balance: BONUS_PRESET.ccOverrides[card.id] ?? card.balance }))
      }));
      showToast("Bonus check loaded");
    } else {
      setState(deep(normalizeState(initialDashboard.state)));
      setVersion(initialDashboard.version);
      lastSyncedRef.current = JSON.stringify(normalizeState(initialDashboard.state));
      showToast("Regular base restored from server snapshot");
    }
    setIsBonus((current) => !current);
  }

  function saveScenario() {
    if (!scenarioName.trim()) return;
    const snapshot = {
      id: Date.now(),
      name: scenarioName.trim(),
      paycheck: state.paycheck,
      bills: deep(state.bills),
      investments: deep(state.investments),
      ccDebitAcct: state.ccDebitAcct,
      leftover: totals.leftover,
      savedAt: new Date().toLocaleDateString()
    };
    setState((prev) => ({ ...prev, scenarios: [...prev.scenarios, snapshot] }));
    setScenarioName("");
    showToast(`Saved: ${snapshot.name}`);
  }

  function loadScenario(scenario) {
    setState((prev) => ({ ...prev, paycheck: scenario.paycheck, bills: deep(scenario.bills), investments: deep(scenario.investments), ccDebitAcct: scenario.ccDebitAcct }));
    showToast(`Loaded: ${scenario.name}`);
  }

  function deleteScenario(id) {
    setState((prev) => ({ ...prev, scenarios: prev.scenarios.filter((scenario) => scenario.id !== id) }));
  }

  async function resetFromServer() {
    if (!window.confirm("Reset all data back to the seeded server defaults?")) return;
    setResetPending(true);

    try {
      const response = await fetch("/api/dashboard/reset", { method: "POST" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Reset failed.");
      const normalized = normalizeState(payload.state);
      setStateRaw(normalized);
      setVersion(payload.version);
      lastSyncedRef.current = JSON.stringify(normalized);
      setSaveStatus("saved");
      setIsBonus(false);
      showToast("Dashboard reset to defaults");
      await refreshAudit();
    } catch (error) {
      setSaveStatus("error");
      showToast(error.message || "Reset failed");
    } finally {
      setResetPending(false);
    }
  }

  async function logout() {
    setLogoutPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } finally {
      setLogoutPending(false);
    }
  }

  const accent = state.accentColor || "#c9a84c";
  const statusTone = saveStatusTone(saveStatus);

  return (
    <>
      <div id="root">
        <div className="topbar">
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, color: "#444", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 10 }}>
              CodexPaycheckDashboard · {payMode === "p1" ? "Paycheck 1" : "Paycheck 2"}
            </div>
            <div className="hero-number" style={{ color: health.color }}>{fmt(state.paycheck)}</div>
            <div className="health-pill" style={{ background: health.bg, borderColor: health.border, color: health.color }}>
              <span style={{ fontSize: 10 }}>{health.emoji}</span>
              <span>{health.label}</span>
              <span style={{ opacity: 0.6 }}>·</span>
              <span style={{ color: effectiveLeft < 0 ? "#ef4444" : "inherit" }}>
                {fmt(Math.abs(effectiveLeft))} {effectiveLeft < 0 ? "short" : "left"}
              </span>
            </div>
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span className="pill" style={{ border: `1px solid ${statusTone.color}33`, color: statusTone.color, background: `${statusTone.color}14` }}>
                {statusTone.label}
              </span>
              <span style={{ fontSize: 11, color: "#666" }}>{user.email}</span>
            </div>
          </div>
          <div style={{ textAlign: "right", paddingTop: 4 }}>
            <Toggle checked={isBonus} onChange={handleBonus} color={accent} />
            <div style={{ fontSize: 10, color: "#444", marginTop: 6, letterSpacing: ".06em", textTransform: "uppercase" }}>
              {isBonus ? "Bonus" : "Regular"}
            </div>
          </div>
        </div>

        <div className="stat-grid">
          <StatCard label="Bills" value={fmt(totals.tBills)} sub={`${pct(totals.tBills, state.paycheck)} of check`} color="#ef4444" />
          <StatCard label="Invested" value={fmt(totals.tInvest)} sub={`${totals.investPct}% of check`} color={accent} />
          <StatCard label="CC Debit" value={fmt(state.ccDebitAcct)} sub="Backend synced" color="#8b5cf6" />
          <StatCard
            label="What's Left"
            value={(effectiveLeft < 0 ? "-" : "") + fmt(Math.abs(effectiveLeft))}
            sub={
              effectiveLeft < 0
                ? `⚠️ Deposit ${fmt(Math.abs(effectiveLeft))} to cover`
                : payMode === "p2"
                  ? `P2 + ${state.p1BufferLabel || "P1 buffer"} (${fmt(state.p1Buffer || 0)})`
                  : "P1 view"
            }
            color={health.color}
          />
        </div>

        <div className="animate-pop" key={activeTab}>
          {activeTab === "overview" ? (
            <>
              <div className="card card-gold">
                <div className="sec-title">CC Statement Planner</div>
                <div className="row-between" style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: "#888" }}>Total Statements</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#ef4444" }}>{fmt(ccPlan.total)}</span>
                </div>
                <div className="row-between" style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: "#888" }}>In CC Debit Acct</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: ccPlan.covered >= ccPlan.total ? "#22c55e" : accent }}>{fmt(ccPlan.covered)}</span>
                </div>
                <div className="divider" />
                {ccPlan.gap > 0 ? (
                  <div className="alert-orange" style={{ marginTop: 10, fontSize: 11, color: "#fdba74" }}>
                    Pull {fmt(ccPlan.gap)} from Travel/Cashback. Leaves {fmt(ccPlan.tcAfter)}.
                  </div>
                ) : (
                  <div className="alert-green" style={{ marginTop: 10, fontSize: 11, color: "#86efac" }}>
                    Fully covered. {fmt(ccPlan.covered - ccPlan.total)} surplus in CC Debit Acct.
                  </div>
                )}
              </div>

              <div className="card">
                <div className="sec-title">Allocation Breakdown</div>
                <DonutChart data={pieData} size={180} thickness={24} />
              </div>

              <div className="card">
                <div className="sec-title">Account Flow</div>
                {[
                  { dest: "Fidelity", color: "#3b82f6", items: fidelity },
                  { dest: "Chase Checking", color: "#22c55e", items: checking }
                ].map((account) => (
                  <div key={account.dest} style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: account.color, marginBottom: 6, letterSpacing: ".1em", textTransform: "uppercase" }}>
                      {account.dest}
                    </div>
                    {account.items.filter((item) => item.amount > 0).map((item) => (
                      <div key={item.label} className="bill-row row-between">
                        <span style={{ fontSize: 12, color: "#999" }}>{item.label}</span>
                        <span style={{ fontSize: 13, color: account.color, fontWeight: 700 }}>{fmt(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="sec-title">Credit Card Statements</div>
                {state.creditCards.map((card) => {
                  const statement = state.ccStatements?.[card.id] || 0;
                  return (
                    <div key={card.id} style={{ marginBottom: 14 }}>
                      <div className="row-between" style={{ marginBottom: 4 }}>
                        <div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#ddd" }}>{card.label}</span>
                          <div style={{ fontSize: 10, color: "#555", marginTop: 1 }}>Half target {fmt(statement / 2)}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: card.color }}>{fmt(statement)}</div>
                          <div style={{ fontSize: 10, color: "#444", marginTop: 1 }}>statement balance</div>
                        </div>
                      </div>
                      <ProgressBar value={statement / 2} max={statement || 1} color={card.color} showAmounts={false} />
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}

          {activeTab === "adjust" ? (
            <>
              <div style={{ padding: "12px 12px 0" }}>
                <div className="mode-tab">
                  <button className={`mode-btn${payMode === "p1" ? " active" : ""}`} onClick={() => setPayMode("p1")}>Paycheck 1</button>
                  <button className={`mode-btn${payMode === "p2" ? " active" : ""}`} onClick={() => setPayMode("p2")}>Paycheck 2</button>
                </div>
              </div>

              <div className="card card-gold">
                <div className="sec-title">Paycheck</div>
                <SliderRow label="Take-Home Pay" value={state.paycheck} onChange={(value) => setState((prev) => ({ ...prev, paycheck: value }))} min={1500} max={8000} step={25} color="#22c55e" />
              </div>

              {payMode === "p1" ? (
                <div className="card card-gold">
                  <div className="sec-title">P1 Checking Buffer</div>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 10, color: "#555", marginBottom: 8 }}>
                      This amount is credited to P2&apos;s left-over (already funded by P1).
                      Set to <strong style={{ color: "#c9a84c" }}>$0</strong> if nothing carries forward this cycle.
                    </div>
                    <input
                      className="input"
                      placeholder="What does this buffer represent?"
                      value={state.p1BufferLabel || ""}
                      onChange={(e) => setState((prev) => ({ ...prev, p1BufferLabel: e.target.value }))}
                      style={{ fontSize: 12, marginBottom: 12 }}
                    />
                  </div>
                  <SliderRow
                    label={state.p1BufferLabel || "P1 Buffer"}
                    value={state.p1Buffer || 0}
                    onChange={(value) => setState((prev) => ({ ...prev, p1Buffer: value }))}
                    min={0}
                    max={300}
                    step={1}
                    color="#c9a84c"
                  />
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ marginTop: 4 }}
                    onClick={() => setState((prev) => ({ ...prev, p1Buffer: 0 }))}
                  >
                    Zero Out Buffer
                  </button>
                </div>
              ) : null}

              <div className="card">
                <div className="sec-title">Bills</div>
                {state.bills.filter((bill) => bill.active).map((bill) => (
                  bill.id === "otherCarIns" ? (
                    <React.Fragment key={bill.id}>
                      <SliderRow
                        label={bill.label}
                        icon={bill.icon}
                        value={bill.amount}
                        onChange={(value) => updateBill(bill.id, value)}
                        min={0}
                        max={Math.max(bill.amount * 2.5, 300)}
                        step={1}
                        color={accent}
                      />
                      <div style={{ marginTop: -10, marginBottom: 14, paddingLeft: 4 }}>
                        <input
                          className="input"
                          placeholder="What is this allocation for?"
                          value={bill.label}
                          onChange={(e) =>
                            setState((prev) => ({
                              ...prev,
                              bills: prev.bills.map((b) =>
                                b.id === "otherCarIns" ? { ...b, label: e.target.value } : b
                              )
                            }))
                          }
                          style={{ fontSize: 12, padding: "6px 12px", color: "#aaa" }}
                        />
                      </div>
                    </React.Fragment>
                  ) : (
                    <SliderRow
                      key={bill.id}
                      label={bill.label}
                      icon={bill.icon}
                      value={bill.amount}
                      onChange={(value) => updateBill(bill.id, value)}
                      min={0}
                      max={Math.max(bill.amount * 2.5, 300)}
                      step={1}
                      color={bill.account === "fidelity" ? "#3b82f6" : accent}
                    />
                  )
                ))}
              </div>

              <div className="card">
                <div className="sec-title">Investments</div>
                {state.investments.filter((investment) => investment.active).map((investment) => {
                  const amount = investment.pct ? Math.round(state.paycheck * (investment.pct / 100) * 100) / 100 : investment.amount || 0;
                  const label = investment.pct ? `${investment.label} (${investment.pct}% auto)` : investment.label;
                  return (
                    <SliderRow key={investment.id} label={label} icon={investment.icon} value={amount} onChange={(value) => updateInvest(investment.id, value)} min={0} max={1000} step={10} color={accent} />
                  );
                })}
              </div>

              <div className="card">
                <div className="sec-title">CC Debit Acct</div>
                <SliderRow label="CC Debit Transfer" value={state.ccDebitAcct} onChange={(value) => setState((prev) => ({ ...prev, ccDebitAcct: value }))} min={0} max={3500} step={25} color="#8b5cf6" />
                <div style={{ fontSize: 11, color: "#555" }}>
                  Target this cycle: <span style={{ color: accent, fontWeight: 700 }}>{fmt(ccPlan.perCycle)}</span>
                </div>
              </div>

              <div className="card">
                <div className="sec-title">Toggle Bills On / Off</div>
                {state.bills.map((bill) => (
                  <div key={bill.id} className="bill-row row-between">
                    <span style={{ fontSize: 13, color: bill.active ? "#e0e0e0" : "#444" }}>{bill.icon} {bill.label}</span>
                    <Toggle checked={bill.active} onChange={() => toggleBill(bill.id)} color={accent} />
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {activeTab === "scenarios" ? (
            <>
              <div className="card card-gold">
                <div className="sec-title">Save Snapshot</div>
                <div className="row" style={{ gap: 8 }}>
                  <input className="input" placeholder="Scenario name..." value={scenarioName} onChange={(event) => setScenarioName(event.target.value)} onKeyDown={(event) => event.key === "Enter" && saveScenario()} style={{ flex: 1 }} />
                  <button className="btn btn-primary" onClick={saveScenario}>Save</button>
                </div>
              </div>

              <div className="card">
                <div className="sec-title">Quick Presets</div>
                {[
                  { label: "Cut Packery → Travel Fund", action: () => { updateBill("packery", 0); updateInvest("travelFund", (state.investments.find((investment) => investment.id === "travelFund")?.amount || 0) + 75); showToast("Packery cut → Travel Fund +$75"); } },
                  { label: "Emergency: Zero Investments", action: () => state.investments.forEach((investment) => updateInvest(investment.id, 0)) },
                  { label: "Max Brazil Savings", action: () => { const amount = Math.max(0, totals.leftover - 50); updateInvest("travelFund", (state.investments.find((investment) => investment.id === "travelFund")?.amount || 0) + amount); showToast(`+${fmt(amount)} to Travel Fund`); } }
                ].map((preset) => (
                  <button key={preset.label} onClick={preset.action} className="btn btn-ghost" style={{ width: "100%", justifyContent: "flex-start", marginBottom: 6 }}>
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="card">
                <div className="sec-title">Saved Scenarios</div>
                {(state.scenarios || []).length === 0 ? (
                  <div style={{ fontSize: 12, color: "#666" }}>No scenarios yet.</div>
                ) : (state.scenarios || []).map((scenario) => (
                  <div key={scenario.id} className="bill-row row-between">
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#e0e0e0" }}>{scenario.name}</div>
                      <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{scenario.savedAt} · {fmt(scenario.paycheck)} · {fmt(scenario.leftover)} left</div>
                    </div>
                    <div className="row" style={{ gap: 6 }}>
                      <button className="btn btn-primary btn-sm" onClick={() => loadScenario(scenario)}>Load</button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteScenario(scenario.id)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {activeTab === "goals" ? (
            <>
              <div className="card card-gold">
                <div className="sec-title">Travel / Cashback Account</div>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: accent }}>{fmt(ccPlan.tc.balance)}</span>
                </div>
                <MoneyInput label="Account Balance" value={ccPlan.tc.balance} onChange={(value) => setState((prev) => ({ ...prev, travelCashback: { ...prev.travelCashback, balance: value } }))} color={accent} />
                <MoneyInput label="CC Debit Acct Balance" value={state.ccDebitBalance || 0} onChange={(value) => setState((prev) => ({ ...prev, ccDebitBalance: value }))} color="#8b5cf6" />
              </div>

              <div className="card">
                <div className="sec-title">CC Statement Planner</div>
                <MoneyInput label="ACC Statement" value={state.ccStatements?.acc || 0} onChange={(value) => updateCCStat("acc", value)} color="#8b5cf6" note={`÷ 2 = ${fmt((state.ccStatements?.acc || 0) / 2)}/cycle`} />
                <MoneyInput label="FCC Statement" value={state.ccStatements?.fcc || 0} onChange={(value) => updateCCStat("fcc", value)} color="#3b82f6" note={`÷ 2 = ${fmt((state.ccStatements?.fcc || 0) / 2)}/cycle`} />
                <MoneyInput label="CCC Statement" value={state.ccStatements?.ccc || 0} onChange={(value) => updateCCStat("ccc", value)} color="#22c55e" note={`÷ 2 = ${fmt((state.ccStatements?.ccc || 0) / 2)}/cycle`} />
              </div>

              {goalInfo.map((goal, index) => (
                <div key={goal.id} className="card card-gold" style={{ borderTopColor: `${goal.color}44` }}>
                  <div className="row-between" style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input value={goal.icon || "🎯"} onChange={(event) => setState((prev) => {
                        const items = [...prev.goals];
                        items[index] = { ...items[index], icon: event.target.value };
                        return { ...prev, goals: items };
                      })} style={{ background: "transparent", border: "none", fontSize: 20, width: 36, outline: "none" }} maxLength={4} />
                      <input value={goal.label} onChange={(event) => setState((prev) => {
                        const items = [...prev.goals];
                        items[index] = { ...items[index], label: event.target.value };
                        return { ...prev, goals: items };
                      })} style={{ background: "transparent", border: "none", borderBottom: "1px solid #333", color: "#ddd", fontSize: 13, fontWeight: 700, outline: "none", padding: "2px 0", width: 160 }} />
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={() => setState((prev) => ({ ...prev, goals: prev.goals.filter((_, itemIndex) => itemIndex !== index) }))}>Delete</button>
                  </div>
                  <ProgressBar value={goal.saved || 0} max={goal.target || 1} color={goal.color || accent} label={goal.label} />
                  <SliderRow label="Goal Amount" value={goal.target || 0} onChange={(value) => setState((prev) => {
                    const items = [...prev.goals];
                    items[index] = { ...items[index], target: value };
                    return { ...prev, goals: items };
                  })} min={100} max={10000} step={100} color={goal.color || accent} />
                  <SliderRow label="Already Saved" value={goal.saved || 0} onChange={(value) => setState((prev) => {
                    const items = [...prev.goals];
                    items[index] = { ...items[index], saved: value };
                    return { ...prev, goals: items };
                  })} min={0} max={goal.target || 10000} step={25} color="#22c55e" />
                </div>
              ))}

              <div className="card card-gold">
                <div className="sec-title">Chase Checking</div>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: health.color }}>
                    {(state.chaseChecking || 0) < 0 ? "-" : ""}{fmt(Math.abs(state.chaseChecking || 0))}
                  </span>
                </div>
                <MoneyInput
                  label="Chase Checking Balance"
                  value={state.chaseChecking || 0}
                  onChange={(value) => setState((prev) => ({ ...prev, chaseChecking: value }))}
                  color="#22c55e"
                  note="Enter how much is currently sitting in your Chase account"
                />

                <div style={{ marginTop: 14, padding: "10px 12px", borderRadius: 8, background: `${health.bg}`, border: `1px solid ${health.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: effectiveLeft < 0 ? 10 : 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: health.color, letterSpacing: ".04em", textTransform: "uppercase" }}>
                      {health.emoji} {health.label}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: health.color }}>
                      {effectiveLeft >= 0 ? "+" : ""}{fmt(effectiveLeft)}
                    </span>
                  </div>

                  {effectiveLeft < 0 ? (
                    <div>
                      <div style={{ fontSize: 11, color: "#aaa", marginBottom: 8 }}>
                        Deposit <strong style={{ color: "#ef4444" }}>{fmt(Math.abs(effectiveLeft))}</strong> into Chase to break even.
                        Or deposit more to reach a buffer:
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setState((prev) => ({ ...prev, chaseChecking: Math.abs(modeLeftover) }))}
                          style={{ fontSize: 11, borderColor: "rgba(239,68,68,.3)", color: "#ef4444" }}
                        >
                          Break Even {fmt(Math.abs(modeLeftover))}
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setState((prev) => ({ ...prev, chaseChecking: Math.abs(modeLeftover) + 100 }))}
                          style={{ fontSize: 11, borderColor: "rgba(249,115,22,.3)", color: "#f97316" }}
                        >
                          +$100 Buffer
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setState((prev) => ({ ...prev, chaseChecking: Math.abs(modeLeftover) + 250 }))}
                          style={{ fontSize: 11, borderColor: "rgba(234,179,8,.3)", color: "#eab308" }}
                        >
                          +$250 Buffer
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, color: "#555", marginTop: effectiveLeft < 150 ? 4 : 0 }}>
                      {effectiveLeft < 50
                        ? "Very tight — consider adding a buffer before bills post."
                        : effectiveLeft < 150
                          ? "OK but thin — a small buffer is recommended."
                          : "Covered. You have room to absorb unexpected charges."}
                    </div>
                  )}
                </div>

                {(state.travelCashback?.balance || 0) > 0 ? (
                  <div style={{ marginTop: 10, fontSize: 11, color: "#555" }}>
                    Chase + Travel Cashback:{" "}
                    <span style={{ color: "#22c55e", fontWeight: 700 }}>
                      {fmt((state.chaseChecking || 0) + (state.travelCashback?.balance || 0))}
                    </span>
                  </div>
                ) : null}
              </div>

              <button onClick={() => setState((prev) => ({ ...prev, goals: [...(prev.goals || []), { id: `goal_${Date.now()}`, label: "New Goal", icon: "🎯", target: 1000, saved: 0, targetDate: "", color: "#c9a84c" }] }))} style={{ width: "calc(100% - 24px)", margin: "0 12px 10px", padding: "12px", background: "rgba(255,255,255,.03)", border: "1px dashed #2a2a2a", borderRadius: 12, color: "#555", fontSize: 12, fontWeight: 700, letterSpacing: ".06em", cursor: "pointer" }}>
                + ADD GOAL
              </button>
            </>
          ) : null}

          {activeTab === "settings" ? (
            <>
              <div className="card">
                <div className="sec-title">Theme</div>
                <div className="h-scroll">
                  {Object.keys(THEMES).map((themeKey) => (
                    <button key={themeKey} onClick={() => setState((prev) => ({ ...prev, theme: themeKey }))} className="btn btn-ghost btn-sm" style={{ flexShrink: 0, borderColor: state.theme === themeKey ? accent : "rgba(255,255,255,.07)", color: state.theme === themeKey ? accent : "#666" }}>
                      {themeKey}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="sec-title">Accent Color</div>
                <div className="row" style={{ flexWrap: "wrap", gap: 10, marginTop: 4 }}>
                  {ACCENT_COLORS.map((color) => (
                    <div key={color} className={`theme-dot${state.accentColor === color ? " selected" : ""}`} style={{ background: color }} onClick={() => setState((prev) => ({ ...prev, accentColor: color }))} />
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="sec-title">Edit Bill Labels</div>
                {state.bills.map((bill) => (
                  <div key={bill.id} style={{ marginBottom: 8 }}>
                    <div className="row" style={{ gap: 8 }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{bill.icon}</span>
                      <input className="input" value={bill.label} onChange={(event) => setState((prev) => ({ ...prev, bills: prev.bills.map((item) => item.id === bill.id ? { ...item, label: event.target.value } : item) }))} style={{ flex: 1, fontSize: 13 }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="sec-title">Pay Period Start</div>
                <input type="date" className="input" value={state.payStartDate} onChange={(event) => setState((prev) => ({ ...prev, payStartDate: event.target.value }))} />
              </div>

              <div className="card card-gold">
                <div className="sec-title">Quick Update Fields</div>
                <MoneyInput
                  label={state.bills.find((bill) => bill.id === "rent")?.label || "Rent"}
                  value={state.bills.find((bill) => bill.id === "rent")?.amount || 0}
                  onChange={(value) => updateBill("rent", value)}
                  color={accent}
                />
                <MoneyInput
                  label="ACC Statement"
                  value={state.ccStatements?.acc || 0}
                  onChange={(value) => updateCCStat("acc", value)}
                  color="#8b5cf6"
                  note={`÷ 2 = ${fmt((state.ccStatements?.acc || 0) / 2)}/cycle`}
                />
                <MoneyInput
                  label="FCC Statement"
                  value={state.ccStatements?.fcc || 0}
                  onChange={(value) => updateCCStat("fcc", value)}
                  color="#3b82f6"
                  note={`÷ 2 = ${fmt((state.ccStatements?.fcc || 0) / 2)}/cycle`}
                />
                <MoneyInput
                  label="CCC Statement"
                  value={state.ccStatements?.ccc || 0}
                  onChange={(value) => updateCCStat("ccc", value)}
                  color="#22c55e"
                  note={`÷ 2 = ${fmt((state.ccStatements?.ccc || 0) / 2)}/cycle`}
                />
                <MoneyInput
                  label="Travel Cashback"
                  value={state.travelCashback?.balance || 0}
                  onChange={(value) => setState((prev) => ({ ...prev, travelCashback: { ...prev.travelCashback, balance: value } }))}
                  color={accent}
                />
                <MoneyInput
                  label="CC Debit Balance"
                  value={state.ccDebitBalance || 0}
                  onChange={(value) => setState((prev) => ({ ...prev, ccDebitBalance: value }))}
                  color="#8b5cf6"
                />
                <MoneyInput
                  label="Chase Checking"
                  value={state.chaseChecking || 0}
                  onChange={(value) => setState((prev) => ({ ...prev, chaseChecking: value }))}
                  color={health.color}
                  note={
                    effectiveLeft < 0
                      ? `⚠️ Enter at least ${fmt(Math.abs(modeLeftover))} to break even`
                      : `${health.emoji} ${health.label} · ${fmt(effectiveLeft)} remaining`
                  }
                />
                <MoneyInput
                  label={state.p1BufferLabel || "P1 Buffer"}
                  value={state.p1Buffer || 0}
                  onChange={(value) => setState((prev) => ({ ...prev, p1Buffer: value }))}
                  color="#c9a84c"
                  note="Credit to P2 left-over from P1"
                />
              </div>

              <div className="card">
                <div className="sec-title">Dispatch Commands</div>
                <div className="alert-gold" style={{ fontSize: 11, color: "#c9a84c", marginBottom: 10, letterSpacing: ".02em" }}>
                  Send from your phone to update instantly:
                </div>
                {dispatchCommands.map((item) => (
                  <div key={item.command} className="bill-row">
                    <div>
                      <code style={{ fontSize: 11, color: "#c9a84c", background: "rgba(201,168,76,.08)", border: "1px solid rgba(201,168,76,.2)", padding: "2px 8px", borderRadius: 5, letterSpacing: ".04em" }}>{item.command}</code>
                      <div style={{ fontSize: 11, color: "#555", marginTop: 4, letterSpacing: ".02em" }}>{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="sec-title">Goal Labels And Figures</div>
                {(state.goals || []).map((goal, index) => (
                  <div key={goal.id} style={{ marginBottom: index === state.goals.length - 1 ? 0 : 18 }}>
                    <div className="row" style={{ gap: 8, marginBottom: 10 }}>
                      <input
                        className="input"
                        value={goal.icon || "🎯"}
                        onChange={(event) => setState((prev) => {
                          const items = [...prev.goals];
                          items[index] = { ...items[index], icon: event.target.value };
                          return { ...prev, goals: items };
                        })}
                        style={{ width: 64, textAlign: "center", paddingInline: 10 }}
                        maxLength={4}
                      />
                      <input
                        className="input"
                        value={goal.label || ""}
                        onChange={(event) => setState((prev) => {
                          const items = [...prev.goals];
                          items[index] = { ...items[index], label: event.target.value };
                          return { ...prev, goals: items };
                        })}
                        style={{ flex: 1 }}
                        placeholder="Goal label"
                      />
                    </div>
                    <div className="row" style={{ gap: 8, marginBottom: 10 }}>
                      <input
                        type="date"
                        className="input"
                        value={goal.targetDate || ""}
                        onChange={(event) => setState((prev) => {
                          const items = [...prev.goals];
                          items[index] = { ...items[index], targetDate: event.target.value };
                          return { ...prev, goals: items };
                        })}
                        style={{ flex: 1 }}
                      />
                      <div style={{ minWidth: 112, fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: ".08em", alignSelf: "center" }}>
                        Command: {toCommandLabel(goal.label, "goal")}
                      </div>
                    </div>
                    <MoneyInput
                      label="Target Amount"
                      value={goal.target || 0}
                      onChange={(value) => setState((prev) => {
                        const items = [...prev.goals];
                        items[index] = { ...items[index], target: value };
                        return { ...prev, goals: items };
                      })}
                      color={goal.color || accent}
                    />
                    <MoneyInput
                      label="Saved Amount"
                      value={goal.saved || 0}
                      onChange={(value) => setState((prev) => {
                        const items = [...prev.goals];
                        items[index] = { ...items[index], saved: value };
                        return { ...prev, goals: items };
                      })}
                      color="#22c55e"
                    />
                    {index !== state.goals.length - 1 ? <div className="divider" /> : null}
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="sec-title">Audit Trail</div>
                {auditItems.length === 0 ? (
                  <div style={{ fontSize: 12, color: "#666" }}>No audit entries yet.</div>
                ) : auditItems.map((item) => (
                  <div key={item.id} className="bill-row row-between">
                    <div>
                      <div style={{ fontSize: 12, color: "#ddd", fontWeight: 700 }}>{item.actionType} · {item.fieldPath}</div>
                      <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{new Date(item.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="sec-title">Data</div>
                <button className="btn btn-ghost" style={{ width: "100%", marginBottom: 8 }} onClick={() => navigator.clipboard.writeText(JSON.stringify(state, null, 2)).then(() => showToast("Copied live data"))}>
                  Copy Current State
                </button>
                <button className="btn btn-danger" style={{ width: "100%", marginBottom: 8 }} disabled={resetPending} onClick={resetFromServer}>
                  {resetPending ? "Resetting..." : "Reset To Defaults"}
                </button>
                <button className="btn btn-ghost" style={{ width: "100%" }} disabled={logoutPending} onClick={logout}>
                  {logoutPending ? "Signing Out..." : "Sign Out"}
                </button>
              </div>
            </>
          ) : null}
        </div>

        <div className="tabbar">
          {[
            { id: "overview", icon: "🏠", label: "Home" },
            { id: "adjust", icon: "🎚", label: "Adjust" },
            { id: "scenarios", icon: "⚡", label: "Plans" },
            { id: "goals", icon: "🎯", label: "Goals" },
            { id: "settings", icon: "⚙️", label: "Settings" }
          ].map((tab) => (
            <button key={tab.id} className={`tab-btn${activeTab === tab.id ? " active" : ""}`} onClick={() => setActiveTab(tab.id)}>
              <span className="tab-icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {toast ? <Toast msg={toast} onDone={() => setToast(null)} /> : null}
      </div>

      <style jsx global>{`
        #root {
          max-width: 480px;
          margin: 0 auto;
          padding: 0 0 88px;
        }
        .card {
          background: linear-gradient(180deg, rgba(255,255,255,.025) 0%, transparent 100%);
          border: 1px solid var(--border);
          border-top-color: rgba(255,255,255,.09);
          border-radius: var(--r);
          padding: 16px 18px;
          margin: 0 12px 10px;
        }
        .card-gold { border-top-color: rgba(201,168,76,.35) !important; }
        .topbar { padding: 32px 18px 14px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
        .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 0 12px 10px; }
        .stat-card { background: linear-gradient(180deg, rgba(255,255,255,.03) 0%, transparent 100%); border: 1px solid var(--border); border-radius: var(--rs); padding: 12px 14px; }
        .divider { height: 1px; background: var(--border); margin: 10px 0; }
        .label-cap { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: var(--muted); }
        .sec-title { display: flex; align-items: center; gap: 9px; margin-bottom: 14px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: var(--muted); }
        .sec-title::before { content: ""; display: block; width: 3px; height: 13px; background: var(--gold); border-radius: 2px; flex-shrink: 0; }
        .row { display: flex; align-items: center; gap: 8px; }
        .row-between { display: flex; align-items: center; justify-content: space-between; }
        .pill { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; letter-spacing: .04em; }
        .progress-track { background: rgba(255,255,255,.06); border-radius: 4px; height: 5px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 4px; transition: width .5s cubic-bezier(.4,0,.2,1); }
        .toggle-wrap { display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; }
        .toggle-track { width: 42px; height: 24px; border-radius: 12px; position: relative; transition: background .2s; flex-shrink: 0; border: 1px solid rgba(255,255,255,.08); }
        .toggle-thumb { width: 18px; height: 18px; border-radius: 9px; background: #fff; position: absolute; top: 2px; transition: left .2s; box-shadow: 0 1px 6px rgba(0,0,0,.6); }
        .slider { -webkit-appearance: none; appearance: none; width: 100%; height: 3px; border-radius: 2px; outline: none; background: rgba(255,255,255,.1); }
        .slider::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 10px; background: var(--accent); cursor: pointer; box-shadow: 0 0 0 3px rgba(201,168,76,.2), 0 2px 8px rgba(0,0,0,.5); }
        .num-input { background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); border-radius: 7px; padding: 5px 10px; font-size: 14px; font-weight: 700; text-align: right; outline: none; color: var(--text); }
        .num-input::-webkit-inner-spin-button, .num-input::-webkit-outer-spin-button { -webkit-appearance: none; }
        .num-input:focus { border-color: var(--accent); box-shadow: 0 0 0 2px rgba(201,168,76,.15); }
        .input { background: rgba(255,255,255,.04); border: 1px solid var(--border); border-radius: var(--rs); padding: 10px 14px; color: var(--text); font-size: 14px; outline: none; width: 100%; transition: border-color .15s; }
        .input:focus { border-color: var(--gold); }
        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 18px; border-radius: var(--rs); border: none; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .15s; letter-spacing: .02em; }
        .btn-primary { background: var(--gold); color: #0a0a0a; font-weight: 700; }
        .btn-ghost { background: rgba(255,255,255,.05); color: var(--text); border: 1px solid var(--border); }
        .btn-danger { background: rgba(239,68,68,.08); color: var(--red); border: 1px solid rgba(239,68,68,.25); }
        .btn-sm { padding: 6px 12px; font-size: 12px; }
        .tabbar { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 480px; background: rgba(6,6,6,.92); backdrop-filter: blur(24px); border-top: 1px solid rgba(255,255,255,.07); display: flex; z-index: 100; padding-bottom: env(safe-area-inset-bottom,0); }
        .tab-btn { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px 0 8px; border: none; background: transparent; cursor: pointer; position: relative; font-size: 9px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--dim); gap: 4px; transition: color .2s; }
        .tab-btn.active { color: var(--gold); }
        .tab-btn.active::after { content: ""; position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%); width: 20px; height: 2px; background: var(--gold); border-radius: 1px; }
        .tab-icon { font-size: 18px; line-height: 1; }
        .alert-green { padding: 10px 14px; background: rgba(34,197,94,.07); border-radius: var(--rs); border-left: 2px solid var(--green); }
        .alert-orange { padding: 10px 14px; background: rgba(249,115,22,.07); border-radius: var(--rs); border-left: 2px solid var(--orange); }
        .bill-row { padding: 9px 0; border-bottom: 1px solid rgba(255,255,255,.04); display: flex; align-items: center; gap: 10px; }
        .h-scroll { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
        .h-scroll::-webkit-scrollbar { display: none; }
        .theme-dot { width: 26px; height: 26px; border-radius: 13px; cursor: pointer; border: 2px solid transparent; transition: border-color .15s, transform .15s; }
        .theme-dot.selected { border-color: var(--gold); transform: scale(1.15); }
        .toast { position: fixed; bottom: 96px; left: 50%; transform: translateX(-50%); background: rgba(15,15,15,.95); border: 1px solid var(--border-g); border-radius: 24px; padding: 10px 22px; font-size: 13px; font-weight: 600; color: var(--text); z-index: 200; box-shadow: 0 8px 32px rgba(0,0,0,.7); white-space: nowrap; }
        .hero-number { font-size: 52px; font-weight: 900; letter-spacing: -.03em; line-height: 1; }
        .health-pill { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px 4px 8px; border-radius: 20px; font-size: 11px; font-weight: 700; margin-top: 8px; border: 1px solid; }
        .mode-tab { display: flex; background: rgba(255,255,255,.04); border-radius: 10px; padding: 3px; margin-bottom: 14px; }
        .mode-btn { flex: 1; padding: 7px 0; border: none; border-radius: 8px; font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; cursor: pointer; transition: all .2s; background: transparent; color: var(--muted); }
        .mode-btn.active { background: var(--gold); color: #0a0a0a; }
        .animate-pop { animation: pop .18s ease; }
        @keyframes pop {
          0% { transform: scale(.98); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @media (max-width: 420px) {
          .topbar { padding-top: 20px; }
          .hero-number { font-size: 44px; }
        }
      `}</style>
    </>
  );
}
