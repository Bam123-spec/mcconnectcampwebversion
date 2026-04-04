import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { ForumPost } from "@/types/database";
import { getCategoryConfig } from "@/lib/forum/constants";
import ReactionBar from "./ReactionBar";
import SaveButton from "./SaveButton";

interface PostCardProps {
    post: ForumPost;
    index?: number;
}

export default function PostCard({ post, index = 0 }: PostCardProps) {
    const router = useRouter();
    const categoryConfig = getCategoryConfig(post.category);
    const date = new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    return (
        <Link href={`/forum/post/${post.id}`} asChild>
            <Pressable>
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "timing", duration: 500, delay: index * 100 }}
                    className="bg-white rounded-[24px] p-5 mb-4 shadow-sm shadow-black/5 border border-gray-100"
                >
                    {/* Header */}
                    <View className="flex-row justify-between items-start mb-3">
                        <View className="flex-row items-center gap-3">
                            <View className="h-10 w-10 rounded-full bg-gray-100 overflow-hidden border border-gray-100">
                                {post.author?.avatar_url ? (
                                    <Image source={{ uri: post.author.avatar_url }} className="h-full w-full" />
                                ) : (
                                    <View className="h-full w-full items-center justify-center bg-gray-200">
                                        <Ionicons name="person" size={16} color="#9CA3AF" />
                                    </View>
                                )}
                            </View>
                            <View>
                                <Text className="text-[14px] font-button text-gray-900">{post.author?.full_name || "Anonymous"}</Text>
                                <Text className="text-[12px] font-metadata text-gray-500">{date}</Text>
                            </View>
                        </View>

                        <View className={`px-2.5 py-1 rounded-full ${categoryConfig.bg} border ${categoryConfig.border}`}>
                            <Text className={`text-[10px] font-button uppercase tracking-wide ${categoryConfig.text}`}>
                                {categoryConfig.label}
                            </Text>
                        </View>
                    </View>

                    {/* Content */}
                    <Text className="text-[17px] font-h1 text-gray-900 mb-1.5 leading-6">
                        {post.title}
                    </Text>
                    <Text className="text-[14px] font-body text-gray-600 leading-5 mb-3" numberOfLines={3}>
                        {post.content}
                    </Text>

                    {/* Image Preview */}
                    {post.image_url && (
                        <View className="h-[180px] w-full rounded-[16px] overflow-hidden mb-4 bg-gray-100">
                            <Image source={{ uri: post.image_url }} className="h-full w-full" resizeMode="cover" />
                        </View>
                    )}

                    {/* Footer Actions */}
                    <View className="flex-row items-center justify-between pt-2">
                        <View className="flex-row items-center gap-3">
                            <ReactionBar
                                postId={post.id}
                                totalLikes={post.likes_count || 0}
                                userReaction={post.user_reaction || null}
                                compact
                            />

                            <View className="flex-row items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-full">
                                <Ionicons name="chatbubble-outline" size={16} color="#6B7280" />
                                <Text className="text-[12px] font-metadata text-gray-600">{post.comments_count || 0}</Text>
                            </View>

                            <View className="flex-row items-center gap-1.5 px-1">
                                <Ionicons name="eye-outline" size={16} color="#9CA3AF" />
                                <Text className="text-[12px] font-metadata text-gray-400">{post.views_count || 0}</Text>
                            </View>
                        </View>

                        <SaveButton postId={post.id} isSaved={post.is_saved || false} />
                    </View>
                </MotiView>
            </Pressable>
        </Link>
    );
}
