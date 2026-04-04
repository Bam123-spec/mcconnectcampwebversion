import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

interface SelfProfileActionsProps {
    onEditProfile?: () => void;
    onSettings?: () => void;
    onShareProfile?: () => void;
}

export default function SelfProfileActions({ onEditProfile, onSettings, onShareProfile }: SelfProfileActionsProps) {
    const { theme: currentTheme } = useTheme();
    return (
        <View className="flex-row items-center gap-3 px-5 mb-6">
            {/* Edit Profile Button (Primary) */}
            <Pressable
                onPress={onEditProfile}
                className="flex-1 h-10 flex-row items-center justify-center gap-2 rounded-full shadow-sm"
                style={{ backgroundColor: currentTheme.primary }}
            >
                <Text className="text-[14px] font-bold text-white">Edit Profile</Text>
            </Pressable>

            {/* Settings Button (Secondary) */}
            <Pressable
                onPress={onSettings}
                className="h-10 px-4 flex-row items-center justify-center gap-2 rounded-full shadow-sm border"
                style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}
            >
                <Ionicons name="settings-outline" size={18} color={currentTheme.text} />
            </Pressable>

            {/* Share Profile Button (Icon) */}
            <Pressable
                onPress={onShareProfile}
                className="h-10 w-10 items-center justify-center rounded-full shadow-sm border"
                style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}
            >
                <Ionicons name="share-outline" size={18} color={currentTheme.text} />
            </Pressable>
        </View>
    );
}
