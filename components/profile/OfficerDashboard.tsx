import React from "react";
import { View, Text, Pressable } from "react-native";
import { Club } from "@/types/database";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    getOfficerRoleConfig,
    getOfficerRoleLabel,
    hasOfficerCapability,
} from "@/lib/officerPermissions";

interface OfficerDashboardProps {
    roles: { club: Club; role: string }[];
}

export default function OfficerDashboard({ roles }: OfficerDashboardProps) {
    const router = useRouter();

    if (roles.length === 0) return null;

    return (
        <View className="mx-5 mb-8 rounded-3xl overflow-hidden border border-purple-100 shadow-sm bg-white">
            <LinearGradient
                colors={['#7C3AED', '#6D28D9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="p-5"
            >
                <View className="flex-row items-center gap-2 mb-1">
                    <Ionicons name="shield-checkmark" size={20} color="white" />
                    <Text className="text-[18px] font-h1 text-white">Officer Dashboard</Text>
                </View>
                <Text className="text-[13px] font-body text-purple-100">Manage your clubs and events</Text>
            </LinearGradient>

            <View className="p-4 gap-4">
                {roles.map((item) => {
                    const style = getOfficerRoleConfig(item.role);
                    const canCreateEvents = hasOfficerCapability(item.role, "createEvents");
                    const canPostAnnouncements = hasOfficerCapability(item.role, "postAnnouncements");
                    const canOpenDashboard = hasOfficerCapability(item.role, "viewAnalytics");
                    return (
                        <View key={item.club.id} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="flex-1 mr-2">
                                    <Text className="text-[15px] font-h1 text-gray-900 mb-1.5">{item.club.name}</Text>
                                    <View className={`self-start px-2.5 py-1 rounded-full border ${style.tint} ${style.border}`}>
                                        <Text className={`text-[11px] font-button uppercase tracking-wide ${style.text}`}>
                                            {getOfficerRoleLabel(item.role)}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View className="flex-row flex-wrap gap-2">
                                <Pressable
                                    onPress={() => router.push({ pathname: "/officer/messages", params: { clubId: item.club.id } })}
                                    className="min-w-[23%] flex-1 bg-gray-50 py-2.5 rounded-xl items-center border border-gray-100"
                                >
                                    <Ionicons name="mail-unread-outline" size={18} color="#4B5563" />
                                    <Text className="text-[11px] font-metadata text-gray-700 mt-1">Inbox</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => canPostAnnouncements && router.push({ pathname: "/officer/announcements/create", params: { clubId: item.club.id } })}
                                    className={`min-w-[23%] flex-1 py-2.5 rounded-xl items-center border ${canPostAnnouncements ? "bg-gray-50 border-gray-100" : "bg-gray-100 border-gray-200 opacity-60"}`}
                                >
                                    <Ionicons name="megaphone-outline" size={18} color="#4B5563" />
                                    <Text className="text-[11px] font-metadata text-gray-700 mt-1">Post</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => canCreateEvents && router.push({ pathname: "/officer/events/create", params: { clubId: item.club.id } })}
                                    className={`min-w-[23%] flex-1 py-2.5 rounded-xl items-center border ${canCreateEvents ? "bg-gray-50 border-gray-100" : "bg-gray-100 border-gray-200 opacity-60"}`}
                                >
                                    <Ionicons name="calendar-outline" size={18} color="#4B5563" />
                                    <Text className="text-[11px] font-metadata text-gray-700 mt-1">Event</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => canOpenDashboard && router.push({ pathname: "/officer/dashboard", params: { clubId: item.club.id } })}
                                    className={`min-w-[23%] flex-1 py-2.5 rounded-xl items-center border ${canOpenDashboard ? "bg-gray-50 border-gray-100" : "bg-gray-100 border-gray-200 opacity-60"}`}
                                >
                                    <Ionicons name="grid-outline" size={18} color="#4B5563" />
                                    <Text className="text-[11px] font-metadata text-gray-700 mt-1">Dashboard</Text>
                                </Pressable>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}
