import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { getClub, getClubViewerState, followClub, unfollowClub, joinClub } from "@/lib/clubService";
import { Club } from "@/types/database";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/context/ThemeContext";
import { StatusBar } from "expo-status-bar";

export default function ClubDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { darkMode, theme: currentTheme } = useTheme();

    const [club, setClub] = useState<Club | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isMember, setIsMember] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!id || typeof id !== 'string') return;

            try {
                const [clubData, viewerState] = await Promise.all([
                    getClub(id),
                    getClubViewerState(id)
                ]);
                setClub(clubData);
                setIsFollowing(viewerState.isFollowing);
                setIsMember(viewerState.isMember);

            } catch (error) {
                console.error("Error fetching club details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleFollowToggle = async () => {
        if (!club || actionLoading) return;
        setActionLoading(true);

        try {
            if (isFollowing) {
                await unfollowClub(club.id);
                setIsFollowing(false);
            } else {
                await followClub(club.id);
                setIsFollowing(true);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to update follow status.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!club || actionLoading) return;
        setActionLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await joinClub(user.id, club.id);
            setIsMember(true);
            Alert.alert("Success", "You have joined the club!");
        } catch (error: any) {
            console.error("Join error:", error);
            Alert.alert("Error", `Failed to join club: ${error.message || "Unknown error"}`);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={{ backgroundColor: currentTheme.bg }} className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color={currentTheme.primary} />
            </View>
        );
    }

    if (!club) {
        return (
            <View style={{ backgroundColor: currentTheme.bg }} className="flex-1 items-center justify-center">
                <Text style={{ color: currentTheme.textLight }} className="text-gray-500">Club not found</Text>
            </View>
        );
    }

    return (
        <View style={{ backgroundColor: currentTheme.bg }} className="flex-1">
            <StatusBar style="light" />
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header Image */}
                <View className="h-[250px] w-full relative">
                    {club.cover_image_url ? (
                        <Image source={{ uri: club.cover_image_url }} className="h-full w-full" resizeMode="cover" />
                    ) : (
                        <View style={{ backgroundColor: currentTheme.primary }} className="h-full w-full items-center justify-center">
                            <Text className="text-[60px] font-bold text-white opacity-20">{club.name.charAt(0)}</Text>
                        </View>
                    )}
                    <View className="absolute inset-0 bg-black/30" />

                    {/* Back Button */}
                    <Pressable
                        onPress={() => router.back()}
                        className="absolute left-4 top-12 h-10 w-10 rounded-full bg-white/20 items-center justify-center"
                    >
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </Pressable>
                </View>

                {/* Content Container */}
                <View style={{ backgroundColor: currentTheme.bg }} className="flex-1 -mt-8 rounded-t-[32px] px-6 pt-8 pb-20">

                    {/* Title & Badge */}
                    <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1 mr-4">
                            <Text style={{ color: currentTheme.text }} className="text-[28px] font-bold leading-tight mb-1">{club.name}</Text>
                            <View className="flex-row items-center gap-2">
                                <View style={{ backgroundColor: darkMode ? currentTheme.surfaceSelected : "#F3E8FF" }} className="px-2 py-0.5 rounded-md">
                                    <Text style={{ color: currentTheme.primary }} className="text-[11px] font-bold uppercase">ACADEMIC</Text>
                                </View>
                                <Text style={{ color: currentTheme.textLight }} className="text-[13px]">{club.member_count || 0} Members</Text>
                            </View>
                        </View>
                        {/* Action Buttons */}
                        <View className="flex-row gap-2">
                            {!isMember && (
                                <Pressable
                                    onPress={handleFollowToggle}
                                    style={{ 
                                        backgroundColor: isFollowing ? (darkMode ? currentTheme.surfaceSelected : "#E9E3FF") : currentTheme.surface,
                                        borderColor: isFollowing ? currentTheme.primary : currentTheme.border
                                    }}
                                    className={`h-10 w-10 rounded-full items-center justify-center border`}
                                >
                                    {actionLoading ? (
                                        <ActivityIndicator size="small" color={currentTheme.primary} />
                                    ) : (
                                        <Ionicons name={isFollowing ? "heart" : "heart-outline"} size={22} color={isFollowing ? currentTheme.primary : currentTheme.text} />
                                    )}
                                </Pressable>
                            )}
                        </View>
                    </View>

                    {/* Main Action Button */}
                    {!isMember ? (
                        <Pressable
                            onPress={handleJoin}
                            style={{ backgroundColor: currentTheme.primary }}
                            className="w-full py-3.5 rounded-[16px] items-center justify-center shadow-sm mb-6"
                        >
                            {actionLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-[16px] font-bold text-white">Join Club</Text>
                            )}
                        </Pressable>
                    ) : (
                        <View 
                            style={{ backgroundColor: darkMode ? currentTheme.surface : "#F0FDF4", borderColor: darkMode ? currentTheme.border : "#DCFCE7" }}
                            className="w-full py-3.5 rounded-[16px] items-center justify-center border mb-6"
                        >
                            <Text style={{ color: darkMode ? currentTheme.primary : "#15803d" }} className="text-[16px] font-bold">Member</Text>
                        </View>
                    )}

                    {/* Description */}
                    <View className="mb-6">
                        <Text style={{ color: currentTheme.text }} className="text-[18px] font-bold mb-2">About</Text>
                        <Text style={{ color: currentTheme.textLight }} className="text-[15px] leading-6">
                            {club.description || "No description provided for this club."}
                        </Text>
                    </View>

                    {/* Info Grid */}
                    <View className="flex-row flex-wrap gap-3 mb-8">
                        <View style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }} className="w-[48%] p-4 rounded-[20px] border">
                            <Ionicons name="time-outline" size={24} color={currentTheme.primary} className="mb-2" />
                            <Text style={{ color: currentTheme.textMuted }} className="text-[11px] uppercase font-bold mb-0.5">MEETING TIME</Text>
                            <Text style={{ color: currentTheme.text }} className="text-[14px] font-bold">{club.meeting_time || "TBA"}</Text>
                        </View>
                        <View style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }} className="w-[48%] p-4 rounded-[20px] border">
                            <Ionicons name="location-outline" size={24} color={currentTheme.primary} className="mb-2" />
                            <Text style={{ color: currentTheme.textMuted }} className="text-[11px] uppercase font-bold mb-0.5">LOCATION</Text>
                            <Text style={{ color: currentTheme.text }} className="text-[14px] font-bold">Campus Center</Text>
                        </View>
                    </View>

                </View>
            </ScrollView>
        </View>
    );
}
