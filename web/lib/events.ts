import type { WebEventCardEvent } from "@/components/events/EventCard";
import { getAuthenticatedClient } from "@/lib/auth-session";
import { createServerSupabaseClient } from "@/lib/supabase";

export type EventDetail = WebEventCardEvent & {
  day?: string | null;
  club_id?: string | null;
  registrationsCount: number;
  clubName?: string | null;
  clubDescription?: string | null;
  clubMeetingTime?: string | null;
  isFree?: boolean;
  hasSession: boolean;
  isRegistered: boolean;
};

type EventRow = Pick<
  WebEventCardEvent,
  "id" | "name" | "description" | "location" | "date" | "time" | "cover_image_url" | "audience_count"
> & {
  day?: string | null;
  club_id?: string | null;
  created_at?: string | null;
};

type ClubRow = {
  name: string | null;
  description: string | null;
  day: string | null;
  time: string | null;
};

const eventSelect = "id,name,description,location,date,day,time,cover_image_url,club_id";

const detectFreeEvent = (name: string, description: string | null | undefined) =>
  /\bfree\b|complimentary|no cost|open to all/i.test(`${name} ${description ?? ""}`);

const normalizeEvent = (row: EventRow): EventDetail => ({
  id: row.id,
  name: row.name,
  description: row.description || "Details will be shared soon.",
  location: row.location || "Location to be announced",
  date: row.date || "",
  time: row.time || "",
  cover_image_url: row.cover_image_url || null,
  audience_count: row.audience_count,
  day: row.day || null,
  club_id: row.club_id || null,
  registrationsCount: 0,
  clubName: null,
  clubDescription: null,
  clubMeetingTime: null,
  isFree: detectFreeEvent(row.name, row.description),
  hasSession: false,
  isRegistered: false,
});

export async function getPublicEvents(): Promise<EventDetail[]> {
  const client = createServerSupabaseClient();
  const session = await getAuthenticatedClient();

  try {
    const { data, error } = await client
      .from("events")
      .select(eventSelect)
      .order("date", { ascending: true, nullsFirst: false })
      .order("day", { ascending: true, nullsFirst: false });

    if (error) {
      throw error;
    }

    if (!data?.length) {
      return [];
    }

    const rows = data as EventRow[];
    const eventIds = rows.map((row) => row.id);
    const clubIds = [...new Set(rows.map((row) => row.club_id).filter((value): value is string => Boolean(value)))];

    const [registrationResult, clubResult, viewerRegistrationResult] = await Promise.all([
      eventIds.length
        ? client.from("event_registrations").select("event_id").in("event_id", eventIds)
        : Promise.resolve({ data: [], error: null } as const),
      clubIds.length
        ? client.from("clubs").select("id,name,description,day,time").in("id", clubIds)
        : Promise.resolve({ data: [], error: null } as const),
      session && eventIds.length
        ? session.client
            .from("event_registrations")
            .select("event_id")
            .eq("user_id", session.user.id)
            .in("event_id", eventIds)
        : Promise.resolve({ data: [], error: null } as const),
    ]);

    if (registrationResult.error) {
      console.error("Error fetching event registration counts:", registrationResult.error);
    }

    if (clubResult.error) {
      console.error("Error fetching club metadata for events:", clubResult.error);
    }

    if (viewerRegistrationResult.error) {
      console.error("Error fetching viewer event registrations:", viewerRegistrationResult.error);
    }

    const registrationsByEventId = new Map<string, number>();
    (registrationResult.data || []).forEach((registration: { event_id: string }) => {
      registrationsByEventId.set(
        registration.event_id,
        (registrationsByEventId.get(registration.event_id) || 0) + 1,
      );
    });

    const clubsById = new Map<string, ClubRow & { id: string }>();
    (clubResult.data || []).forEach((club: ClubRow & { id: string }) => {
      clubsById.set(club.id, club);
    });

    const viewerRegisteredEventIds = new Set(
      (viewerRegistrationResult.data || []).map((registration: { event_id: string }) => registration.event_id),
    );

    return rows.map((row) => {
      const event = normalizeEvent(row);
      const club = row.club_id ? clubsById.get(row.club_id) : null;

      return {
        ...event,
        registrationsCount: registrationsByEventId.get(row.id) || 0,
        clubName: club?.name ?? (row.club_id ? "Campus club" : "Campus office"),
        clubDescription: club?.description ?? null,
        clubMeetingTime: [club?.day, club?.time].filter(Boolean).join(" at ") || null,
        hasSession: Boolean(session),
        isRegistered: viewerRegisteredEventIds.has(row.id),
      };
    });
  } catch (error) {
    console.error("Error fetching public events:", error);
    return [];
  }
}

async function getClubMetadata(clubId: string) {
  const client = createServerSupabaseClient();

  const { data, error } = await client
    .from("clubs")
    .select("name,description,day,time")
    .eq("id", clubId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as ClubRow;
}

async function getRegistrationsCount(eventId: string) {
  const client = createServerSupabaseClient();

  const { data, error } = await client.from("event_registrations").select("id").eq("event_id", eventId);

  if (error || !data) {
    return 0;
  }

  return data.length;
}

export async function getEventById(id: string): Promise<EventDetail | null> {
  const client = createServerSupabaseClient();
  const session = await getAuthenticatedClient();

  try {
    const { data, error } = await client.from("events").select(eventSelect).eq("id", id).maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      const event = normalizeEvent(data as EventRow);
      const [registrationsCount, club, viewerRegistrationResult] = await Promise.all([
        getRegistrationsCount(event.id),
        event.club_id ? getClubMetadata(event.club_id) : Promise.resolve(null),
        session
          ? session.client
              .from("event_registrations")
              .select("id")
              .eq("event_id", event.id)
              .eq("user_id", session.user.id)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null } as const),
      ]);

      if (viewerRegistrationResult.error) {
        console.error("Error fetching viewer event registration:", viewerRegistrationResult.error);
      }

      return {
        ...event,
        registrationsCount,
        clubName: club?.name ?? null,
        clubDescription: club?.description ?? null,
        clubMeetingTime: [club?.day, club?.time].filter(Boolean).join(" at ") || null,
        hasSession: Boolean(session),
        isRegistered: Boolean(viewerRegistrationResult.data),
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching event detail:", error);
    return null;
  }
}
