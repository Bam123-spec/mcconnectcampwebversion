import { supabase } from "@/lib/supabase";
import { ForumPost, ForumComment, ForumReaction } from "@/types/database";

// --- Queries ---

export const getPostsByCategory = async (category: string = "general", page: number = 0, limit: number = 10): Promise<ForumPost[]> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        const currentUserId = user?.id;

        let query = supabase
            .from("forum_posts")
            .select(`
                *,
                author:author_id ( id, full_name, avatar_url ),
                reactions:forum_reactions (count),
                comments:forum_comments (count),
                saved:forum_saved_posts ( user_id ),
                views:forum_views (count)
            `)
            .order("created_at", { ascending: false })
            .range(page * limit, (page + 1) * limit - 1);

        if (category !== "All") {
            query = query.eq("category", category);
        }

        const { data, error } = await query;
        if (error) throw error;

        return data.map((post: any) => ({
            ...post,
            likes_count: post.reactions?.[0]?.count || 0,
            comments_count: post.comments?.[0]?.count || 0,
            views_count: post.views?.[0]?.count || 0,
            is_saved: currentUserId ? post.saved.some((s: any) => s.user_id === currentUserId) : false,
        }));
    } catch (error) {
        console.error("Error fetching posts:", error);
        return [];
    }
};

export const getTrendingPosts = async (limit: number = 5, scanLimit: number = 12): Promise<ForumPost[]> => {
    try {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        const { data, error } = await supabase
            .from("forum_posts")
            .select(`
                *,
                author:author_id ( id, full_name, avatar_url ),
                reactions:forum_reactions (count),
                comments:forum_comments (count),
                views:forum_views (count)
            `)
            .gte("created_at", twoDaysAgo.toISOString())
            .order("created_at", { ascending: false })
            .limit(scanLimit);

        if (error) throw error;

        const posts = data.map((post: any) => {
            const likes = post.reactions?.[0]?.count || 0;
            const comments = post.comments?.[0]?.count || 0;
            const views = post.views?.[0]?.count || 0;
            const score = likes + comments + views;
            return { ...post, likes_count: likes, comments_count: comments, views_count: views, trending_score: score };
        });

        return posts.sort((a: any, b: any) => b.trending_score - a.trending_score).slice(0, limit);
    } catch (error) {
        console.error("Error fetching trending posts:", error);
        return [];
    }
};

export const getPost = async (postId: string): Promise<ForumPost | null> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        const currentUserId = user?.id;

        const { data, error } = await supabase
            .from("forum_posts")
            .select(`
                *,
                author:author_id ( id, full_name, avatar_url ),
                reactions:forum_reactions (count),
                comments:forum_comments (count),
                saved:forum_saved_posts ( user_id ),
                views:forum_views (count)
            `)
            .eq("id", postId)
            .single();

        if (error) throw error;

        // Fetch user specific reaction
        let userReaction = null;
        if (currentUserId) {
            const { data: reactionData } = await supabase
                .from("forum_reactions")
                .select("reaction")
                .eq("post_id", postId)
                .eq("user_id", currentUserId)
                .single();
            userReaction = reactionData?.reaction || null;
        }

        return {
            ...data,
            likes_count: data.reactions?.[0]?.count || 0,
            comments_count: data.comments?.[0]?.count || 0,
            views_count: data.views?.[0]?.count || 0,
            is_saved: currentUserId ? data.saved.some((s: any) => s.user_id === currentUserId) : false,
            user_reaction: userReaction,
        };
    } catch (error) {
        console.error("Error fetching post:", error);
        return null;
    }
};

export const getComments = async (postId: string): Promise<ForumComment[]> => {
    try {
        const { data, error } = await supabase
            .from("forum_comments")
            .select(`
                *,
                author:author_id ( id, full_name, avatar_url )
            `)
            .eq("post_id", postId)
            .order("created_at", { ascending: true });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Error fetching comments:", error);
        return [];
    }
};

export const getSavedPosts = async (): Promise<ForumPost[]> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from("forum_saved_posts")
            .select(`
                post:forum_posts (
                    *,
                    author:author_id ( id, full_name, avatar_url ),
                    reactions:forum_reactions (count),
                    comments:forum_comments (count),
                    views:forum_views (count)
                )
            `)
            .eq("user_id", user.id);

        if (error) throw error;

        return data.map((item: any) => ({
            ...item.post,
            likes_count: item.post.reactions?.[0]?.count || 0,
            comments_count: item.post.comments?.[0]?.count || 0,
            views_count: item.post.views?.[0]?.count || 0,
            is_saved: true,
        }));
    } catch (error) {
        console.error("Error fetching saved posts:", error);
        return [];
    }
};

// --- Mutations ---

export const createPost = async (title: string, content: string, category: string, imageUrl?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
        .from("forum_posts")
        .insert([{ author_id: user.id, title, content, category, image_url: imageUrl }])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const addComment = async (postId: string, content: string, parentId?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
        .from("forum_comments")
        .insert([{ post_id: postId, author_id: user.id, content, parent_id: parentId }])
        .select(`*, author:author_id(id, full_name, avatar_url)`)
        .single();

    if (error) throw error;
    return data;
};

export const toggleReaction = async (postId: string, reaction: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: existing } = await supabase
        .from("forum_reactions")
        .select("id, reaction")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .single();

    if (existing) {
        if (existing.reaction === reaction) {
            await supabase.from("forum_reactions").delete().eq("id", existing.id);
            return "removed";
        } else {
            await supabase.from("forum_reactions").update({ reaction }).eq("id", existing.id);
            return "updated";
        }
    } else {
        await supabase.from("forum_reactions").insert([{ post_id: postId, user_id: user.id, reaction }]);
        return "added";
    }
};

export const savePost = async (postId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
        .from("forum_saved_posts")
        .insert([{ post_id: postId, user_id: user.id }]);

    if (error) throw error;
};

export const unsavePost = async (postId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
        .from("forum_saved_posts")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);

    if (error) throw error;
};

export const insertView = async (postId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if viewed recently to avoid spamming? For MVP, just insert.
    // Or check if view exists for user/post combination if we only want unique views per user.
    // The requirement says "forum_views id, post_id, user_id, viewed_at".
    // Let's just insert.
    await supabase.from("forum_views").insert([{ post_id: postId, user_id: user.id, viewed_at: new Date().toISOString() }]);
};
