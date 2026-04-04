import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAchievements } from '@/context/AchievementContext';
import { getAchievements } from '@/lib/achievementService';
import { Achievement } from '@/types/database';
import AchievementCard from '@/components/achievements/AchievementCard';

const CATEGORIES = ['All', 'Clubs', 'Events', 'Social', 'Chat', 'Campus', 'Special'];

export default function AchievementsListScreen() {
    const router = useRouter();
    const { unlockedAchievements } = useAchievements();
    const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        loadAchievements();
    }, []);

    const loadAchievements = async () => {
        const data = await getAchievements();
        setAllAchievements(data);
        setLoading(false);
    };

    const unlockedIds = new Set(unlockedAchievements.map(ua => ua.achievement_id));

    const filteredAchievements = allAchievements.filter(a => {
        const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || a.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const unlockedList = filteredAchievements.filter(a => unlockedIds.has(a.id));
    const lockedList = filteredAchievements.filter(a => !unlockedIds.has(a.id));

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#F7F5FC]">
                <ActivityIndicator size="large" color="#6D28D9" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#F7F5FC]">
            <Stack.Screen
                options={{
                    title: "Achievements",
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: '#F7F5FC' },
                    headerTintColor: '#1A1A1A',
                }}
            />

            {/* Search & Filter Header */}
            <View className="px-4 py-2 bg-[#F7F5FC] z-10">
                <View className="flex-row items-center bg-white rounded-xl px-3 h-10 mb-4 shadow-sm border border-gray-100">
                    <Ionicons name="search" size={20} color="#9CA3AF" />
                    <TextInput
                        placeholder="Search achievements..."
                        className="flex-1 ml-2 text-[14px]"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <Pressable onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                        </Pressable>
                    )}
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                    {CATEGORIES.map(cat => (
                        <Pressable
                            key={cat}
                            onPress={() => setSelectedCategory(cat)}
                            className={`px-4 py-1.5 rounded-full mr-2 ${selectedCategory === cat ? 'bg-[#6D28D9]' : 'bg-white border border-gray-200'}`}
                        >
                            <Text className={`text-[13px] font-medium ${selectedCategory === cat ? 'text-white' : 'text-gray-600'}`}>
                                {cat}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
                {/* Stats Summary */}
                <View className="flex-row justify-between mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <View className="items-center flex-1">
                        <Text className="text-[24px] font-bold text-[#6D28D9]">{unlockedAchievements.length}</Text>
                        <Text className="text-[12px] text-gray-500">Unlocked</Text>
                    </View>
                    <View className="w-[1px] bg-gray-100" />
                    <View className="items-center flex-1">
                        <Text className="text-[24px] font-bold text-gray-900">{allAchievements.length}</Text>
                        <Text className="text-[12px] text-gray-500">Total</Text>
                    </View>
                    <View className="w-[1px] bg-gray-100" />
                    <View className="items-center flex-1">
                        <Text className="text-[24px] font-bold text-[#F59E0B]">
                            {Math.round((unlockedAchievements.length / (allAchievements.length || 1)) * 100)}%
                        </Text>
                        <Text className="text-[12px] text-gray-500">Completion</Text>
                    </View>
                </View>

                {/* Unlocked Section */}
                {unlockedList.length > 0 && (
                    <View className="mb-6">
                        <Text className="text-[16px] font-bold text-gray-900 mb-3 ml-1">Unlocked ({unlockedList.length})</Text>
                        <View className="flex-row flex-wrap justify-between">
                            {unlockedList.map(achievement => (
                                <AchievementCard
                                    key={achievement.id}
                                    achievement={achievement}
                                    userAchievement={unlockedAchievements.find(ua => ua.achievement_id === achievement.id)}
                                />
                            ))}
                            {/* Spacer for grid alignment */}
                            {unlockedList.length % 3 === 2 && <View className="w-[31%]" />}
                        </View>
                    </View>
                )}

                {/* Locked Section */}
                {lockedList.length > 0 && (
                    <View>
                        <Text className="text-[16px] font-bold text-gray-900 mb-3 ml-1">Locked ({lockedList.length})</Text>
                        <View className="flex-row flex-wrap justify-between">
                            {lockedList.map(achievement => (
                                <AchievementCard
                                    key={achievement.id}
                                    achievement={achievement}
                                />
                            ))}
                            {/* Spacer for grid alignment */}
                            {lockedList.length % 3 === 2 && <View className="w-[31%]" />}
                        </View>
                    </View>
                )}

                {filteredAchievements.length === 0 && (
                    <View className="items-center justify-center py-10">
                        <Text className="text-gray-400">No achievements found</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
