import React, { useState, useCallback, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import { View, FlatList, RefreshControl, Text, ActivityIndicator, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getPostsByCategory, getTrendingPosts } from "@/lib/forumService";
import { ForumPost } from "@/types/database";
import CategoryTabs from "@/components/forum/CategoryTabs";
import PostCard from "@/components/forum/PostCard";
import { MotiView } from "moti";

export default function ForumScreen() {
    const router = useRouter();
    const [category, setCategory] = useState("All");
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [trending, setTrending] = useState<ForumPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        if (posts.length === 0) setLoading(true);
        try {
            const [fetchedPosts, fetchedTrending] = await Promise.all([
                getPostsByCategory(category),
                category === "All" ? getTrendingPosts() : Promise.resolve([])
            ]);
            setPosts(fetchedPosts);
            if (category === "All") setTrending(fetchedTrending);
        } catch (error) {
            console.error("Error fetching forum data:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [category]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const renderHeader = () => (
        <View>
            {category === "All" && trending.length > 0 && (
                <View className="mb-6 mt-2">
                    <View className="flex-row items-center gap-2 px-5 mb-3">
                        <Ionicons name="flame" size={20} color="#EF4444" />
                        <Text className="text-[18px] font-h1 text-gray-900">Trending</Text>
                    </View>
                    <FlatList
                        data={trending}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
                        renderItem={({ item }) => (
                            <View className="w-[280px]">
                                <PostCard post={item} />
                            </View>
                        )}
                        keyExtractor={(item) => `trending-${item.id}`}
                    />
                </View>
            )}
            <View className="px-5 mb-3 mt-2">
                <Text className="text-[18px] font-h1 text-gray-900">
                    {category === "All" ? "Latest Discussions" : `${category} Posts`}
                </Text>
            </View>
        </View>
    );


    return (
        <SafeAreaView className="flex-1 bg-[#F7F5FC]" edges={["top"]}>
            {/* Header */}
            <View className="bg-white border-b border-gray-100 pb-2">
                <PageHeader
                    title="Forum"
                    rightIcon={
                        <View className="flex-row gap-3">
                            <Pressable
                                onPress={() => router.push("/forum/saved")}
                                className="h-10 w-10 rounded-full bg-gray-50 items-center justify-center"
                            >
                                <Ionicons name="bookmark-outline" size={22} color="#1A1A1A" />
                            </Pressable>
                            <Pressable
                                onPress={() => router.push("/forum/create")}
                                className="h-10 w-10 rounded-full bg-[#6D28D9] items-center justify-center shadow-sm shadow-purple-200"
                            >
                                <Ionicons name="add" size={24} color="white" />
                            </Pressable>
                        </View>
                    }
                />
            </View>

            {/* Categories */}
            <CategoryTabs selectedCategory={category} onSelectCategory={setCategory} />

            {/* Feed */}
            {loading && posts.length === 0 ? (
                <View className="flex-1 items-center justify-center pt-20">
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
                    contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
                    ListHeaderComponent={renderHeader}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6D28D9" />
                    }
                    ListEmptyComponent={
                        <View className="items-center justify-center py-20">
                            <Ionicons name="chatbubbles-outline" size={48} color="#E5E7EB" />
                            <Text className="text-gray-400 mt-4 text-center font-body">No posts yet.{'\n'}Be the first to start a discussion!</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
