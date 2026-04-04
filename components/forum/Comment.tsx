import React from "react";
import { View, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ForumComment } from "@/types/database";

interface CommentProps {
    comment: ForumComment;
    depth?: number;
}

export default function Comment({ comment, depth = 0 }: CommentProps) {
    const date = new Date(comment.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    return (
        <View
            className="mb-4"
            style={{ marginLeft: depth * 20 }} // Visual nesting
        >
            <View className="flex-row gap-3">
                {/* Avatar */}
                <View className="h-8 w-8 rounded-full bg-gray-100 overflow-hidden border border-gray-100 mt-1">
                    {comment.author?.avatar_url ? (
                        <Image source={{ uri: comment.author.avatar_url }} className="h-full w-full" />
                    ) : (
                        <View className="h-full w-full items-center justify-center bg-gray-200">
                            <Ionicons name="person" size={12} color="#9CA3AF" />
                        </View>
                    )}
                </View>

                {/* Content */}
                <View className="flex-1 bg-gray-50 rounded-[16px] rounded-tl-none p-3">
                    <View className="flex-row justify-between items-center mb-1">
                        <Text className="text-[12px] font-bold text-gray-900">
                            {comment.author?.full_name || "Anonymous"}
                        </Text>
                        <Text className="text-[10px] text-gray-400">{date}</Text>
                    </View>
                    <Text className="text-[13px] text-gray-700 leading-5">
                        {comment.content}
                    </Text>
                </View>
            </View>
        </View>
    );
}
