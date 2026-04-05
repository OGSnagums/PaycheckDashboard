import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";
import { createSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const user = await authenticateUser(body.email, body.password);

  if (!user) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await createSessionCookie(user);
  return NextResponse.json({ ok: true, user });
}
