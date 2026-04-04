import React, { useState } from "react";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { savePost, unsavePost } from "@/lib/forumService";
import * as Haptics from "expo-haptics";

interface SaveButtonProps {
    postId: string;
    isSaved: boolean;
    size?: number;
    color?: string;
}

export default function SaveButton({ postId, isSaved: initialSaved, size = 20, color = "#6B7280" }: SaveButtonProps) {
    const [saved, setSaved] = useState(initialSaved);

    const handlePress = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const newState = !saved;
        setSaved(newState);

        try {
            if (newState) {
                await savePost(postId);
            } else {
                await unsavePost(postId);
            }
        } catch (error) {
            setSaved(!newState); // Revert
            console.error("Error toggling save:", error);
        }
    };

    return (
        <Pressable onPress={handlePress} hitSlop={10}>
            <Ionicons
                name={saved ? "bookmark" : "bookmark-outline"}
                size={size}
                color={saved ? "#6D28D9" : color}
            />
        </Pressable>
    );
}
