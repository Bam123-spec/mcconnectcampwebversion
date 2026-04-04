import { supabase } from "@/lib/supabase";
import { Event } from "@/types/database";

type EventFilter = "All" | "Upcoming" | "Today";

type EventsPageOptions = {
    page?: number;
    pageSize?: number;
    filter?: EventFilter;
    registeredOnly?: boolean;
};

const EVENT_SELECT = `
    id,
    name,
    description,
    location,
    date,
    day,
    time,
    cover_image_url,
    club_id
`;
const EVENT_DETAIL_SELECT = EVENT_SELECT;

const todayString = () => new Date().toISOString().split("T")[0];

const normalizeEvent = (event: any): Event => ({
    ...event,
    date: event.date || event.day || null,
    day: event.day || event.date || null,
    start_time: event.start_time || event.time || null,
    end_time: event.end_time || null,
    category: event.category || null,
    image_url:
        typeof event.cover_image_url === "string"
            ? event.cover_image_url
            : event.cover_image_url?.url || event.cover_image_url?.publicUrl || null,
    cover_image_url:
        typeof event.cover_image_url === "string"
            ? event.cover_image_url
            : event.cover_image_url?.url || event.cover_image_url?.publicUrl || null,
});

const applyDateFilter = (query: any, filter: EventFilter) => {
    const today = todayString();

    if (filter === "Upcoming") {
        return query.or(`date.gte.${today},day.gte.${today}`);
    }

    if (filter === "Today") {
        return query.or(`date.eq.${today},day.eq.${today}`);
    }

    return query;
};

const getCurrentUserId = async () => {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    return user?.id || null;
};

export const getEventsPage = async ({
    page = 0,
    pageSize = 12,
    filter = "All",
    registeredOnly = false,
}: EventsPageOptions = {}): Promise<{ events: Event[]; hasMore: boolean }> => {
    try {
        const userId = await getCurrentUserId();
        const from = page * pageSize;
        const to = from + pageSize - 1;

        if (registeredOnly) {
            if (!userId) {
                return { events: [], hasMore: false };
            }

            let query = supabase
                .from("events")
                .select(
                    `
                    ${EVENT_SELECT},
                    event_registrations!inner(user_id)
                `
                )
                .eq("event_registrations.user_id", userId)
                .order("date", { ascending: true, nullsFirst: false })
                .order("day", { ascending: true, nullsFirst: false })
                .range(from, to);

            query = applyDateFilter(query, filter);

            const { data, error } = await query;
            if (error) throw error;

            const events = (data || [])
                .map((event: any) => ({
                    ...normalizeEvent(event),
                    is_registered: true,
                }));

            return {
                events,
                hasMore: events.length === pageSize,
            };
        }

        let query = supabase
            .from("events")
            .select(EVENT_SELECT)
            .order("date", { ascending: true, nullsFirst: false })
            .order("day", { ascending: true, nullsFirst: false });

        query = applyDateFilter(query, filter);

        const { data, error } = await query.range(from, to);
        if (error) throw error;

        const baseEvents = (data || []).map((event: any) => ({
            ...normalizeEvent(event),
            is_registered: false,
        }));

        if (!userId || baseEvents.length === 0) {
            return {
                events: baseEvents,
                hasMore: baseEvents.length === pageSize,
            };
        }

        const eventIds = baseEvents.map((event) => event.id);
        const { data: registrations, error: registrationError } = await supabase
            .from("event_registrations")
            .select("event_id")
            .eq("user_id", userId)
            .in("event_id", eventIds);

        if (registrationError) throw registrationError;

        const registeredIds = new Set((registrations || []).map((registration) => registration.event_id));
        const events = baseEvents.map((event) => ({
            ...event,
            is_registered: registeredIds.has(event.id),
        }));

        return {
            events,
            hasMore: events.length === pageSize,
        };
    } catch (error) {
        console.error("Error fetching events page:", error);
        return { events: [], hasMore: false };
    }
};

export const getFeaturedEvents = async (limit: number = 5): Promise<Event[]> => {
    try {
        const { data, error } = await supabase
            .from("events")
            .select(EVENT_SELECT)
            .order("date", { ascending: true })
            .order("day", { ascending: true, nullsFirst: false })
            .limit(limit);

        if (error) throw error;
        return (data || []).map(normalizeEvent);
    } catch (error) {
        console.error("Error fetching featured events:", error);
        return [];
    }
};

export const getAllEvents = async (): Promise<Event[]> => {
    const { events } = await getEventsPage({ page: 0, pageSize: 24, filter: "All" });
    return events;
};

export const getMyEvents = async (userId: string): Promise<Event[]> => {
    try {
        const { data, error } = await supabase
            .from("event_registrations")
            .select(`
                event:events (
                    ${EVENT_SELECT}
                )
            `)
            .eq("user_id", userId);

        if (error) throw error;

        return (data || [])
            .map((item: any) => item.event)
            .filter(Boolean)
            .map((event: any) => ({
                ...normalizeEvent(event),
                is_registered: true,
            }));
    } catch (error) {
        console.error("Error fetching my events:", error);
        return [];
    }
};

export const getEventById = async (id: string): Promise<Event | null> => {
    try {
        const userId = await getCurrentUserId();

        const { data, error } = await supabase
            .from("events")
            .select(`
                ${EVENT_DETAIL_SELECT},
                registrations:event_registrations(user_id),
                saved:event_saved(user_id)
            `)
            .eq("id", id)
            .single();

        if (error) throw error;

        return {
            ...normalizeEvent(data),
            is_registered: userId ? data.registrations.some((r: any) => r.user_id === userId) : false,
            is_saved: userId ? data.saved?.some((r: any) => r.user_id === userId) : false,
        };
    } catch (error) {
        console.error("Error fetching event details:", error);
        return null;
    }
};

export const registerForEvent = async (eventId: string) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Not authenticated");

    const { error } = await supabase
        .from("event_registrations")
        .insert([{ event_id: eventId, user_id: userId }]);

    if (error) throw error;
};

export const unregisterFromEvent = async (eventId: string) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Not authenticated");

    const { error } = await supabase
        .from("event_registrations")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", userId);

    if (error) throw error;
};

export const searchEvents = async (query: string): Promise<Event[]> => {
    if (!query || query.length < 2) return [];

    const { data, error } = await supabase
        .from("events")
        .select("id, name, location, date, day")
        .ilike("name", `%${query}%`)
        .order("date", { ascending: true, nullsFirst: false })
        .limit(10);

    if (error) {
        console.error("Error searching events:", error);
        return [];
    }
    return (data || []).map(normalizeEvent);
};

export const saveEvent = async (eventId: string) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Not authenticated");

    const { error } = await supabase
        .from("event_saved")
        .insert([{ event_id: eventId, user_id: userId }]);

    if (error) throw error;
};

export const unsaveEvent = async (eventId: string) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Not authenticated");

    const { error } = await supabase
        .from("event_saved")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", userId);

    if (error) throw error;
};
