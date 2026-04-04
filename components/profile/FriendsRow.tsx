import React from "react";
import { View, Text, ScrollView, Image, Pressable } from "react-native";
import { Profile } from "@/types/database";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

interface FriendsRowProps {
    friends: Profile[];
    onViewAll?: () => void;
}

export default function FriendsRow({ friends, onViewAll }: FriendsRowProps) {
    const { theme: currentTheme } = useTheme();
    return (
        <View className="mb-8">
            <View className="flex-row items-center justify-between px-5 mb-4">
                <Text className="text-[18px] font-h1" style={{ color: currentTheme.text }}>Friends</Text>
                <Pressable onPress={onViewAll}>
                    <Text className="text-[13px] font-button" style={{ color: currentTheme.primary }}>View All</Text>
                </Pressable>
            </View>

            {friends.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
                    {friends.map((friend) => (
                        <View key={friend.id} className="items-center w-[64px]">
                            <View className="h-16 w-16 rounded-full mb-2 overflow-hidden border" style={{ backgroundColor: currentTheme.surfaceSelected, borderColor: currentTheme.border }}>
                                {friend.avatar_url ? (
                                    <Image source={{ uri: friend.avatar_url }} className="h-full w-full" />
                                ) : (
                                    <View className="h-full w-full items-center justify-center" style={{ backgroundColor: currentTheme.surface }}>
                                        <Ionicons name="person" size={24} color={currentTheme.textLight} />
                                    </View>
                                )}
                            </View>
                            <Text className="text-[11px] font-metadata text-center" style={{ color: currentTheme.text }} numberOfLines={1}>
                                {friend.full_name?.split(" ")[0]}
                            </Text>
                        </View>
                    ))}
                </ScrollView>
            ) : (
                <View className="mx-5 p-4 rounded-2xl border border-dashed items-center" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>
                    <Text className="text-[13px] font-body" style={{ color: currentTheme.textMuted }}>No friends yet. Connect with people!</Text>
                </View>
            )}
        </View>
    );
}
