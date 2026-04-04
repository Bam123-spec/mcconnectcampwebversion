import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Achievement } from "@/types/database";
import { Ionicons } from "@expo/vector-icons";
import { useAchievements } from "@/context/AchievementContext";
import { useTheme } from "@/context/ThemeContext";

export interface AchievementPreviewItem {
    id: string;
    achievement: Achievement;
    unlockedAt?: string;
}

interface AchievementsRowProps {
    achievements: AchievementPreviewItem[];
}

export default function AchievementsRow({ achievements }: AchievementsRowProps) {
    const { showAchievementModal } = useAchievements();
    const { theme: currentTheme } = useTheme();

    if (!achievements || achievements.length === 0) return null;

    return (
        <View className="mb-8">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
                {achievements.map((item) => {
                    const { achievement, unlockedAt } = item;
                    const isUnlocked = !!unlockedAt;

                    return (
                        <View key={item.id} className={`items-center w-[80px] ${!isUnlocked ? 'opacity-60' : ''}`}>
                             <Pressable
                                onPress={() => {
                                    if (isUnlocked) {
                                        showAchievementModal(achievement);
                                    }
                                }}
                                className={`h-16 w-16 rounded-full items-center justify-center mb-2 shadow-sm relative ${!isUnlocked ? 'grayscale' : ''}`}
                                style={isUnlocked ? { backgroundColor: achievement.bg_color || achievement.color + '20' } : { backgroundColor: currentTheme.surfaceSelected }}
                            >
                                <Text className="text-[28px]">{achievement.icon}</Text>

                                {!isUnlocked && (
                                    <View className="absolute inset-0 items-center justify-center bg-black/10 rounded-full">
                                        <Ionicons name="lock-closed" size={16} color={currentTheme.textLight} />
                                    </View>
                                )}
                            </Pressable>
                            <Text className="text-[11px] font-metadata text-center leading-tight" style={{ color: currentTheme.text }} numberOfLines={2}>
                                {achievement.title}
                            </Text>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}
