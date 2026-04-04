import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useTheme } from "@/context/ThemeContext";
import { Event } from "@/types/database";
import DateBubble from "./DateBubble";

interface EventCardProps {
    event: Event;
    onUpdate?: (updatedEvent: Partial<Event>) => void;
    showScanQr?: boolean;
}

export default function EventCard({ event, onUpdate, showScanQr }: EventCardProps) {
    const { darkMode, theme: currentTheme } = useTheme();
    const router = useRouter();

    return (
        <Pressable
            onPress={() => router.push(`/event-details/${event.id}`)}
            className="rounded-[24px] mb-5 overflow-hidden mx-5"
            style={{ 
                backgroundColor: currentTheme.surface,
                borderColor: currentTheme.border,
                borderWidth: darkMode ? 1 : 0,
                shadowColor: "#000", 
                shadowOffset: { width: 0, height: 6 }, 
                shadowOpacity: darkMode ? 0 : 0.05, 
                shadowRadius: 12, 
                elevation: 4 
            }}
        >
            {/* Hero Image */}
            <View className="h-[140px] bg-gray-200 relative">
                {event.cover_image_url ? (
                    <Image source={{ uri: event.cover_image_url }} className="h-full w-full" resizeMode="cover" />
                ) : (
                    <View 
                        style={{ backgroundColor: darkMode ? '#1E293B' : '#F5F3FF' }}
                        className="h-full w-full items-center justify-center"
                    >
                        <Ionicons name="calendar" size={40} color={currentTheme.primary} />
                    </View>
                )}

                {/* Date Bubble Overlay */}
                <View className="absolute top-3 right-3 shadow-sm" style={{ shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}>
                    <DateBubble date={event.date} />
                </View>

                {/* Registered Badge */}
                {event.is_registered && (
                    <View className="absolute top-3 left-3 shadow-sm">
                        <BlurView intensity={80} tint={darkMode ? "dark" : "light"} className="rounded-full overflow-hidden">
                            <View className="bg-green-500/80 px-2.5 py-1 border border-white/30">
                                <Text className="text-[10px] font-bold text-white uppercase tracking-wider">Registered</Text>
                            </View>
                        </BlurView>
                    </View>
                )}
            </View>

            {/* Content */}
            <View className="p-4 pt-5">
                <Text style={{ color: currentTheme.text }} className="text-[19px] font-h1 mb-1 leading-6 tracking-tight" numberOfLines={2}>
                    {event.name}
                </Text>

                <Text style={{ color: currentTheme.textLight }} className="text-[14px] font-body mb-4 leading-5" numberOfLines={2}>
                    {event.description || "No description available."}
                </Text>

                {/* Info Row */}
                <View className="flex-row items-center gap-4 mb-4">
                    <View className="flex-row items-center gap-1.5 flex-1">
                        <View 
                            style={{ backgroundColor: darkMode ? '#334155' : '#F5F3FF' }}
                            className="p-1.5 rounded-full"
                        >
                            <Ionicons name="location-outline" size={14} color={currentTheme.primary} />
                        </View>
                        <Text style={{ color: currentTheme.text }} className="text-[13px] font-medium" numberOfLines={1}>
                            {event.location}
                        </Text>
                    </View>
                </View>

                {/* Footer Actions */}
                <View 
                    style={{ borderTopColor: currentTheme.border, borderTopWidth: 1 }}
                    className="flex-row items-center justify-between pt-4"
                >
                    <View className="flex-row items-center gap-2">
                        {event.is_registered && (
                            <View 
                                style={{ 
                                    backgroundColor: darkMode ? 'rgba(16, 185, 129, 0.1)' : '#F0FDF4',
                                    borderColor: darkMode ? 'rgba(16, 185, 129, 0.2)' : '#DCFCE7'
                                }}
                                className="flex-row items-center gap-1.5 px-2.5 py-1.5 rounded-full border"
                            >
                                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                                <Text className="text-[12px] font-semibold text-green-700">Going</Text>
                            </View>
                        )}
                    </View>

                    {showScanQr && (
                        <Pressable
                            style={{ 
                                backgroundColor: currentTheme.text,
                                shadowColor: "#000", 
                                shadowOffset: { width: 0, height: 2 }, 
                                shadowOpacity: 0.1, 
                                shadowRadius: 3, 
                                elevation: 3 
                            }}
                            className="flex-row items-center gap-1.5 px-4 py-2 rounded-full"
                            onPress={(e) => {
                                e.stopPropagation();
                                // Handle scan QR action
                                console.log("Scan QR for event:", event.id);
                            }}
                        >
                            <Ionicons name="scan-outline" size={16} color={currentTheme.bg} />
                            <Text style={{ color: currentTheme.bg }} className="text-[13px] font-bold tracking-wide">Scan QR</Text>
                        </Pressable>
                    )}
                </View>
            </View>
        </Pressable>
    );
}
