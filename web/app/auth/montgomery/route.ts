import { NextResponse } from "next/server";

const mcLoginUrl =
  process.env.MC_LOGIN_URL ||
  process.env.NEXT_PUBLIC_MC_LOGIN_URL ||
  "";

export async function GET(request: Request) {
  if (!mcLoginUrl) {
    return NextResponse.redirect(new URL("/login?error=mc_unavailable", request.url));
  }

  return NextResponse.redirect(mcLoginUrl);
}
