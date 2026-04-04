import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAchievements } from '@/context/AchievementContext';
import { getAchievements } from '@/lib/achievementService';
import { Achievement } from '@/types/database';
import { MotiView } from 'moti';

export default function AchievementDetailsScreen() {
    const { id } = useLocalSearchParams();
    const { unlockedAchievements, showAchievementModal } = useAchievements();
    const [achievement, setAchievement] = useState<Achievement | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAchievement();
    }, [id]);

    const loadAchievement = async () => {
        if (!id) return;
        // In a real app, we might fetch a single one, but since we have a small list, fetching all is fine or we can pass data.
        // For now, let's fetch all and find it, or optimize later.
        const all = await getAchievements();
        const found = all.find(a => a.id === id);
        setAchievement(found || null);
        setLoading(false);
    };

    const userAchievement = unlockedAchievements.find(ua => ua.achievement_id === id);
    const isUnlocked = !!userAchievement;

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#F7F5FC]">
                <ActivityIndicator size="large" color="#6D28D9" />
            </View>
        );
    }

    if (!achievement) {
        return (
            <View className="flex-1 items-center justify-center bg-[#F7F5FC]">
                <Text className="text-gray-500">Achievement not found</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#F7F5FC]">
            <Stack.Screen
                options={{
                    title: "",
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: '#F7F5FC' },
                    headerTintColor: '#1A1A1A',
                }}
            />

            <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center' }}>
                {/* Animated Ring & Icon */}
                <Pressable
                    onPress={() => {
                        if (isUnlocked && achievement) {
                            showAchievementModal(achievement);
                        }
                    }}
                    style={{ alignItems: 'center', justifyContent: 'center' }}
                >
                    <MotiView
                        from={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring' }}
                        className="mb-8 relative items-center justify-center"
                    >
                        {/* Outer Ring */}
                        <View
                            className={`w-48 h-48 rounded-full border-[6px] items-center justify-center ${isUnlocked ? 'border-transparent' : 'border-gray-200'}`}
                            style={isUnlocked ? { borderColor: achievement.color } : {}}
                        >
                            {/* Icon Container */}
                            <View
                                className={`w-40 h-40 rounded-full items-center justify-center shadow-lg ${!isUnlocked ? 'bg-gray-200 grayscale' : ''}`}
                                style={isUnlocked ? { backgroundColor: achievement.bg_color || achievement.color + '20' } : {}}
                            >
                                <Text className="text-[80px]">{achievement.icon}</Text>
                            </View>
                        </View>

                        {isUnlocked && (
                            <View className="absolute -bottom-4 bg-green-500 px-4 py-1 rounded-full border-2 border-white shadow-sm">
                                <Text className="text-white font-bold text-[12px]">UNLOCKED</Text>
                            </View>
                        )}
                    </MotiView>
                </Pressable>

                {/* Title & Category */}
                <Text className="text-[28px] font-extrabold text-gray-900 text-center mb-2">
                    {achievement.title}
                </Text>

                <View className="flex-row gap-2 mb-6">
                    <View className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200">
                        <Text className="text-[12px] font-medium text-gray-600">{achievement.category}</Text>
                    </View>
                    <View
                        className="px-3 py-1 rounded-full border"
                        style={{
                            backgroundColor: achievement.color + '10',
                            borderColor: achievement.color + '40'
                        }}
                    >
                        <Text
                            className="text-[12px] font-bold"
                            style={{ color: achievement.color }}
                        >
                            {achievement.rarity.toUpperCase()}
                        </Text>
                    </View>
                </View>

                {/* Description */}
                <View className="bg-white p-6 rounded-2xl w-full shadow-sm border border-gray-100 mb-6">
                    <Text className="text-[16px] text-gray-600 text-center leading-6">
                        {achievement.description}
                    </Text>
                </View>

                {/* Status / Progress */}
                <View className="w-full">
                    <Text className="text-[14px] font-bold text-gray-900 mb-3 ml-1">Status</Text>
                    <View className="bg-white p-4 rounded-xl border border-gray-100 flex-row items-center">
                        <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isUnlocked ? 'bg-green-100' : 'bg-gray-100'}`}>
                            <Ionicons
                                name={isUnlocked ? "checkmark" : "lock-closed"}
                                size={20}
                                color={isUnlocked ? "#10B981" : "#9CA3AF"}
                            />
                        </View>
                        <View>
                            <Text className="text-[14px] font-medium text-gray-900">
                                {isUnlocked ? "Achievement Earned" : "Locked"}
                            </Text>
                            <Text className="text-[12px] text-gray-500">
                                {isUnlocked
                                    ? `Unlocked on ${new Date(userAchievement.earned_at).toLocaleDateString()}`
                                    : "Complete the requirements to unlock"}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
