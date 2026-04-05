import { NextResponse } from "next/server";
import { getCurrentUserFromCookie } from "@/lib/session";
import { listAuditForUser } from "@/lib/dashboard-store";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUserFromCookie();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const audit = await listAuditForUser(user.id, 30);
  return NextResponse.json({ items: audit });
}
