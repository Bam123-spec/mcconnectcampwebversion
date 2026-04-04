import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { supabase } from "@/lib/supabase";
import { getClubFeed } from "@/lib/postService";
import ClubFeedCard from "./ClubFeedCard";
import { useTheme } from "@/context/ThemeContext";

export default function ClubFeedSection() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeed();
    }, []);

    const fetchFeed = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const feedData = await getClubFeed(user.id);
                setPosts(feedData);
            }
        } catch (error) {
            console.error("Error fetching club feed:", error);
        } finally {
            setLoading(false);
        }
    };

    const { theme: currentTheme } = useTheme();

    if (loading) {
        return (
            <View className="py-10 items-center justify-center">
                <ActivityIndicator size="small" color={currentTheme.primary} />
            </View>
        );
    }

    if (posts.length === 0) {
        return (
            <View 
                style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}
                className="px-5 py-8 items-center mx-5 rounded-[24px] border border-dashed"
            >
                <Text style={{ color: currentTheme.textLight }} className="text-[13px] font-body">No posts yet. Join clubs to see updates!</Text>
            </View>
        );
    }

    return (
        <View className="px-5 mb-6">
            <Text style={{ color: currentTheme.text }} className="text-[18px] font-h1 mb-4">Club Feed</Text>
            {posts.map((post, index) => (
                <ClubFeedCard key={post.id} post={post} delay={index * 100} />
            ))}
        </View>
    );
}
