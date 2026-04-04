import React, { useState, useCallback } from "react";
import { View, Text, FlatList, Image, ActivityIndicator, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { getFriends } from "@/lib/profileService";
import { Profile } from "@/types/database";

export default function FriendsScreen() {
    const router = useRouter();
    const [friends, setFriends] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFriends = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const data = await getFriends(user.id);
                setFriends(data);
            }
        } catch (error) {
            console.error("Error fetching friends:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchFriends();
        }, [])
    );

    return (
        <View className="flex-1 bg-[#F7F5FC]">
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView className="flex-1" edges={["top"]}>
                {/* Header */}
                <View className="px-5 py-3 flex-row items-center gap-4 bg-white border-b border-gray-100">
                    <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-gray-50">
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </Pressable>
                    <Text className="text-[18px] font-bold text-gray-900">Friends</Text>
                </View>

                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#6D28D9" />
                    </View>
                ) : (
                    <FlatList
                        data={friends}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                        ListEmptyComponent={
                            <View className="items-center justify-center py-20">
                                <View className="h-20 w-20 rounded-full bg-purple-50 items-center justify-center mb-4">
                                    <Ionicons name="people-outline" size={40} color="#6D28D9" />
                                </View>
                                <Text className="text-[18px] font-bold text-gray-900 mb-2">No Friends Yet</Text>
                                <Text className="text-[14px] text-gray-500 text-center px-10 mb-6">
                                    Connect with other students on campus to see them here!
                                </Text>
                                <Pressable
                                    onPress={() => router.push("/profile/find-friends")}
                                    className="bg-[#6D28D9] px-6 py-3 rounded-full"
                                >
                                    <Text className="text-white font-bold">Find Friends</Text>
                                </Pressable>
                            </View>
                        }
                        renderItem={({ item }) => (
                            <Pressable
                                onPress={() => router.push(`/profile/${item.id}`)}
                                className="flex-row items-center justify-between bg-white p-4 rounded-[20px] mb-3 shadow-sm shadow-black/5 border border-gray-100"
                            >
                                <View className="flex-row items-center gap-3">
                                    <View className="h-12 w-12 rounded-full bg-gray-100 overflow-hidden border border-gray-100">
                                        {item.avatar_url ? (
                                            <Image source={{ uri: item.avatar_url }} className="h-full w-full" />
                                        ) : (
                                            <View className="h-full w-full items-center justify-center bg-[#E9E3FF]">
                                                <Text className="text-[18px] font-bold text-[#6D28D9]">{item.full_name?.charAt(0) || "?"}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View>
                                        <Text className="text-[16px] font-bold text-gray-900">{item.full_name}</Text>
                                        <Text className="text-[12px] text-gray-500">Student</Text>
                                    </View>
                                </View>
                                <View className="h-9 w-9 rounded-full bg-gray-50 items-center justify-center">
                                    <Ionicons name="chevron-forward" size={18} color="#6B7280" />
                                </View>
                            </Pressable>
                        )}
                    />
                )}
            </SafeAreaView>
        </View>
    );
}
