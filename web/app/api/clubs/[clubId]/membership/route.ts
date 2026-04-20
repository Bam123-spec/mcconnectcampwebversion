import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/auth-session";

type RouteContext = {
  params: Promise<{ clubId: string }>;
};

export async function POST(_request: Request, { params }: RouteContext) {
  const session = await getAuthenticatedClient();

  if (!session) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const { clubId } = await params;

  const { data: existingMembership, error: existingError } = await session.client
    .from("club_members")
    .select("id,status")
    .eq("club_id", clubId)
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  if (existingMembership) {
    return NextResponse.json({
      status: existingMembership.status,
      membershipId: existingMembership.id,
    });
  }

  const { data, error } = await session.client
    .from("club_members")
    .insert({
      club_id: clubId,
      user_id: session.user.id,
      status: "approved",
    })
    .select("id,status")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    status: data.status,
    membershipId: data.id,
  });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await getAuthenticatedClient();

  if (!session) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const { clubId } = await params;
  const { error } = await session.client
    .from("club_members")
    .delete()
    .eq("club_id", clubId)
    .eq("user_id", session.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: null });
}
