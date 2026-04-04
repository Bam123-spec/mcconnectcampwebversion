import { supabase } from "@/lib/supabase";
import { Club, ClubMember, ClubPost, ClubEvent, ClubFollower } from "@/types/database";

type DiscoverClubsOptions = {
    page?: number;
    pageSize?: number;
    query?: string;
    excludeClubIds?: string[];
};

const CLUB_LIST_SELECT = "id, name, description, cover_image_url, member_count";
const CLUB_DETAIL_SELECT = "id, name, description, cover_image_url, member_count";

export const getDiscoverClubs = async ({
    page = 0,
    pageSize = 8,
    query = "",
    excludeClubIds = [],
}: DiscoverClubsOptions = {}): Promise<{ clubs: Club[]; hasMore: boolean }> => {
    let request = supabase
        .from("clubs")
        .select(CLUB_LIST_SELECT)
        .order("member_count", { ascending: false, nullsFirst: false })
        .order("name", { ascending: true });

    if (query.trim().length >= 2) {
        request = request.ilike("name", `%${query.trim()}%`);
    }

    if (excludeClubIds.length > 0) {
        const formattedIds = excludeClubIds.map((id) => `"${id}"`).join(",");
        request = request.not("id", "in", `(${formattedIds})`);
    }

    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await request.range(from, to);

    if (error) {
        console.error("Error fetching discover clubs:", error);
        return { clubs: [], hasMore: false };
    }

    return {
        clubs: data || [],
        hasMore: (data?.length || 0) === pageSize,
    };
};

export const getClub = async (id: string): Promise<Club | null> => {
    const { data, error } = await supabase
        .from("clubs")
        .select(CLUB_DETAIL_SELECT)
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error fetching club:", error);
        return null;
    }

    return data;
};

export const getClubViewerState = async (clubId: string): Promise<{ isFollowing: boolean; isMember: boolean }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { isFollowing: false, isMember: false };
        }

        const [{ data: following }, { data: membership }] = await Promise.all([
            supabase
                .from("club_followers")
                .select("id")
                .eq("user_id", user.id)
                .eq("club_id", clubId)
                .maybeSingle(),
            supabase
                .from("club_members")
                .select("id")
                .eq("club_id", clubId)
                .eq("user_id", user.id)
                .maybeSingle(),
        ]);

        return {
            isFollowing: !!following,
            isMember: !!membership,
        };
    } catch (error) {
        console.error("Error fetching club viewer state:", error);
        return { isFollowing: false, isMember: false };
    }
};

export const getMyClubs = async (userId: string, limit?: number): Promise<Club[]> => {
    // Fetch clubs where the user is a member
    let query = supabase
        .from("club_members")
        .select("club_id, clubs(id, name, description, cover_image_url, member_count)")
        .eq("user_id", userId)
        .eq("status", "approved");

    if (typeof limit === "number") {
        query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching my clubs:", error);
        return [];
    }

    // Extract the club details from the joined result
    const clubs = (data?.map((item: any) => item.clubs).filter(Boolean) || []) as Club[];
    const uniqueClubs = new Map<string, Club>();

    clubs.forEach((club) => {
        if (club?.id && !uniqueClubs.has(club.id)) {
            uniqueClubs.set(club.id, club);
        }
    });

    return Array.from(uniqueClubs.values());
};

// --- Club Following ---

export const followClub = async (clubId: string) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { error } = await supabase
            .from("club_followers")
            .insert({
                user_id: user.id,
                club_id: clubId
            });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error("Error following club:", error);
        throw error;
    }
};

export const unfollowClub = async (clubId: string) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { error } = await supabase
            .from("club_followers")
            .delete()
            .eq("user_id", user.id)
            .eq("club_id", clubId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error("Error unfollowing club:", error);
        throw error;
    }
};

export const checkIfFollowing = async (clubId: string) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data, error } = await supabase
            .from("club_followers")
            .select("id")
            .eq("user_id", user.id)
            .eq("club_id", clubId)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
        return !!data;
    } catch (error) {
        // console.error("Error checking follow status:", error);
        return false;
    }
};

export const getFollowedClubs = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from("club_followers")
            .select(`
club_id,
    clubs: club_id(*)
        `)
            .eq("user_id", userId);

        if (error) throw error;
        return data.map((item: any) => item.clubs) as Club[];
    } catch (error) {
        console.error("Error fetching followed clubs:", error);
        return [];
    }
};

export const joinClub = async (userId: string, clubId: string): Promise<void> => {
    // 1. Add to club_members
    const { error: memberError } = await supabase
        .from("club_members")
        .insert({
            club_id: clubId,
            user_id: userId,
            status: 'approved' // Auto-approve for now
        });

    if (memberError) throw memberError;

    // 2. Find or Create Club Chat Room
    let { data: roomData, error: roomError } = await supabase
        .from("chat_rooms")
        .select("id")
        .eq("club_id", clubId)
        .single();

    if (!roomData && (!roomError || roomError.code === 'PGRST116')) {
        // Create chat room if not exists
        // Fetch club name first for the chat name
        const { data: club } = await supabase.from("clubs").select("name").eq("id", clubId).single();

        const { data: newRoom, error: createError } = await supabase
            .from("chat_rooms")
            .insert({
                type: 'group',
                club_id: clubId,
                name: club?.name || "Club Chat"
            })
            .select("id")
            .single();

        if (createError) {
            console.error("Error creating club chat:", createError);
        } else {
            roomData = newRoom;
        }
    }

    // 3. Add to chat_members if room exists
    if (roomData) {
        const { error: chatError } = await supabase
            .from("chat_members")
            .upsert({
                room_id: roomData.id,
                user_id: userId
            }, { onConflict: 'room_id, user_id' });

        if (chatError) console.error("Error adding to club chat:", chatError);
    }

    // 4. Auto-Follow the club
    const { error: followError } = await supabase
        .from("club_followers")
        .upsert(
            { user_id: userId, club_id: clubId },
            { onConflict: 'user_id, club_id', ignoreDuplicates: true }
        );

    if (followError) console.error("Error auto-following club:", followError);
};

export const leaveClub = async (userId: string, clubId: string): Promise<void> => {
    // 1. Remove from club_members
    const { error: memberError } = await supabase
        .from("club_members")
        .delete()
        .eq("club_id", clubId)
        .eq("user_id", userId);

    if (memberError) throw memberError;

    // 2. Find Club Chat Room
    const { data: roomData } = await supabase
        .from("chat_rooms")
        .select("id")
        .eq("club_id", clubId)
        .single();

    // 3. Remove from chat_members if room exists
    if (roomData) {
        const { error: chatError } = await supabase
            .from("chat_members")
            .delete()
            .eq("room_id", roomData.id)
            .eq("user_id", userId);

        if (chatError) console.error("Error removing from club chat:", chatError);
    }

    // 4. Auto-Unfollow (Optional, but good for cleanup)
    const { error: followError } = await supabase
        .from("club_followers")
        .delete()
        .eq("user_id", userId)
        .eq("club_id", clubId);

    if (followError) console.error("Error auto-unfollowing club:", followError);
};

export const searchClubs = async (query: string): Promise<Club[]> => {
    if (!query || query.length < 2) return [];

    const { data, error } = await supabase
        .from("clubs")
        .select(CLUB_LIST_SELECT)
        .ilike("name", `%${query}%`)
        .limit(10);

    if (error) {
        console.error("Error searching clubs:", error);
        return [];
    }
    return data || [];
};
