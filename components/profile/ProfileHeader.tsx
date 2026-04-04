import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Profile } from "@/types/database";
import { LinearGradient } from "expo-linear-gradient";
import AvatarRenderer from "@/components/avatar/AvatarRenderer";
import { useTheme } from "@/context/ThemeContext";

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

export default function ProfileHeader({ profile, onEditAvatar }: { profile: Profile | null, onEditAvatar?: () => void }) {
    const { darkMode, theme: currentTheme } = useTheme();
    const themeColors = THEMES[profile?.theme_style || "default"] || THEMES["default"];
    const frameColor = FRAMES[profile?.frame_style || "default"] || FRAMES["default"];

    // Determine avatar source
    let avatarSource = null;
    if (profile?.avatar_type === 'preset' && profile?.avatar_preset) {
        avatarSource = { uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${profile.avatar_preset}` };
    } else if (profile?.avatar_url) {
        avatarSource = { uri: profile.avatar_url };
    }

    return (
        <View className="mb-4">
            {/* Cover Image */}
            <View className="h-[140px] w-full relative" style={{ backgroundColor: currentTheme.surfaceSelected }}>
                <LinearGradient
                    colors={themeColors as any}
                    className="absolute inset-0"
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            </View>

            {/* Profile Info Container */}
            <View className="px-5">
                <View className="flex-row justify-between items-end -mt-6 mb-3">
                    {/* Avatar with Edit Button */}
                    <View className="relative">
                        <View className={`h-24 w-24 rounded-full border-4 ${frameColor} shadow-sm overflow-hidden items-center justify-center`} style={{ backgroundColor: currentTheme.bg }}>
                            {profile?.avatar_config && Object.keys(profile.avatar_config).length > 0 ? (
                                <AvatarRenderer config={profile.avatar_config} size={96} />
                            ) : avatarSource ? (
                                <Image source={avatarSource} className="h-full w-full" />
                            ) : (
                                <View className="h-full w-full items-center justify-center" style={{ backgroundColor: currentTheme.surface }}>
                                    <Ionicons name="person" size={40} color={currentTheme.textLight} />
                                </View>
                            )}
                        </View>
                        {/* Edit Avatar Button */}
                        <Pressable
                            onPress={onEditAvatar}
                            className="absolute bottom-0 right-0 p-1.5 rounded-full shadow-sm"
                            style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border, borderWidth: 1 }}
                        >
                            <Ionicons name="camera" size={14} color={currentTheme.primary} />
                        </Pressable>
                    </View>
                </View>

                {/* Name & Badge (Below Avatar) */}
                <View>
                    <View className="flex-row items-center gap-2 mb-1">
                        <Text className="text-[24px] font-h1 leading-tight" style={{ color: currentTheme.text }}>
                            {profile?.full_name || "Student"}
                        </Text>
                        {/* Flair */}
                        {profile?.flair && (
                            <View className="bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200">
                                <Text className="text-[10px] font-button text-purple-700">
                                    {profile.flair}
                                </Text>
                            </View>
                        )}
                        {/* XP Badge */}
                        <View className="bg-yellow-100 px-2 py-0.5 rounded-full border border-yellow-200 flex-row items-center gap-1">
                            <Ionicons name="star" size={10} color="#CA8A04" />
                            <Text className="text-[10px] font-button text-yellow-700">
                                {profile?.xp || 0} XP
                            </Text>
                        </View>
                    </View>
                    <Text className="text-[14px] font-body" style={{ color: currentTheme.textMuted }}>
                        Student · Montgomery College
                    </Text>
                </View>
            </View>
        </View>
    );
}
