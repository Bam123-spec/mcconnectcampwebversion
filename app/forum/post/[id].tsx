import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getPost, getComments, insertView } from "@/lib/forumService";
import { ForumPost, ForumComment } from "@/types/database";
import { getCategoryConfig } from "@/lib/forum/constants";
import ReactionBar from "@/components/forum/ReactionBar";
import SaveButton from "@/components/forum/SaveButton";
import Comment from "@/components/forum/Comment";
import CommentInput from "@/components/forum/CommentInput";

export default function PostDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [post, setPost] = useState<ForumPost | null>(null);
    const [comments, setComments] = useState<ForumComment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchData();
            insertView(id);
        }
    }, [id]);

    const fetchData = async () => {
        if (!id) return;
        try {
            const [postData, commentsData] = await Promise.all([
                getPost(id),
                getComments(id)
            ]);
            setPost(postData);
            setComments(commentsData);
        } catch (error) {
            console.error("Error fetching post details:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator color="#6D28D9" />
            </View>
        );
    }

    if (!post) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <Text className="text-gray-500">Post not found</Text>
                <Pressable onPress={() => router.back()} className="mt-4">
                    <Text className="text-[#6D28D9] font-bold">Go Back</Text>
                </Pressable>
            </View>
        );
    }

    const categoryConfig = getCategoryConfig(post.category);
    const date = new Date(post.created_at).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <View className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <SafeAreaView className="bg-white border-b border-gray-100" edges={["top"]}>
                <View className="px-4 py-3 flex-row items-center justify-between">
                    <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-gray-50">
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </Pressable>
                    <View className={`px-3 py-1 rounded-full ${categoryConfig.bg} border ${categoryConfig.border}`}>
                        <Text className={`text-[12px] font-bold uppercase tracking-wide ${categoryConfig.text}`}>
                            {categoryConfig.label}
                        </Text>
                    </View>
                    <SaveButton postId={post.id} isSaved={post.is_saved || false} size={24} />
                </View>
            </SafeAreaView>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
                    {/* Post Content */}
                    <View className="p-5 border-b border-gray-100">
                        {/* Author */}
                        <View className="flex-row items-center gap-3 mb-4">
                            <View className="h-12 w-12 rounded-full bg-gray-100 overflow-hidden border border-gray-100">
                                {post.author?.avatar_url ? (
                                    <Image source={{ uri: post.author.avatar_url }} className="h-full w-full" />
                                ) : (
                                    <View className="h-full w-full items-center justify-center bg-gray-200">
                                        <Ionicons name="person" size={20} color="#9CA3AF" />
                                    </View>
                                )}
                            </View>
                            <View>
                                <Text className="text-[16px] font-bold text-gray-900">{post.author?.full_name || "Anonymous"}</Text>
                                <Text className="text-[13px] text-gray-500">{date}</Text>
                            </View>
                        </View>

                        {/* Title & Body */}
                        <Text className="text-[22px] font-bold text-gray-900 mb-3 leading-8">
                            {post.title}
                        </Text>
                        <Text className="text-[16px] text-gray-700 leading-7 mb-5">
                            {post.content}
                        </Text>

                        {/* Image */}
                        {post.image_url && (
                            <View className="w-full rounded-[20px] overflow-hidden mb-6 bg-gray-100 shadow-sm">
                                <Image
                                    source={{ uri: post.image_url }}
                                    className="w-full h-[300px]"
                                    resizeMode="cover"
                                />
                            </View>
                        )}

                        {/* Stats & Reactions */}
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center gap-4">
                                <View className="flex-row items-center gap-1.5">
                                    <Ionicons name="eye-outline" size={18} color="#9CA3AF" />
                                    <Text className="text-[13px] text-gray-500">{post.views_count || 0} views</Text>
                                </View>
                                <View className="flex-row items-center gap-1.5">
                                    <Ionicons name="chatbubble-outline" size={18} color="#9CA3AF" />
                                    <Text className="text-[13px] text-gray-500">{comments.length} comments</Text>
                                </View>
                            </View>
                        </View>

                        <ReactionBar
                            postId={post.id}
                            totalLikes={post.likes_count || 0}
                            userReaction={post.user_reaction || null}
                        />
                    </View>

                    {/* Comments Section */}
                    <View className="p-5">
                        <Text className="text-[18px] font-bold text-gray-900 mb-4">Comments</Text>
                        {comments.length > 0 ? (
                            comments.map((comment) => (
                                <Comment key={comment.id} comment={comment} />
                            ))
                        ) : (
                            <Text className="text-gray-400 text-center py-8">No comments yet. Be the first!</Text>
                        )}
                    </View>
                </ScrollView>

                <CommentInput postId={post.id} onCommentAdded={fetchData} />
            </KeyboardAvoidingView>
        </View>
    );
}
