import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { toggleReaction } from "@/lib/forumService";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";

interface ReactionBarProps {
    postId: string;
    totalLikes: number;
    userReaction: string | null;
    compact?: boolean;
}

export default function ReactionBar({ postId, totalLikes, userReaction, compact = false }: ReactionBarProps) {
    const [likes, setLikes] = useState(totalLikes);
    const [currentReaction, setCurrentReaction] = useState(userReaction);

    const handleReaction = async (reaction: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const isRemoving = currentReaction === reaction;
        const newReaction = isRemoving ? null : reaction;

        // Optimistic update
        setCurrentReaction(newReaction);
        if (isRemoving) {
            setLikes(prev => Math.max(0, prev - 1));
        } else if (!currentReaction) {
            setLikes(prev => prev + 1);
        }
        // If switching reaction, count stays same (assuming 1 reaction per user)

        try {
            await toggleReaction(postId, reaction);
        } catch (error) {
            // Revert
            setCurrentReaction(currentReaction);
            setLikes(totalLikes);
            console.error("Error toggling reaction:", error);
        }
    };

    if (compact) {
        return (
            <Pressable
                onPress={() => handleReaction("like")}
                className="flex-row items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-full"
            >
                <Ionicons
                    name={currentReaction === "like" ? "heart" : "heart-outline"}
                    size={16}
                    color={currentReaction === "like" ? "#EF4444" : "#6B7280"}
                />
                <Text className={`text-[12px] font-medium ${currentReaction === "like" ? "text-red-500" : "text-gray-600"}`}>
                    {likes}
                </Text>
            </Pressable>
        );
    }

    // Full bar for details view
    const reactions = [
        { id: "like", icon: "heart", color: "#EF4444", label: "Like" },
        { id: "love", icon: "heart-circle", color: "#EC4899", label: "Love" },
        { id: "laugh", icon: "happy", color: "#F59E0B", label: "Haha" },
        { id: "support", icon: "hand-left", color: "#8B5CF6", label: "Support" },
    ];

    return (
        <View className="flex-row items-center gap-2">
            {reactions.map((r) => (
                <Pressable
                    key={r.id}
                    onPress={() => handleReaction(r.id)}
                    className={`flex-row items-center gap-1.5 px-3 py-2 rounded-full border ${currentReaction === r.id ? "bg-gray-50 border-gray-200" : "border-transparent"}`}
                >
                    <Ionicons
                        name={r.icon as any}
                        size={20}
                        color={currentReaction === r.id ? r.color : "#9CA3AF"}
                    />
                    {currentReaction === r.id && (
                        <MotiView from={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}>
                            <Text className="text-[12px] font-bold" style={{ color: r.color }}>1</Text>
                        </MotiView>
                    )}
                </Pressable>
            ))}
        </View>
    );
}
