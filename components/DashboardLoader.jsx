"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardApp from "@/components/DashboardApp";

export default function DashboardLoader() {
  const router = useRouter();
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [dashboardResponse, auditResponse] = await Promise.all([
          fetch("/api/dashboard", { cache: "no-store" }),
          fetch("/api/dashboard/audit", { cache: "no-store" })
        ]);

        if (dashboardResponse.status === 401 || auditResponse.status === 401) {
          router.replace("/login");
          return;
        }

        const dashboard = await dashboardResponse.json();
        const audit = await auditResponse.json();

        if (!dashboardResponse.ok) {
          throw new Error(dashboard.error || "Failed to load dashboard.");
        }
        if (!auditResponse.ok) {
          throw new Error(audit.error || "Failed to load audit trail.");
        }

        if (active) {
          setPayload({
            initialDashboard: dashboard,
            initialAudit: audit.items || [],
            user: dashboard.user || { email: "Signed In" }
          });
        }
      } catch (err) {
        if (active) setError(err.message || "Failed to load dashboard.");
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [router]);

  if (error) {
    return (
      <main className="login-shell">
        <section className="login-card">
          <h1 className="login-title">CodexPaycheckDashboard</h1>
          <p className="login-copy">{error}</p>
        </section>
      </main>
    );
  }

  if (!payload) {
    return (
      <main className="login-shell">
        <section className="login-card">
          <div className="spin" style={{ margin: "0 auto 14px" }} />
          <p className="login-copy" style={{ textAlign: "center", marginBottom: 0 }}>Loading your live dashboard...</p>
        </section>
      </main>
    );
  }

  return <DashboardApp {...payload} />;
}
