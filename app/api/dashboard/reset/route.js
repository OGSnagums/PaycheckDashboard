import { NextResponse } from "next/server";
import { getCurrentUserFromCookie } from "@/lib/session";
import { resetDashboardForUser } from "@/lib/dashboard-store";

export const runtime = "nodejs";

export async function POST() {
  const user = await getCurrentUserFromCookie();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dashboard = await resetDashboardForUser(user.id);
  return NextResponse.json(dashboard);
}
