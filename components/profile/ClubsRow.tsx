import React from "react";
import { View, Text, ScrollView, Image, Pressable } from "react-native";
import { Club } from "@/types/database";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

interface ClubsRowProps {
    clubs: Club[];
}

export default function ClubsRow({ clubs }: ClubsRowProps) {
    const { theme: currentTheme } = useTheme();
    return (
        <View className="mb-8">
            <View className="flex-row items-center justify-between px-5 mb-4">
                <Text className="text-[18px] font-h1" style={{ color: currentTheme.text }}>Clubs</Text>
                <Pressable>
                    <Text className="text-[13px] font-button" style={{ color: currentTheme.primary }}>View All</Text>
                </Pressable>
            </View>

            {clubs.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
                    {clubs.map((club) => (
                        <View key={club.id} className="w-[140px] p-3 rounded-2xl border shadow-sm" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>
                            <View className="h-20 w-full rounded-xl mb-3 overflow-hidden" style={{ backgroundColor: currentTheme.surfaceSelected }}>
                                {club.cover_image_url ? (
                                    <Image source={{ uri: club.cover_image_url }} className="h-full w-full" resizeMode="cover" />
                                ) : (
                                    <View className="h-full w-full items-center justify-center" style={{ backgroundColor: currentTheme.surfaceSelected }}>
                                        <Ionicons name="people" size={24} color={currentTheme.textLight} />
                                    </View>
                                )}
                            </View>
                            <Text className="text-[13px] font-button leading-tight mb-1" style={{ color: currentTheme.text }} numberOfLines={2}>
                                {club.name}
                            </Text>
                            <Text className="text-[11px] font-metadata" style={{ color: currentTheme.textMuted }}>{club.member_count || 0} Members</Text>
                        </View>
                    ))}
                </ScrollView>
            ) : (
                <View className="mx-5 p-4 rounded-2xl border border-dashed items-center" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>
                    <Text className="text-[13px] font-body" style={{ color: currentTheme.textMuted }}>Not a member of any clubs yet.</Text>
                </View>
            )}
        </View>
    );
}
