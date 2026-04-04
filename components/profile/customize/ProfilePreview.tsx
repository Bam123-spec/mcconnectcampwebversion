import React from "react";
import { View, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Profile } from "@/types/database";
import { LinearGradient } from "expo-linear-gradient";

interface ProfilePreviewProps {
    profile: Profile;
    tempAvatarType: 'photo' | 'preset';
    tempAvatarPreset: string | null;
    tempFrame: string | null;
    tempFlair: string | null;
    tempTheme: string | null;
    previewUri?: string | null;
}

const THEMES: Record<string, string[]> = {
    "default": ['transparent', 'rgba(0,0,0,0.2)'],
    "purple_haze": ['#7C3AED', '#4C1D95'],
    "sunrise": ['#F59E0B', '#EF4444'],
    "mc_blue": ['#3B82F6', '#1E40AF'],
    "minimal": ['#F3F4F6', '#E5E7EB'],
    "pastel": ['#F9A8D4', '#F472B6'],
};

const FRAMES: Record<string, string> = {
    "default": "border-white",
    "gold": "border-yellow-400",
    "neon": "border-purple-500",
    "officer": "border-green-500",
};

export default function ProfilePreview({ profile, tempAvatarType, tempAvatarPreset, tempFrame, tempFlair, tempTheme, previewUri }: ProfilePreviewProps) {
    const themeColors = THEMES[tempTheme || "default"] || THEMES["default"];
    const frameColor = FRAMES[tempFrame || "default"] || FRAMES["default"];

    // Determine avatar source
    let avatarSource = null;
    if (previewUri) {
        avatarSource = { uri: previewUri };
    } else if (tempAvatarType === 'photo' && profile.avatar_url) {
        avatarSource = { uri: profile.avatar_url };
    } else if (tempAvatarType === 'preset' && tempAvatarPreset) {
        // In a real app, map preset names to local images or URLs
        // For now, we'll use a placeholder or specific logic
        avatarSource = { uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${tempAvatarPreset}` };
    }

    return (
        <View className="mb-6 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mx-5 mt-4">
            {/* Cover / Theme */}
            <View className="h-[100px] w-full relative">
                <LinearGradient
                    colors={themeColors as any}
                    className="absolute inset-0"
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            </View>

            <View className="px-4 pb-4">
                <View className="flex-row justify-between items-end -mt-8 mb-2">
                    {/* Avatar with Frame */}
                    <View className={`h-20 w-20 rounded-full border-4 ${frameColor} bg-gray-100 overflow-hidden`}>
                        {avatarSource ? (
                            <Image source={avatarSource} className="h-full w-full" />
                        ) : (
                            <View className="h-full w-full items-center justify-center bg-gray-100">
                                <Ionicons name="person" size={32} color="#9CA3AF" />
                            </View>
                        )}
                    </View>
                </View>

                {/* Name & Flair */}
                <View>
                    <View className="flex-row items-center gap-2 mb-1">
                        <Text className="text-[18px] font-bold text-gray-900 leading-tight">
                            {profile.full_name || "Student"}
                        </Text>
                        {/* Flair */}
                        {tempFlair && (
                            <View className="bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200">
                                <Text className="text-[10px] font-bold text-purple-700">
                                    {tempFlair}
                                </Text>
                            </View>
                        )}
                    </View>
                    <Text className="text-[12px] text-gray-500 font-medium">
                        Student · Montgomery College
                    </Text>
                </View>
            </View>
        </View>
    );
}
