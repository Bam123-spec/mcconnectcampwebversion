import { supabase } from "@/lib/supabase";
import { Achievement, UserAchievement } from "@/types/database";

export const getAchievements = async (): Promise<Achievement[]> => {
    const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("title");

    if (error) {
        console.error("Error fetching achievements:", error);
        return [];
    }
    return data;
};

export const getUserAchievements = async (userId: string): Promise<UserAchievement[]> => {
    const { data, error } = await supabase
        .from("user_achievements")
        .select(`
            *,
            achievement:achievements(*)
        `)
        .eq("user_id", userId);

    if (error) {
        console.error("Error fetching user achievements:", error);
        return [];
    }
    return data;
};

export const unlockAchievement = async (userId: string, achievementId: string): Promise<UserAchievement | null> => {
    try {
        const { data, error } = await supabase
            .from("user_achievements")
            .insert({
                user_id: userId,
                achievement_id: achievementId
            })
            .select(`
                *,
                achievement:achievements(*)
            `)
            .single();

        if (error) {
            if (error.code === '23505') { // Unique violation (already unlocked)
                return null;
            }
            throw error;
        }
        return data;
    } catch (error) {
        console.error("Error unlocking achievement:", error);
        return null;
    }
};

// Core logic to check triggers
export const checkAndUnlock = async (userId: string, triggerType: string, data?: any): Promise<UserAchievement[]> => {
    // 1. Fetch all achievements that match this trigger type
    // This is a simplified approach. Ideally, we'd cache this or query efficiently.
    const { data: potentialAchievements } = await supabase
        .from("achievements")
        .select("*")
        .contains("requirements", { type: triggerType });

    if (!potentialAchievements || potentialAchievements.length === 0) return [];

    // 2. Fetch user's existing achievements to avoid re-unlocking
    const { data: existing } = await supabase
        .from("user_achievements")
        .select("achievement_id")
        .eq("user_id", userId);

    const existingIds = new Set(existing?.map(e => e.achievement_id));
    const unlocked: UserAchievement[] = [];

    for (const achievement of potentialAchievements) {
        if (existingIds.has(achievement.id)) continue;

        let shouldUnlock = false;
        const req = achievement.requirements;

        // Logic for different trigger types
        switch (triggerType) {
            case 'event_count':
                // Check if user attended X events
                // We need to query event_registrations count
                // For now, we assume 'data' contains the current count or we fetch it
                if (data?.count >= req.target) shouldUnlock = true;
                break;

            case 'club_count':
                if (data?.count >= req.target) shouldUnlock = true;
                break;

            case 'message_count':
                if (data?.count >= req.target) shouldUnlock = true;
                break;

            case 'officer_role':
                // Data should be boolean or role string
                if (data?.isOfficer) shouldUnlock = true;
                break;

            // Add more cases as needed
        }

        if (shouldUnlock) {
            const result = await unlockAchievement(userId, achievement.id);
            if (result) unlocked.push(result);
        }
    }

    return unlocked;
};
