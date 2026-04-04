import React from "react";
import { View, Text, ScrollView, Image, Pressable } from "react-native";
import { Event } from "@/types/database";
import { Ionicons } from "@expo/vector-icons";
import DateBubble from "../events/DateBubble";
import { useTheme } from "@/context/ThemeContext";

interface EventsRowProps {
    events: Event[];
}

export default function EventsRow({ events }: EventsRowProps) {
    const { theme: currentTheme } = useTheme();
    return (
        <View className="mb-8">
            <View className="px-5 mb-4">
                <Text className="text-[18px] font-bold" style={{ color: currentTheme.text }}>My Events</Text>
            </View>

            {events.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}>
                    {events.map((event) => {
                        const eventDay = event.day || event.date || new Date().toISOString().split('T')[0];
                        return (
                        <View key={event.id} className="w-[260px] rounded-2xl border shadow-sm overflow-hidden" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>
                            {/* Image */}
                            <View className="h-[120px] relative" style={{ backgroundColor: currentTheme.surfaceSelected }}>
                                {event.cover_image_url ? (
                                    <Image source={{ uri: event.cover_image_url }} className="h-full w-full" resizeMode="cover" />
                                ) : (
                                    <View className="h-full w-full items-center justify-center" style={{ backgroundColor: currentTheme.iconContainer }}>
                                        <Ionicons name="calendar" size={32} color={currentTheme.primary} />
                                    </View>
                                )}
                                <View className="absolute top-3 right-3">
                                    <DateBubble date={eventDay} />
                                </View>
                            </View>

                            {/* Content */}
                            <View className="p-3">
                                <Text className="text-[15px] font-bold mb-1" style={{ color: currentTheme.text }} numberOfLines={1}>
                                    {event.name}
                                </Text>
                                <View className="flex-row items-center gap-1 mb-3">
                                    <Ionicons name="location-outline" size={12} color={currentTheme.textMuted} />
                                    <Text className="text-[12px]" style={{ color: currentTheme.textMuted }} numberOfLines={1}>
                                        {event.location}
                                    </Text>
                                </View>

                                {/* Action */}
                                <Pressable className="py-2 rounded-lg items-center border" style={{ backgroundColor: currentTheme.surfaceSelected, borderColor: currentTheme.border }}>
                                    <Text className="text-[12px] font-bold" style={{ color: currentTheme.text }}>View Ticket</Text>
                                </Pressable>
                            </View>
                        </View>
                        );
                    })}
                </ScrollView>
            ) : (
                <View className="mx-5 p-4 rounded-2xl border border-dashed items-center" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>
                    <Text className="text-[13px]" style={{ color: currentTheme.textMuted }}>No upcoming events.</Text>
                </View>
            )}
        </View>
    );
}
