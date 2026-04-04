import { supabase } from "./supabase";
import { ClubMember, Event, Post } from "@/types/database";
import {
    OFFICER_ASSIGNABLE_ROLES,
    canManageOfficerRole,
    getOfficerRoleLabel,
    hasOfficerCapability,
    normalizeOfficerRole,
} from "@/lib/officerPermissions";

const getCurrentClubAccess = async (clubId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Not authenticated");
    }

    const [{ data: profile }, { data: officerRow }] = await Promise.all([
        supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
        supabase
            .from("officers")
            .select("role")
            .eq("club_id", clubId)
            .eq("user_id", user.id)
            .maybeSingle(),
    ]);

    const effectiveRole = profile?.role === "admin" ? "admin" : officerRow?.role || "member";

    return {
        user,
        effectiveRole,
        isGlobalAdmin: profile?.role === "admin",
    };
};

const requireClubCapability = async (clubId: string, capability: Parameters<typeof hasOfficerCapability>[1]) => {
    const access = await getCurrentClubAccess(clubId);

    if (!hasOfficerCapability(access.effectiveRole, capability)) {
        throw new Error(`${getOfficerRoleLabel(access.effectiveRole)} cannot perform this action.`);
    }

    return access;
};

const mapEventRow = (event: any): Event => ({
    ...event,
    date: event.date || event.day || null,
    start_time: event.start_time || event.time || null,
    cover_image_url:
        typeof event.cover_image_url === "string"
            ? event.cover_image_url
            : event.cover_image_url?.url || event.cover_image_url?.publicUrl || null,
    day: event.day || event.date || null,
    time: event.time || event.start_time || null,
    image_url:
        typeof event.cover_image_url === "string"
            ? event.cover_image_url
            : event.cover_image_url?.url || event.cover_image_url?.publicUrl || null,
});

// --- Analytics ---
export const getOfficerAnalytics = async (clubId: string) => {
    try {
        await requireClubCapability(clubId, "viewAnalytics");

        // 1. Total Members
        const { count: memberCount, error: memberError } = await supabase
            .from("club_members")
            .select("*", { count: "exact", head: true })
            .eq("club_id", clubId);

        if (memberError) throw memberError;

        // 2. Total Events
        const { count: eventCount, error: eventError } = await supabase
            .from("events")
            .select("*", { count: "exact", head: true })
            .eq("club_id", clubId);

        if (eventError) throw eventError;

        // 3. Total Announcements (Posts)
        const { count: postCount, error: postError } = await supabase
            .from("posts")
            .select("*", { count: "exact", head: true })
            .eq("club_id", clubId);

        if (postError) throw postError;

        // 4. Avg Attendance (Complex calculation, simplified for now)
        // Fetch all events for this club, then get attendance counts
        // For MVP, we'll just return a placeholder or calculate if feasible.
        // Let's try to get average attendance from event_attendance
        const { data: events } = await supabase
            .from("events")
            .select("id, capacity")
            .eq("club_id", clubId);

        let avgAttendance = 0;
        if (events && events.length > 0) {
            const eventIds = events.map(e => e.id);
            const { data: attendance } = await supabase
                .from("event_attendance")
                .select("event_id")
                .in("event_id", eventIds);

            if (attendance && attendance.length > 0) {
                // Group by event_id
                const counts: Record<string, number> = {};
                attendance.forEach(a => {
                    counts[a.event_id] = (counts[a.event_id] || 0) + 1;
                });

                // Calculate average percentage based on capacity (if available) or just raw count
                // Let's do raw count average for now
                const totalAttendees = attendance.length;
                avgAttendance = Math.round(totalAttendees / events.length);
            }
        }

        return {
            memberCount: memberCount || 0,
            eventCount: eventCount || 0,
            postCount: postCount || 0,
            avgAttendance: avgAttendance || 0,
        };

    } catch (error) {
        console.error("Error fetching officer analytics:", error);
        return {
            memberCount: 0,
            eventCount: 0,
            postCount: 0,
            avgAttendance: 0,
        };
    }
};

// --- Events ---
export const createEvent = async (eventData: {
    club_id: string;
    title: string;
    description: string;
    start_time: string;
    date?: string;
    time?: string;
    location: string;
    image_url?: string;
}) => {
    await requireClubCapability(eventData.club_id, "createEvents");

    const resolvedDate = eventData.date || eventData.start_time.split(" ")[0] || null;
    const resolvedTime = eventData.time || eventData.start_time.replace(`${resolvedDate} `, "") || eventData.start_time;

    const { data, error } = await supabase
        .from("events")
        .insert([
            {
                club_id: eventData.club_id,
                name: eventData.title,
                description: eventData.description,
                date: resolvedDate,
                day: resolvedDate,
                time: resolvedTime,
                location: eventData.location,
                cover_image_url: eventData.image_url || null,
            }
        ])
        .select()
        .single();

    if (error) throw error;
    return mapEventRow(data);
};

export const getClubEvents = async (clubId: string) => {
    await requireClubCapability(clubId, "viewAnalytics");

    const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("club_id", clubId)
        .order("date", { ascending: false, nullsFirst: false })
        .order("day", { ascending: false, nullsFirst: false });

    if (error) throw error;
    return (data || []).map(mapEventRow) as Event[];
};

// --- Members ---
export const getClubMembers = async (clubId: string) => {
    await requireClubCapability(clubId, "viewAnalytics");

    // We need to join with profiles and officers to check roles
    const { data, error } = await supabase
        .from("club_members")
        .select(`
            *,
            profiles:user_id (
                id,
                full_name,
                avatar_url,
                email,
                role,
                org_id
            )
        `)
        .eq("club_id", clubId);

    if (error) throw error;

    // Now fetch officers for this club to determine roles
    const { data: officers } = await supabase
        .from("officers")
        .select("user_id, role")
        .eq("club_id", clubId);

    const officerMap = new Map();
    officers?.forEach(o => officerMap.set(o.user_id, o.role));

    // Merge
    return data.map((member: any) => ({
        ...member,
        profile_id: member.user_id,
        role: officerMap.get(member.user_id) || "member",
        profile: member.profiles
    }));
};

export const promoteMember = async (userId: string, clubId: string, role: string) => {
    await setOfficerRole(userId, clubId, role);
};

export const setOfficerRole = async (userId: string, clubId: string, role: string) => {
    const access = await requireClubCapability(clubId, "manageRoles");
    const normalizedTargetRole = normalizeOfficerRole(role);

    if (
        !access.isGlobalAdmin &&
        (!OFFICER_ASSIGNABLE_ROLES.includes(normalizedTargetRole) || !canManageOfficerRole(access.effectiveRole, normalizedTargetRole))
    ) {
        throw new Error("Only a President can assign Vice President, Treasurer, and Secretary roles.");
    }

    if (access.isGlobalAdmin === false && normalizedTargetRole === "admin") {
        throw new Error("Admin is not a club officer role.");
    }

    if (normalizedTargetRole === "president" && !access.isGlobalAdmin) {
        throw new Error("Only a global admin can assign President.");
    }

    const { data: approvedMember, error: memberError } = await supabase
        .from("club_members")
        .select("id, status")
        .eq("club_id", clubId)
        .eq("user_id", userId)
        .eq("status", "approved")
        .maybeSingle();

    if (memberError) throw memberError;
    if (!approvedMember) {
        throw new Error("Only approved club members can be promoted.");
    }

    const { error } = await supabase
        .from("officers")
        .upsert(
            [{ user_id: userId, club_id: clubId, role: normalizedTargetRole.replace("_", " ") }],
            { onConflict: "user_id,club_id" }
        );

    if (error) throw error;
};

export const demoteMember = async (userId: string, clubId: string) => {
    const access = await requireClubCapability(clubId, "manageRoles");
    const { data: targetOfficer } = await supabase
        .from("officers")
        .select("role")
        .eq("user_id", userId)
        .eq("club_id", clubId)
        .maybeSingle();

    if (!targetOfficer) {
        return;
    }

    if (!access.isGlobalAdmin && !canManageOfficerRole(access.effectiveRole, targetOfficer.role)) {
        throw new Error("You can only remove officer roles below your own.");
    }

    const { error } = await supabase
        .from("officers")
        .delete()
        .eq("user_id", userId)
        .eq("club_id", clubId);
    if (error) throw error;
};

export const removeMember = async (userId: string, clubId: string) => {
    const access = await requireClubCapability(clubId, "manageMembers");
    const { data: targetOfficer } = await supabase
        .from("officers")
        .select("role")
        .eq("user_id", userId)
        .eq("club_id", clubId)
        .maybeSingle();

    if (targetOfficer && !access.isGlobalAdmin && !canManageOfficerRole(access.effectiveRole, targetOfficer.role)) {
        throw new Error("You can only remove members below your own leadership level.");
    }

    const { error } = await supabase
        .from("club_members")
        .delete()
        .eq("user_id", userId)
        .eq("club_id", clubId);
    if (error) throw error;
};

// --- Announcements ---
export const createAnnouncement = async (postData: {
    club_id: string;
    user_id: string;
    content: string;
    image_url?: string;
}) => {
    await requireClubCapability(postData.club_id, "postAnnouncements");

    const { data, error } = await supabase
        .from("posts")
        .insert([
            {
                club_id: postData.club_id,
                author_id: postData.user_id,
                content: postData.content,
                image_url: postData.image_url
            }
        ])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const getClubAnnouncements = async (clubId: string) => {
    await requireClubCapability(clubId, "viewAnalytics");

    const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("club_id", clubId)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Post[];
};
