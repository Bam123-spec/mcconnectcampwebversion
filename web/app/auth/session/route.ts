import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/auth-session";
import { createServerSupabaseClient } from "@/lib/supabase";

const cookieOptions = {
  path: "/",
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  } | null;

  if (!body?.access_token || !body.refresh_token) {
    return NextResponse.json({ ok: false, error: "Missing session tokens" }, { status: 400 });
  }

  const client = createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser(body.access_token);

  if (error || !user) {
    return NextResponse.json({ ok: false, error: "Invalid session" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, body.access_token, {
    ...cookieOptions,
    maxAge: body.expires_in ?? 60 * 60,
  });
  cookieStore.set(REFRESH_TOKEN_COOKIE, body.refresh_token, {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ ok: true, user: { id: user.id, email: user.email } });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
  cookieStore.delete("auth");

  return NextResponse.json({ ok: true });
}
