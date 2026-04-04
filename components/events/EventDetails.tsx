import React, { useState } from "react";
import { View, Text, Image, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Event } from "@/types/database";
import { useAttendance } from "@/hooks/useAttendance";
import QRModal from "./QRModal";
import { supabase } from "@/lib/supabase";

type EventDetailsProps = {
    event: Event;
};

export default function EventDetails({ event }: EventDetailsProps) {
    const { attendance, loading, attending, register, cancel } = useAttendance(event.id);
    const [modalVisible, setModalVisible] = useState(false);
    const eventDay = event.day || event.date || new Date().toISOString().split('T')[0];

    const handleAttendPress = () => {
        if (attending) {
            // Optional: Confirm cancel
            cancel();
        } else {
            register();
        }
    };

    const qrData = JSON.stringify({
        event_id: event.id,
        user_id: attendance?.user_id,
        qr_secret: attendance?.qr_secret,
    });

    return (
        <View className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Cover Image */}
                <View className="h-[250px] w-full bg-gray-200">
                    {event.image_url && (
                        <Image source={{ uri: event.image_url }} className="h-full w-full" resizeMode="cover" />
                    )}
                    <View className="absolute inset-0 bg-black/20" />
                </View>

                <View className="px-5 -mt-8">
                    <View className="bg-white rounded-[24px] p-6 shadow-sm shadow-black/5 border border-[#F0F0F0]">
                        {/* Header */}
                        <View className="flex-row justify-between items-start mb-4">
                            <View className="flex-1 mr-4">
                                <Text className="text-[13px] font-bold text-[#6D28D9] mb-1 uppercase tracking-wider">{event.category}</Text>
                                <Text className="text-[24px] font-bold text-[#1A1A1A] leading-8">{event.name}</Text>
                            </View>
                            <View className="bg-gray-50 px-3 py-2 rounded-[16px] items-center border border-[#F0F0F0]">
                                <Text className="text-[12px] font-bold text-[#1A1A1A]">{new Date(eventDay).getDate()}</Text>
                                <Text className="text-[10px] text-[#7A7A7A] uppercase">{new Date(eventDay).toLocaleString('default', { month: 'short' })}</Text>
                            </View>
                        </View>

                        {/* Info Rows */}
                        <View className="gap-3 mb-6">
                            <View className="flex-row items-center gap-3">
                                <View className="h-8 w-8 rounded-full bg-[#F3E8FF] items-center justify-center">
                                    <Ionicons name="time-outline" size={16} color="#6D28D9" />
                                </View>
                                <Text className="text-[14px] text-[#4B5563] font-medium">{event.time}</Text>
                            </View>
                            <View className="flex-row items-center gap-3">
                                <View className="h-8 w-8 rounded-full bg-[#F3E8FF] items-center justify-center">
                                    <Ionicons name="location-outline" size={16} color="#6D28D9" />
                                </View>
                                <Text className="text-[14px] text-[#4B5563] font-medium">{event.location}</Text>
                            </View>
                        </View>

                        {/* Description */}
                        <Text className="text-[16px] font-bold text-[#1A1A1A] mb-2">About Event</Text>
                        <Text className="text-[14px] text-[#6B7280] leading-6">{event.description}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View className="absolute bottom-0 left-0 right-0 bg-white px-5 py-4 border-t border-[#F0F0F0] flex-row gap-3 safe-area-bottom">
                <Pressable
                    onPress={handleAttendPress}
                    disabled={loading}
                    className={`flex-1 h-[52px] rounded-full items-center justify-center flex-row gap-2 ${attending ? 'bg-[#F3E8FF] border border-[#E9E3FF]' : 'bg-[#6D28D9]'}`}
                >
                    {loading ? (
                        <ActivityIndicator color={attending ? "#6D28D9" : "white"} />
                    ) : attending ? (
                        <>
                            <Text className="text-[#6D28D9] font-bold text-[16px]">You're Going</Text>
                            <Ionicons name="checkmark-circle" size={20} color="#6D28D9" />
                        </>
                    ) : (
                        <Text className="text-white font-bold text-[16px]">Attend Event</Text>
                    )}
                </Pressable>

                {attending && (
                    <Pressable
                        onPress={() => setModalVisible(true)}
                        className="h-[52px] w-[52px] rounded-full bg-[#1A1A1A] items-center justify-center shadow-sm"
                    >
                        <Ionicons name="qr-code" size={24} color="white" />
                    </Pressable>
                )}
            </View>

            {/* QR Modal */}
            {attendance && (
                <QRModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    qrData={qrData}
                    eventName={event.name}
                />
            )}
        </View>
    );
}
