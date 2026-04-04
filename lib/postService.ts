import { supabase } from "./supabase";
import { ForumPost } from "@/types/database";

export const getTrendingPosts = async (): Promise<ForumPost[]> => {
    try {
        const { data, error } = await supabase
            .from("forum_posts")
            .select(`
                *,
                author:author_id (
                    id,
                    full_name,
                    avatar_url
                ),
                reactions:forum_reactions (count),
                comments:forum_comments (count)
            `)
            .order("created_at", { ascending: false })
            .limit(5);

        if (error) throw error;

        // Map to ForumPost with computed counts
        return data.map((post: any) => ({
            ...post,
            likes_count: post.reactions?.[0]?.count || 0, // Simplified
            comments_count: post.comments?.[0]?.count || 0
        }));

    } catch (error) {
        console.error("Error fetching trending posts:", error);
        return [];
    }
};

export const getClubFeed = async (userId: string): Promise<any[]> => {
    // Deprecated or needs migration to forum_posts with club_id if applicable
    return [];
};
