import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getEventById, registerForEvent, unregisterFromEvent, saveEvent, unsaveEvent } from "@/lib/eventService";
import { Event } from "@/types/database";
import DateBubble from "@/components/events/DateBubble";
import QRModal from "@/components/events/QRModal";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/context/ThemeContext";

export default function EventDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { theme: currentTheme, darkMode } = useTheme();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [qrData, setQrData] = useState("");

    useEffect(() => {
        if (id) {
            fetchEvent();
        }
    }, [id]);

    const fetchEvent = async () => {
        setLoading(true);
        const data = await getEventById(id!);
        setEvent(data);
        setLoading(false);
    };

    const handleRegister = async () => {
        if (!event) return;
        setActionLoading(true);
        try {
            if (event.is_registered) {
                await unregisterFromEvent(event.id);
                setEvent({ ...event, is_registered: false });
                Alert.alert("Unregistered", "You have been removed from this event.");
            } else {
                await registerForEvent(event.id);
                setEvent({ ...event, is_registered: true });
                Alert.alert("Success", "You are registered for this event!");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to update registration.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleSave = async () => {
        if (!event) return;
        try {
            if (event.is_saved) {
                await unsaveEvent(event.id);
                setEvent({ ...event, is_saved: false });
            } else {
                await saveEvent(event.id);
                setEvent({ ...event, is_saved: true });
            }
        } catch (error) {
            console.error("Error toggling save:", error);
        }
    };

    const handleShowTicket = async () => {
        if (!event) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const data = JSON.stringify({
            eventId: event.id,
            userId: user.id,
            timestamp: new Date().toISOString()
        });
        setQrData(data);
        setShowQR(true);
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center transition-colors duration-300" style={{ backgroundColor: currentTheme.bg }}>
                <ActivityIndicator color={currentTheme.primary} />
            </View>
        );
    }

    if (!event) {
        return (
            <View className="flex-1 items-center justify-center transition-colors duration-300" style={{ backgroundColor: currentTheme.bg }}>
                <Text style={{ color: currentTheme.textMuted }}>Event not found</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 transition-colors duration-300" style={{ backgroundColor: currentTheme.bg }}>
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Hero Image */}
                <View className="h-[250px] relative" style={{ backgroundColor: currentTheme.surface }}>
                    {event.cover_image_url ? (
                        <Image source={{ uri: event.cover_image_url }} className="h-full w-full" resizeMode="cover" />
                    ) : (
                        <View className="h-full w-full items-center justify-center" style={{ backgroundColor: darkMode ? '#1E293B' : '#F3E8FF' }}>
                            <Ionicons name="calendar" size={60} color={currentTheme.primary} />
                        </View>
                    )}

                    {/* Back Button */}
                    <Pressable
                        onPress={() => router.back()}
                        className="absolute top-12 left-5 h-10 w-10 rounded-full items-center justify-center shadow-sm"
                        style={{ backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)' }}
                    >
                        <Ionicons name="arrow-back" size={24} color={currentTheme.text} />
                    </Pressable>

                    {/* Save Button */}
                    <Pressable
                        onPress={handleSave}
                        className="absolute top-12 right-5 h-10 w-10 rounded-full items-center justify-center shadow-sm"
                        style={{ backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)' }}
                    >
                        <Ionicons
                            name={event.is_saved ? "heart" : "heart-outline"}
                            size={24}
                            color={event.is_saved ? "#EF4444" : currentTheme.text}
                        />
                    </Pressable>
                </View>

                {/* Content */}
                <View className="px-5 -mt-8">
                    <View 
                        className="rounded-[24px] p-6 shadow-sm shadow-black/5 border" 
                        style={{ 
                            backgroundColor: currentTheme.surface,
                            borderColor: currentTheme.border
                        }}
                    >
                        <View className="flex-row justify-between items-start mb-4">
                            <View className="flex-1 mr-4">
                                <Text className="text-[24px] font-bold leading-8" style={{ color: currentTheme.text }}>{event.name}</Text>
                            </View>
                            <DateBubble date={event.date} />
                        </View>

                        {/* Info Rows */}
                        <View className="gap-4 mb-6">
                            <View className="flex-row items-center gap-3">
                                <View className="h-10 w-10 rounded-full items-center justify-center" style={{ backgroundColor: darkMode ? '#334155' : '#F3E8FF' }}>
                                    <Ionicons name="location" size={20} color={currentTheme.primary} />
                                </View>
                                <View>
                                    <Text className="text-[14px] font-bold" style={{ color: currentTheme.text }}>Location</Text>
                                    <Text className="text-[13px]" style={{ color: currentTheme.textMuted }}>{event.location}</Text>
                                </View>
                            </View>
                        </View>

                        <Text className="text-[18px] font-bold mb-2" style={{ color: currentTheme.text }}>About</Text>
                        <Text className="text-[15px] leading-6 mb-6" style={{ color: currentTheme.textMuted }}>
                            {event.description || "No description provided."}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <SafeAreaView 
                className="absolute bottom-0 left-0 right-0 border-t px-5 py-4" 
                edges={["bottom"]}
                style={{ 
                    backgroundColor: currentTheme.surface,
                    borderTopColor: currentTheme.border
                }}
            >
                <View className="flex-row gap-3">
                    {event.is_registered && (
                        <Pressable
                            className="flex-1 h-[50px] rounded-full items-center justify-center flex-row gap-2"
                            style={{ backgroundColor: darkMode ? '#334155' : '#F3F4F6' }}
                            onPress={handleShowTicket}
                        >
                            <Ionicons name="qr-code" size={20} color={currentTheme.text} />
                            <Text className="text-[16px] font-bold" style={{ color: currentTheme.text }}>Ticket</Text>
                        </Pressable>
                    )}

                    <Pressable
                        onPress={handleRegister}
                        disabled={actionLoading}
                        className="flex-1 h-[50px] rounded-full items-center justify-center"
                        style={{ 
                            backgroundColor: event.is_registered 
                                ? (darkMode ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2') 
                                : (darkMode ? currentTheme.primary : '#111827') 
                        }}
                    >
                        {actionLoading ? (
                            <ActivityIndicator color={event.is_registered ? "#EF4444" : "white"} />
                        ) : (
                            <Text className="text-[16px] font-bold" style={{ color: event.is_registered ? "#EF4444" : "white" }}>
                                {event.is_registered ? "Cancel Registration" : "Register Now"}
                            </Text>
                        )}
                    </Pressable>
                </View>
            </SafeAreaView>

            {/* QR Code Modal */}
            <QRModal
                visible={showQR}
                onClose={() => setShowQR(false)}
                qrData={qrData}
                eventName={event.name}
            />
        </View>
    );
}

