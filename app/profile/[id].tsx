import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, Image, Pressable, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { getProfile, getMutualClubs, addFriend, getFriendStatus } from "@/lib/profileService";
import { createDM } from "@/lib/chatService";
import { Profile, Club } from "@/types/database";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import AvatarRenderer from "@/components/avatar/AvatarRenderer";

// --- Constants ---
const THEMES: Record<string, string[]> = {
    "default": ['transparent', 'rgba(0,0,0,0.2)'],
    "purple_haze": ['#7C3AED', '#4C1D95'],
    "sunrise": ['#F59E0B', '#EF4444'],
    "mc_blue": ['#3B82F6', '#1E40AF'],
    "minimal": ['#F3F4F6', '#E5E7EB'],
    "pastel": ['#F9A8D4', '#F472B6'],
};

const FRAMES: Record<string, string> = {
    "default": "border-white",
    "gold": "border-yellow-400",
    "neon": "border-purple-500",
    "officer": "border-green-500",
};

export default function UserProfileScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [mutualClubs, setMutualClubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);
    const [messageLoading, setMessageLoading] = useState(false);
    const [friendStatus, setFriendStatus] = useState<'none' | 'pending' | 'accepted'>('none');
    const [addingFriend, setAddingFriend] = useState(false);

    const fetchData = async () => {
        try {
            if (!id || typeof id !== 'string') return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch Profile & Mutual Clubs
            const [profileData, clubsData] = await Promise.all([
                getProfile(id),
                getMutualClubs(user.id, id)
            ]);

            setProfile(profileData);
            setMutualClubs(clubsData);

            const status = await getFriendStatus(user.id, id);
            setFriendStatus(status);

        } catch (error) {
            console.error("Error fetching user profile:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [id])
    );

    const handleMessage = async () => {
        try {
            setMessageLoading(true);
            if (!id || typeof id !== 'string') return;

            const room = await createDM(id);
            router.push(`/chat/room/${room.id}`);
        } catch (error) {
            console.error("Error creating DM:", error);
            Alert.alert("Error", "Could not create chat room.");
        } finally {
            setMessageLoading(false);
        }
    };

    const handleAddFriend = async () => {
        try {
            setAddingFriend(true);
            if (!id || typeof id !== 'string') return;
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await addFriend(user.id, id);
            setFriendStatus('accepted'); // Optimistic update
            Alert.alert("Success", "Friend added!");
        } catch (error) {
            console.error("Error adding friend:", error);
            Alert.alert("Error", "Could not add friend.");
        } finally {
            setAddingFriend(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#F7F5FC]">
                <ActivityIndicator size="large" color="#6D28D9" />
            </View>
        );
    }

    if (!profile) {
        return (
            <View className="flex-1 items-center justify-center bg-[#F7F5FC]">
                <Text className="text-gray-500">User not found</Text>
            </View>
        );
    }

    // Customization Styles
    const themeColors = THEMES[profile.theme_style || "default"] || THEMES["default"];
    const frameColor = FRAMES[profile.frame_style || "default"] || FRAMES["default"];

    // Avatar Source Logic
    let avatarSource = null;
    if (profile.avatar_type === 'preset' && profile.avatar_preset) {
        avatarSource = { uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${profile.avatar_preset}` };
    } else if (profile.avatar_url) {
        avatarSource = { uri: profile.avatar_url };
    }

    return (
        <View className="flex-1 bg-[#F7F5FC]">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header Background */}
            <View className="absolute top-0 left-0 right-0 h-[200px] bg-white">
                <LinearGradient
                    colors={themeColors as any}
                    className="absolute inset-0 opacity-80"
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            </View>

            <SafeAreaView className="flex-1" edges={["top"]}>
                {/* Nav Bar */}
                <View className="px-5 py-2 flex-row items-center justify-between z-10">
                    <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </Pressable>
                    <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                        <Ionicons name="ellipsis-horizontal" size={24} color="#1A1A1A" />
                    </Pressable>
                </View>

                <ScrollView className="flex-1 mt-4" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

                    {/* Profile Card */}
                    <View className="mx-5 bg-white rounded-[32px] p-6 shadow-sm shadow-black/5 relative overflow-hidden">

                        {/* Avatar */}
                        <View className="items-center -mt-4 mb-4">
                            <View className={`h-28 w-28 rounded-full border-[6px] ${frameColor} bg-white shadow-md overflow-hidden items-center justify-center`}>
                                {profile.avatar_config && Object.keys(profile.avatar_config).length > 0 ? (
                                    <AvatarRenderer config={profile.avatar_config} size={112} />
                                ) : avatarSource ? (
                                    <Image source={avatarSource} className="h-full w-full" />
                                ) : (
                                    <View className="h-full w-full items-center justify-center bg-gray-100">
                                        <Text className="text-[32px] font-bold text-gray-400">{profile.full_name?.charAt(0)}</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* User Info */}
                        <View className="items-center mb-6">
                            <Text className="text-[24px] font-bold text-gray-900 text-center leading-tight mb-1">
                                {profile.full_name}
                            </Text>
                            <Text className="text-[14px] font-medium text-gray-500 mb-3">@{profile.username || "username"}</Text>

                            {/* Badges / Flair */}
                            <View className="flex-row flex-wrap justify-center gap-2 mb-4">
                                <View className="bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                                    <Text className="text-[11px] font-bold text-purple-700 uppercase tracking-wide">
                                        {profile.flair || "Student"}
                                    </Text>
                                </View>
                                {/* Role Badge (if applicable) */}
                                {/* <View className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                                    <Text className="text-[11px] font-bold text-blue-700 uppercase tracking-wide">Officer</Text>
                                </View> */}
                            </View>

                            {/* Bio */}
                            <Text className="text-[14px] text-gray-600 text-center leading-5 px-4">
                                {profile.bio || <Text className="text-red-400 italic">No bio yet...</Text>}
                            </Text>
                        </View>

                        {/* Action Buttons */}
                        <View className="flex-row gap-3 justify-center">
                            {friendStatus === 'accepted' ? (
                                <Pressable className="flex-1 bg-green-50 h-[48px] rounded-xl items-center justify-center border border-green-100 flex-row gap-2">
                                    <Ionicons name="checkmark" size={20} color="#10B981" />
                                    <Text className="text-[#10B981] font-bold text-[14px]">Friends</Text>
                                </Pressable>
                            ) : (
                                <Pressable
                                    onPress={handleAddFriend}
                                    disabled={addingFriend}
                                    className="flex-1 bg-gray-900 h-[48px] rounded-xl items-center justify-center flex-row gap-2 active:bg-gray-800"
                                >
                                    {addingFriend ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : (
                                        <>
                                            <Ionicons name="person-add" size={18} color="white" />
                                            <Text className="text-white font-bold text-[14px]">Add Friend</Text>
                                        </>
                                    )}
                                </Pressable>
                            )}

                            <Pressable
                                onPress={handleMessage}
                                disabled={messageLoading}
                                className="flex-1 bg-[#6D28D9] h-[48px] rounded-xl items-center justify-center flex-row gap-2 shadow-lg shadow-purple-200 active:bg-purple-800"
                            >
                                {messageLoading ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <>
                                        <Ionicons name="chatbubble-ellipses" size={18} color="white" />
                                        <Text className="text-white font-bold text-[14px]">Message</Text>
                                    </>
                                )}
                            </Pressable>
                        </View>
                    </View>

                    {/* Stats Row (Optional) */}
                    <View className="flex-row justify-around px-10 py-6">
                        <View className="items-center">
                            <Text className="text-[18px] font-bold text-gray-900">{mutualClubs.length}</Text>
                            <Text className="text-[12px] text-gray-500">Mutual Clubs</Text>
                        </View>
                        <View className="h-10 w-[1px] bg-gray-200" />
                        <View className="items-center">
                            <Text className="text-[18px] font-bold text-gray-900">{profile.xp || 0}</Text>
                            <Text className="text-[12px] text-gray-500">XP Earned</Text>
                        </View>
                    </View>

                    {/* Mutual Clubs Section */}
                    <View className="px-5 mb-6">
                        <Text className="text-[16px] font-bold text-gray-900 mb-3 uppercase tracking-wider opacity-60">Mutual Clubs</Text>
                        {mutualClubs.length > 0 ? (
                            mutualClubs.map((club, index) => (
                                <MotiView
                                    key={club.id}
                                    from={{ opacity: 0, translateY: 10 }}
                                    animate={{ opacity: 1, translateY: 0 }}
                                    transition={{ delay: index * 100 }}
                                    className="flex-row items-center gap-4 bg-white p-3 rounded-[20px] mb-3 shadow-sm shadow-black/5 border border-gray-100"
                                >
                                    <View className="h-12 w-12 rounded-[16px] bg-gray-100 overflow-hidden border border-gray-100">
                                        {club.cover_image_url ? (
                                            <Image source={{ uri: club.cover_image_url }} className="h-full w-full" />
                                        ) : (
                                            <View className="h-full w-full items-center justify-center bg-gray-200">
                                                <Text className="text-[16px] font-bold text-gray-400">{club.name.charAt(0)}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-[15px] font-bold text-gray-900">{club.name}</Text>
                                        <Text className="text-[12px] text-gray-500">{club.member_count || 0} members</Text>
                                    </View>
                                    <View className="h-6 w-6 rounded-full bg-green-100 items-center justify-center">
                                        <Ionicons name="checkmark" size={14} color="#10B981" />
                                    </View>
                                </MotiView>
                            ))
                        ) : (
                            <View className="bg-white p-6 rounded-[20px] border border-dashed border-gray-200 items-center">
                                <Text className="text-gray-400 text-center text-[13px]">No mutual clubs found.</Text>
                            </View>
                        )}
                    </View>

                    {/* Interests Section (Placeholder) */}
                    <View className="px-5 mb-6">
                        <Text className="text-[16px] font-bold text-gray-900 mb-3 uppercase tracking-wider opacity-60">Interests</Text>
                        {profile.interests && profile.interests.length > 0 ? (
                            <View className="flex-row flex-wrap gap-2">
                                {profile.interests.map((interest, i) => (
                                    <View key={i} className="bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                                        <Text className="text-[13px] font-medium text-gray-700">{interest}</Text>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <Text className="text-red-400 italic text-[13px]">User has not added interests yet.</Text>
                        )}
                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
