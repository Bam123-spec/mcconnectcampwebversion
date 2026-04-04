import React, { useState, useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getSavedPosts } from "@/lib/forumService";
import { ForumPost } from "@/types/database";
import PostCard from "@/components/forum/PostCard";

export default function SavedPostsScreen() {
    const router = useRouter();
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSaved = async () => {
        setLoading(true);
        try {
            const data = await getSavedPosts();
            setPosts(data);
        } catch (error) {
            console.error("Error fetching saved posts:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchSaved();
        }, [])
    );

    return (
        <View className="flex-1 bg-[#F7F5FC]">
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView className="flex-1" edges={["top"]}>
                {/* Header */}
                <View className="px-5 py-3 flex-row items-center gap-4 bg-white border-b border-gray-100">
                    <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-gray-50">
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </Pressable>
                    <Text className="text-[18px] font-bold text-gray-900">Saved Posts</Text>
                </View>

                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#6D28D9" />
                    </View>
                ) : (
                    <FlatList
                        data={posts}
                        renderItem={({ item, index }) => (
                            <View className="px-5">
                                <PostCard post={item} index={index} />
                            </View>
                        )}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}
                        ListEmptyComponent={
                            <View className="items-center justify-center py-20">
                                <Ionicons name="bookmark-outline" size={48} color="#E5E7EB" />
                                <Text className="text-gray-400 mt-4 text-center">No saved posts yet.</Text>
                            </View>
                        }
                    />
                )}
            </SafeAreaView>
        </View>
    );
}
