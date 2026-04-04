import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Achievement, UserAchievement } from '@/types/database';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface AchievementCardProps {
    achievement: Achievement;
    userAchievement?: UserAchievement; // If present, it's unlocked
    onPress?: () => void;
}

export default function AchievementCard({ achievement, userAchievement, onPress }: AchievementCardProps) {
    const isUnlocked = !!userAchievement;
    const router = useRouter();

    const handlePress = () => {
        if (onPress) {
            onPress();
        } else {
            router.push(`/profile/achievements/${achievement.id}`);
        }
    };

    return (
        <Pressable
            onPress={handlePress}
            className={`w-[31%] mb-4 items-center ${!isUnlocked ? 'opacity-50' : ''}`}
        >
            <View
                className={`w-24 h-24 rounded-full items-center justify-center mb-2 shadow-sm relative ${!isUnlocked ? 'bg-gray-200 grayscale' : ''}`}
                style={isUnlocked ? { backgroundColor: achievement.bg_color || achievement.color + '20' } : {}}
            >
                <Text className="text-[40px]">{achievement.icon}</Text>

                {!isUnlocked && (
                    <View className="absolute inset-0 items-center justify-center bg-black/10 rounded-full">
                        <Ionicons name="lock-closed" size={24} color="#666" />
                    </View>
                )}
            </View>

            <Text className="text-[12px] font-bold text-center text-gray-900 leading-tight mb-1" numberOfLines={2}>
                {achievement.title}
            </Text>

            {isUnlocked && (
                <Text className="text-[10px] text-gray-500 text-center">
                    {new Date(userAchievement.earned_at).toLocaleDateString()}
                </Text>
            )}
        </Pressable>
    );
}
