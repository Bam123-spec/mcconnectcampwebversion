import { supabase } from "@/lib/supabase";
import { Profile, Friend, Follow, Club } from "@/types/database";
import { getMyClubs } from "@/lib/clubService";
import { createDM } from "@/lib/chatService";

const SEARCH_PROFILE_SELECT = "id, full_name, username, avatar_url";
const MUTUAL_CLUB_SELECT = "id, name, description, cover_image_url, member_count";
const PROFILE_EVENT_SELECT = `
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

const getUserOrgId = async (userId: string) => {
    const { data, error } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", userId)
        .maybeSingle();

    if (error) {
        console.error("Error fetching user org:", error);
        return null;
    }

    return data?.org_id || null;
};

export const getProfile = async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) {
        console.error("Error fetching profile:", error);
        return null;
    }
    return data;
};

export const getFriends = async (userId: string, limit?: number): Promise<Profile[]> => {
    // Fetch accepted friends where user is either user_id or friend_id
    let query = supabase
        .from("friends")
        .select(`
      user_id,
      friend_id,
      status,
      user:user_id ( * ),
      friend:friend_id ( * )
    `)
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq("status", "accepted");

    if (typeof limit === "number") {
        query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching friends:", error);
        return [];
    }

    // Map to a list of Profiles (the "other" person)
    return data.map((f: any) => {
        if (f.user_id === userId) return f.friend;
        return f.user;
    });
};

export const getFollowersCount = async (userId: string): Promise<number> => {
    const { count, error } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userId);

    if (error) {
        console.error("Error fetching followers count:", error);
        return 0;
    }
    return count || 0;
};

export const getFollowingCount = async (userId: string): Promise<number> => {
    const { count, error } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", userId);

    if (error) {
        console.error("Error fetching following count:", error);
        return 0;
    }
    return count || 0;
};

export const getOfficerClubs = async (userId: string): Promise<{ club: Club, role: string }[]> => {
    const { data, error } = await supabase
        .from("officers")
        .select(`
      role,
      club:club_id ( * )
    `)
        .eq("user_id", userId);

    if (error) {
        console.error("Error fetching officer clubs:", error);
        return [];
    }

    return data.map((item: any) => ({
        club: item.club,
        role: item.role,
    }));
};

export const getAllStudents = async (currentUserId: string): Promise<Profile[]> => {
    // 1. Get IDs of people we are already friends with (or pending)
    const { data: friendsData, error: friendsError } = await supabase
        .from("friends")
        .select("user_id, friend_id")
        .or(`user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`);

    if (friendsError) {
        console.error("Error fetching existing friends:", friendsError);
        return [];
    }

    const existingFriendIds = new Set<string>();
    friendsData?.forEach(f => {
        existingFriendIds.add(f.user_id === currentUserId ? f.friend_id : f.user_id);
    });

    const currentOrgId = await getUserOrgId(currentUserId);

    // 2. Fetch all profiles except current user
    let query = supabase
        .from("profiles")
        .select(SEARCH_PROFILE_SELECT)
        .neq("id", currentUserId)
        .limit(50); // Limit for now

    if (currentOrgId) {
        query = query.eq("org_id", currentOrgId);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching students:", error);
        return [];
    }

    // 3. Filter out existing friends
    return data.filter(p => !existingFriendIds.has(p.id));
};

export const addFriend = async (userId: string, friendId: string): Promise<void> => {
    const { error } = await supabase
        .from("friends")
        .insert({
            user_id: userId,
            friend_id: friendId,
            status: 'accepted'
        });

    if (error) throw error;

    // Auto-create DM so they appear in chat list
    try {
        await createDM(friendId);
    } catch (chatError) {
        console.error("Error auto-creating DM:", chatError);
        // Don't fail the friend add if chat creation fails
    }
};

export const getFriendStatus = async (
    currentUserId: string,
    otherUserId: string
): Promise<'none' | 'pending' | 'accepted'> => {
    try {
        const { data, error } = await supabase
            .from("friends")
            .select("status")
            .or(`and(user_id.eq.${currentUserId},friend_id.eq.${otherUserId}),and(user_id.eq.${otherUserId},friend_id.eq.${currentUserId})`)
            .maybeSingle();

        if (error) throw error;
        return (data?.status as 'pending' | 'accepted' | undefined) || 'none';
    } catch (error) {
        console.error("Error fetching friend status:", error);
        return 'none';
    }
};

export const getMutualClubs = async (userId1: string, userId2: string): Promise<Club[]> => {
    try {
        const { data: user1Memberships, error: membershipsError } = await supabase
            .from("club_members")
            .select("club_id")
            .eq("user_id", userId1)
            .eq("status", "approved");

        if (membershipsError) throw membershipsError;

        const clubIds = user1Memberships?.map((membership) => membership.club_id) || [];
        if (clubIds.length === 0) return [];

        const { data, error } = await supabase
            .from("club_members")
            .select(`clubs:${"club_id"}(${MUTUAL_CLUB_SELECT})`)
            .eq("user_id", userId2)
            .eq("status", "approved")
            .in("club_id", clubIds);

        if (error) throw error;

        return (data || [])
            .map((item: any) => item.clubs)
            .filter(Boolean);
    } catch (error) {
        console.error("Error fetching mutual clubs:", error);
        return [];
    }
};

import { getAchievements as getAllAchievements, getUserAchievements } from "@/lib/achievementService";
import { UserAchievement, Achievement } from "@/types/database";

export interface AchievementPreviewItem {
    id: string;
    achievement: Achievement;
    unlockedAt?: string;
}

export const getAchievements = async (userId: string): Promise<AchievementPreviewItem[]> => {
    const [allAchievements, userAchievements] = await Promise.all([
        getAllAchievements(),
        getUserAchievements(userId)
    ]);

    const previewItems: AchievementPreviewItem[] = [];

    // 1. If user has unlocked achievements, show ONLY those (up to 4)
    if (userAchievements.length > 0) {
        userAchievements.forEach(ua => {
            if (ua.achievement) {
                previewItems.push({
                    id: ua.achievement.id,
                    achievement: ua.achievement,
                    unlockedAt: ua.earned_at
                });
            }
        });
        return previewItems.slice(0, 4);
    }

    // 2. If NO unlocked achievements, show locked ones (up to 4)
    for (const ach of allAchievements) {
        if (previewItems.length >= 4) break;
        previewItems.push({
            id: ach.id,
            achievement: ach,
            unlockedAt: undefined
        });
    }

    return previewItems;
};

export const getEventsHistory = async (userId: string, limit?: number): Promise<any[]> => {
    try {
        let query = supabase
            .from("event_registrations")
            .select(`
                event:events (
                    ${PROFILE_EVENT_SELECT}
                )
            `)
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (typeof limit === "number") {
            query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) throw error;

        return data.map((item: any) => ({
            ...item.event,
            is_registered: true,
        }));
    } catch (error) {
        console.error("Error fetching event history:", error);
        return [];
    }
};

export const updateProfileCustomization = async (userId: string, updates: Partial<Profile>): Promise<void> => {
    const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId);

    if (error) throw error;
};

export const searchUsers = async (query: string, currentUserId: string): Promise<Profile[]> => {
    if (!query || query.length < 2) return [];

    const currentOrgId = await getUserOrgId(currentUserId);

    let request = supabase
        .from("profiles")
        .select(SEARCH_PROFILE_SELECT)
        .neq("id", currentUserId)
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(20);

    if (currentOrgId) {
        request = request.eq("org_id", currentOrgId);
    }

    const { data, error } = await request;

    if (error) {
        console.error("Error searching users:", error);
        return [];
    }
    return data;
};
