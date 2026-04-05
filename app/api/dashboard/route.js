import { NextResponse } from "next/server";
import { getCurrentUserFromCookie } from "@/lib/session";
import { getOrCreateDashboardForUser, updateDashboardForUser } from "@/lib/dashboard-store";

export const runtime = "nodejs";

async function requireUser() {
  const user = await getCurrentUserFromCookie();
  if (!user) {
    return null;
  }
  return user;
}

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dashboard = await getOrCreateDashboardForUser(user.id);
  return NextResponse.json({ ...dashboard, user: { id: user.id, email: user.email } });
}

export async function PUT(request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  try {
    const dashboard = await updateDashboardForUser(user.id, body.state, body.version);
    return NextResponse.json(dashboard);
  } catch (error) {
    if (error.code === "VERSION_CONFLICT") {
      return NextResponse.json(
        { error: "Version conflict", current: error.current },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: error.message || "Save failed." }, { status: 500 });
  }
}
