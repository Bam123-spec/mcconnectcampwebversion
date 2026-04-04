import React, { useState, useCallback } from "react";
import { View, Text, FlatList, Image, ActivityIndicator, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { getAllStudents, addFriend } from "@/lib/profileService";
import { Profile } from "@/types/database";

export default function FindFriendsScreen() {
    const router = useRouter();
    const [students, setStudents] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingId, setAddingId] = useState<string | null>(null);

    const fetchStudents = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const data = await getAllStudents(user.id);
                setStudents(data);
            }
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchStudents();
        }, [])
    );

    const handleAddFriend = async (friendId: string) => {
        try {
            setAddingId(friendId);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await addFriend(user.id, friendId);
            Alert.alert("Success", "Friend request sent!");

            // Remove from list
            setStudents(prev => prev.filter(s => s.id !== friendId));
        } catch (error) {
            Alert.alert("Error", "Could not send friend request.");
            console.error(error);
        } finally {
            setAddingId(null);
        }
    };

    return (
        <View className="flex-1 bg-[#F7F5FC]">
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView className="flex-1" edges={["top"]}>
                {/* Header */}
                <View className="px-5 py-3 flex-row items-center gap-4 bg-white border-b border-gray-100">
                    <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-gray-50">
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </Pressable>
                    <Text className="text-[18px] font-bold text-gray-900">Find Friends</Text>
                </View>

                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#6D28D9" />
                    </View>
                ) : (
                    <FlatList
                        data={students}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                        ListEmptyComponent={
                            <View className="items-center justify-center py-20">
                                <Text className="text-[16px] text-gray-500">No new students found.</Text>
                            </View>
                        }
                        renderItem={({ item }) => (
                            <View className="flex-row items-center justify-between bg-white p-4 rounded-[20px] mb-3 shadow-sm shadow-black/5 border border-gray-100">
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

                                <Pressable
                                    onPress={() => handleAddFriend(item.id)}
                                    disabled={addingId === item.id}
                                    className={`px-4 py-2 rounded-full ${addingId === item.id ? 'bg-gray-100' : 'bg-[#6D28D9]'}`}
                                >
                                    {addingId === item.id ? (
                                        <ActivityIndicator size="small" color="#6D28D9" />
                                    ) : (
                                        <Text className="text-white font-bold text-[12px]">Add</Text>
                                    )}
                                </Pressable>
                            </View>
                        )}
                    />
                )}
            </SafeAreaView>
        </View>
    );
}
