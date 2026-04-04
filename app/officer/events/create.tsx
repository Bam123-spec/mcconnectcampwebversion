import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { createEvent } from "@/lib/officerService";
import { useOfficerAccess } from "@/hooks/useOfficerAccess";
import { getOfficerRoleConfig, getOfficerRoleLabel } from "@/lib/officerPermissions";
import OfficerAccessGuard from "@/components/officer/OfficerAccessGuard";

export default function CreateEventScreen() {
    const router = useRouter();
    const { clubId } = useLocalSearchParams<{ clubId: string }>();
    const access = useOfficerAccess({ clubId, requiredCapabilities: ["createEvents"] });
    const [loading, setLoading] = useState(false);
    const currentClub = access.currentClub;
    const currentRole = access.effectiveRole;

    const [form, setForm] = useState({
        title: "",
        description: "",
        date: "", // YYYY-MM-DD
        time: "", // HH:MM AM/PM
        location: "",
        image_url: "",
        category: "General"
    });

    const handleCreate = async () => {
        if (!clubId) return;
        if (!access.canAccess) {
            Alert.alert("Restricted", "Your leadership role does not currently allow event creation.");
            return;
        }
        if (!form.title || !form.date || !form.time || !form.location) {
            Alert.alert("Error", "Please fill in all required fields.");
            return;
        }

        setLoading(true);
        try {
            // Combine date and time for start_time (simplified)
            // Ideally use a proper date library or picker
            const startTime = `${form.date} ${form.time}`;

            await createEvent({
                club_id: clubId,
                title: form.title,
                description: form.description,
                start_time: startTime,
                date: form.date,
                time: form.time,
                location: form.location,
                image_url: form.image_url,
            });

            Alert.alert("Success", "Event created successfully!", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to create event.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <OfficerAccessGuard
            loading={access.loading}
            allowed={access.canAccess}
            title="Event Access Restricted"
            description={access.deniedReason}
        >
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
                <Pressable onPress={() => router.back()} className="h-10 w-10 rounded-full bg-gray-50 items-center justify-center">
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </Pressable>
                <Text className="text-[18px] font-bold text-gray-900">Create Event</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-5 py-6">
                <View className={`mb-5 rounded-[20px] border p-4 ${getOfficerRoleConfig(currentRole).tint} ${getOfficerRoleConfig(currentRole).border}`}>
                    <Text className={`text-[11px] font-bold uppercase ${getOfficerRoleConfig(currentRole).text}`}>
                        {getOfficerRoleLabel(currentRole)}
                    </Text>
                    <Text className="mt-2 text-[14px] font-bold text-gray-900">
                        Build events for {currentClub?.name || "your club"}
                    </Text>
                    <Text className="mt-1 text-[12px] leading-5 text-gray-500">
                        Presidents, Vice Presidents, and Treasurers can create events from this workspace.
                    </Text>
                </View>

                <View className="gap-5">
                    <View>
                        <Text className="text-[14px] font-bold text-gray-700 mb-2">Event Title</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-[16px] p-4 text-[16px]"
                            placeholder="e.g. Weekly Meeting"
                            value={form.title}
                            onChangeText={(t) => setForm({ ...form, title: t })}
                        />
                    </View>

                    <View>
                        <Text className="text-[14px] font-bold text-gray-700 mb-2">Description</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-[16px] p-4 text-[16px] min-h-[100px]"
                            placeholder="What's this event about?"
                            multiline
                            textAlignVertical="top"
                            value={form.description}
                            onChangeText={(t) => setForm({ ...form, description: t })}
                        />
                    </View>

                    <View className="flex-row gap-4">
                        <View className="flex-1">
                            <Text className="text-[14px] font-bold text-gray-700 mb-2">Date (YYYY-MM-DD)</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-200 rounded-[16px] p-4 text-[16px]"
                                placeholder="2024-12-01"
                                value={form.date}
                                onChangeText={(t) => setForm({ ...form, date: t })}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[14px] font-bold text-gray-700 mb-2">Time</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-200 rounded-[16px] p-4 text-[16px]"
                                placeholder="5:00 PM"
                                value={form.time}
                                onChangeText={(t) => setForm({ ...form, time: t })}
                            />
                        </View>
                    </View>

                    <View>
                        <Text className="text-[14px] font-bold text-gray-700 mb-2">Location</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-[16px] p-4 text-[16px]"
                            placeholder="e.g. Room 101 or Zoom Link"
                            value={form.location}
                            onChangeText={(t) => setForm({ ...form, location: t })}
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

                <View className="h-10" />
            </ScrollView>

            <View className="p-5 border-t border-gray-100">
                <Pressable
                    onPress={handleCreate}
                    disabled={loading || !access.canAccess}
                    className={`h-[56px] rounded-[20px] items-center justify-center ${loading || !access.canAccess ? "bg-purple-300" : "bg-[#8B5CF6]"}`}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-[16px]">Create Event</Text>
                    )}
                </Pressable>
            </View>
        </SafeAreaView>
        </OfficerAccessGuard>
    );
}
