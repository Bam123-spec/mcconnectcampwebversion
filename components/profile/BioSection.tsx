import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Profile } from "@/types/database";
import { useTheme } from "@/context/ThemeContext";

interface BioSectionProps {
    profile: Profile | null;
}

export default function BioSection({ profile }: BioSectionProps) {
    const { theme: currentTheme } = useTheme();
    return (
        <View className="px-5 mb-8">
            {/* Major & Year */}
            <View className="flex-row flex-wrap gap-2 mb-4">
                {profile?.major && (
                    <View className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ backgroundColor: currentTheme.surfaceSelected }}>
                        <Ionicons name="school-outline" size={14} color={currentTheme.textMuted} />
                        <Text className="text-[12px] font-metadata" style={{ color: currentTheme.text }}>{profile.major}</Text>
                    </View>
                )}
                {profile?.year && (
                    <View className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ backgroundColor: currentTheme.surfaceSelected }}>
                        <Ionicons name="calendar-outline" size={14} color={currentTheme.textMuted} />
                        <Text className="text-[12px] font-metadata" style={{ color: currentTheme.text }}>{profile.year}</Text>
                    </View>
                )}
            </View>

            {/* Bio Text */}
            <Text className="text-[14px] font-body leading-6 mb-4" style={{ color: currentTheme.textMuted }}>
                {profile?.bio || "Add a short bio to help students know you better."}
            </Text>

            {/* Interests */}
            {profile?.interests && profile.interests.length > 0 && (
                <View className="flex-row flex-wrap gap-2">
                    {profile.interests.map((interest, index) => (
                        <View key={index} className="px-3 py-1 rounded-full border" style={{ borderColor: currentTheme.border }}>
                            <Text className="text-[11px] font-metadata" style={{ color: currentTheme.textMuted }}>#{interest}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}
