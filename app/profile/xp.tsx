import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "@/lib/supabase";
import { getProfile } from "@/lib/profileService";
import { Profile } from "@/types/database";
import { MotiView } from "moti";

export default function XPScreen() {
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchXP = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const data = await getProfile(user.id);
                setProfile(data);
            }
        } catch (error) {
            console.error("Error fetching XP:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchXP();
        }, [])
    );

    const xp = profile?.xp || 0;
    const level = Math.floor(xp / 100) + 1;
    const nextLevelXP = level * 100;
    const progress = (xp % 100) / 100;

    return (
        <View className="flex-1 bg-[#F7F5FC]">
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView className="flex-1" edges={["top"]}>
                {/* Header */}
                <View className="px-5 py-3 flex-row items-center gap-4 bg-white border-b border-gray-100">
                    <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-gray-50">
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </Pressable>
                    <Text className="text-[18px] font-bold text-gray-900">Your Progress</Text>
                </View>

                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#6D28D9" />
                    </View>
                ) : (
                    <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
                        {/* Level Card */}
                        <MotiView
                            from={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring" }}
                            className="bg-white rounded-[32px] p-6 items-center shadow-sm shadow-purple-200 border border-purple-50 mb-6"
                        >
                            <LinearGradient
                                colors={['#FFD700', '#FDB931']}
                                className="h-24 w-24 rounded-full items-center justify-center mb-4 shadow-sm shadow-yellow-200"
                            >
                                <Text className="text-[32px] font-black text-[#78350F]">{level}</Text>
                                <Text className="text-[10px] font-bold text-[#78350F] uppercase">Level</Text>
                            </LinearGradient>

                            <Text className="text-[24px] font-bold text-gray-900 mb-1">Level {level}</Text>
                            <Text className="text-[14px] text-gray-500 mb-6">Keep engaging to earn more XP!</Text>

                            {/* Progress Bar */}
                            <View className="w-full h-4 bg-gray-100 rounded-full overflow-hidden mb-2">
                                <View
                                    className="h-full bg-[#FDB931] rounded-full"
                                    style={{ width: `${progress * 100}%` }}
                                />
                            </View>
                            <View className="w-full flex-row justify-between">
                                <Text className="text-[12px] font-bold text-gray-400">{xp} XP</Text>
                                <Text className="text-[12px] font-bold text-gray-400">{nextLevelXP} XP</Text>
                            </View>
                        </MotiView>

                        {/* How to Earn */}
                        <Text className="text-[18px] font-bold text-gray-900 mb-4">How to Earn XP</Text>
                        <View className="bg-white rounded-[24px] p-5 shadow-sm shadow-black/5 border border-gray-100 gap-4">
                            <View className="flex-row items-center gap-4">
                                <View className="h-10 w-10 rounded-full bg-blue-50 items-center justify-center">
                                    <Ionicons name="chatbubble" size={20} color="#3B82F6" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[15px] font-bold text-gray-900">Post on Forum</Text>
                                    <Text className="text-[12px] text-gray-500">+10 XP per post</Text>
                                </View>
                            </View>

                            <View className="flex-row items-center gap-4">
                                <View className="h-10 w-10 rounded-full bg-green-50 items-center justify-center">
                                    <Ionicons name="calendar" size={20} color="#10B981" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[15px] font-bold text-gray-900">Attend Events</Text>
                                    <Text className="text-[12px] text-gray-500">+50 XP per event</Text>
                                </View>
                            </View>

                            <View className="flex-row items-center gap-4">
                                <View className="h-10 w-10 rounded-full bg-purple-50 items-center justify-center">
                                    <Ionicons name="heart" size={20} color="#8B5CF6" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[15px] font-bold text-gray-900">Get Likes</Text>
                                    <Text className="text-[12px] text-gray-500">+2 XP per like</Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                )}
            </SafeAreaView>
        </View>
    );
}
