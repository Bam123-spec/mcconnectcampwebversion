import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set("auth", "true", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("auth");

  return NextResponse.json({ ok: true });
}
