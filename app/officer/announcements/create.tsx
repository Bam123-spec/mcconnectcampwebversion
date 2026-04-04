import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { createAnnouncement } from "@/lib/officerService";
import { supabase } from "@/lib/supabase";
import { useOfficerAccess } from "@/hooks/useOfficerAccess";
import { getOfficerRoleConfig, getOfficerRoleLabel } from "@/lib/officerPermissions";
import OfficerAccessGuard from "@/components/officer/OfficerAccessGuard";

export default function CreateAnnouncementScreen() {
    const router = useRouter();
    const { clubId } = useLocalSearchParams<{ clubId: string }>();
    const access = useOfficerAccess({ clubId, requiredCapabilities: ["postAnnouncements"] });
    const [loading, setLoading] = useState(false);
    const currentClub = access.currentClub;
    const currentRole = access.effectiveRole;

    const [form, setForm] = useState({
        content: "",
        image_url: ""
    });

    const handlePost = async () => {
        if (!clubId) return;
        if (!access.canAccess) {
            Alert.alert("Restricted", "Your current role cannot post club-wide updates.");
            return;
        }
        if (!form.content) {
            Alert.alert("Error", "Please write something!");
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            await createAnnouncement({
                club_id: clubId,
                user_id: user.id,
                content: form.content,
                image_url: form.image_url
            });

            Alert.alert("Success", "Announcement posted!", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to post announcement.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <OfficerAccessGuard
            loading={access.loading}
            allowed={access.canAccess}
            title="Announcement Access Restricted"
            description={access.deniedReason}
        >
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
                <Pressable onPress={() => router.back()} className="h-10 w-10 rounded-full bg-gray-50 items-center justify-center">
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </Pressable>
                <Text className="text-[18px] font-bold text-gray-900">New Announcement</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-5 py-6">
                <View className={`mb-5 rounded-[20px] border p-4 ${getOfficerRoleConfig(currentRole).tint} ${getOfficerRoleConfig(currentRole).border}`}>
                    <Text className={`text-[11px] font-bold uppercase ${getOfficerRoleConfig(currentRole).text}`}>
                        {getOfficerRoleLabel(currentRole)}
                    </Text>
                    <Text className="mt-2 text-[14px] font-bold text-gray-900">
                        Publish a club update
                    </Text>
                    <Text className="mt-1 text-[12px] leading-5 text-gray-500">
                        This announcement will represent {currentClub?.name || "your club"} across the app.
                    </Text>
                </View>

                <View className="gap-5">
                    <View>
                        <Text className="text-[14px] font-bold text-gray-700 mb-2">Message</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-[16px] p-4 text-[16px] min-h-[150px]"
                            placeholder="What do you want to tell your members?"
                            multiline
                            textAlignVertical="top"
                            value={form.content}
                            onChangeText={(t) => setForm({ ...form, content: t })}
                        />
                    </View>

                    <View>
                        <Text className="text-[14px] font-bold text-gray-700 mb-2">Image URL (Optional)</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-[16px] p-4 text-[16px]"
                            placeholder="https://..."
                            value={form.image_url}
                            onChangeText={(t) => setForm({ ...form, image_url: t })}
                            autoCapitalize="none"
                        />
                    </View>
                </View>
            </ScrollView>

            <View className="p-5 border-t border-gray-100">
                <Pressable
                    onPress={handlePost}
                    disabled={loading || !access.canAccess}
                    className={`h-[56px] rounded-[20px] items-center justify-center ${loading || !access.canAccess ? "bg-purple-300" : "bg-[#8B5CF6]"}`}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-[16px]">Post Announcement</Text>
                    )}
                </Pressable>
            </View>
        </SafeAreaView>
        </OfficerAccessGuard>
    );
}
