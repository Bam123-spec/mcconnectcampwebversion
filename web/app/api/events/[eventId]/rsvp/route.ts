import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/auth-session";
import { createServerSupabaseClient } from "@/lib/supabase";

type RouteContext = {
  params: Promise<{ eventId: string }>;
};

async function getRegistrationsCount(eventId: string) {
  const client = createServerSupabaseClient();
  const { count, error } = await client
    .from("event_registrations")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId);

  if (error) {
    return { count: 0, error };
  }

  return { count: count ?? 0, error: null };
}

export async function POST(_request: Request, { params }: RouteContext) {
  const session = await getAuthenticatedClient();

  if (!session) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const { eventId } = await params;
  const { error } = await session.client.from("event_registrations").upsert(
    {
      event_id: eventId,
      user_id: session.user.id,
    },
    { onConflict: "event_id,user_id" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const countResult = await getRegistrationsCount(eventId);

  return NextResponse.json({
    isRegistered: true,
    registrationsCount: countResult.count,
  });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await getAuthenticatedClient();

  if (!session) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const { eventId } = await params;
  const { error } = await session.client
    .from("event_registrations")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", session.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const countResult = await getRegistrationsCount(eventId);

  return NextResponse.json({
    isRegistered: false,
    registrationsCount: countResult.count,
  });
}
