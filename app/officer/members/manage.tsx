import React, { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useOfficerAccess } from "@/hooks/useOfficerAccess";
import {
    OFFICER_ASSIGNABLE_ROLES,
    canManageOfficerRole,
    getOfficerRoleConfig,
    getOfficerRoleLabel,
    hasOfficerCapability,
    normalizeOfficerRole,
} from "@/lib/officerPermissions";
import { demoteMember, getClubMembers, removeMember, setOfficerRole } from "@/lib/officerService";
import OfficerAccessGuard from "@/components/officer/OfficerAccessGuard";

export default function ManageMembersScreen() {
    const router = useRouter();
    const { clubId } = useLocalSearchParams<{ clubId: string }>();
    const access = useOfficerAccess({ clubId, requiredCapabilities: ["manageMembers"] });

    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedMember, setSelectedMember] = useState<any | null>(null);

    const currentClub = access.currentClub;
    const currentRole = access.effectiveRole;
    const canManageMembers = hasOfficerCapability(currentRole, "manageMembers");
    const canManageRoles = hasOfficerCapability(currentRole, "manageRoles");

    const fetchMembers = useCallback(async () => {
        if (!clubId) return;

        setLoading(true);
        try {
            const data = await getClubMembers(clubId);
            const ranked = [...data].sort((a, b) => {
                return (
                    getOfficerRoleConfig(b.role).rank - getOfficerRoleConfig(a.role).rank ||
                    (a.profile?.full_name || "").localeCompare(b.profile?.full_name || "")
                );
            });
            setMembers(ranked);
        } catch (error) {
            console.error("Error fetching members:", error);
        } finally {
            setLoading(false);
        }
    }, [clubId]);

    useFocusEffect(
        useCallback(() => {
            fetchMembers();
        }, [fetchMembers])
    );

    const closeRoleModal = () => setSelectedMember(null);

    const handleAssignRole = async (role: string) => {
        if (!clubId || !selectedMember) return;

        setSubmitting(true);
        try {
            await setOfficerRole(selectedMember.profile_id, clubId, role);
            closeRoleModal();
            await fetchMembers();
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to update officer role.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDemote = (member: any) => {
        Alert.alert(
            "Remove Officer Role",
            `Remove ${member.profile?.full_name || "this member"} from leadership?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove Role",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await demoteMember(member.profile_id, clubId!);
                            await fetchMembers();
                        } catch (error: any) {
                            Alert.alert("Error", error.message || "Failed to remove officer role.");
                        }
                    },
                },
            ]
        );
    };

    const handleRemove = (member: any) => {
        Alert.alert(
            "Remove Member",
            `Remove ${member.profile?.full_name || "this member"} from the club?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await removeMember(member.profile_id, clubId!);
                            await fetchMembers();
                        } catch (error: any) {
                            Alert.alert("Error", error.message || "Failed to remove member.");
                        }
                    },
                },
            ]
        );
    };

    const canEditMemberRole = (member: any) => canManageOfficerRole(currentRole, member.role);
    const canRemoveMember = (member: any) => {
        const memberRole = normalizeOfficerRole(member.role);
        if (!canManageMembers) return false;
        if (canManageRoles) return canEditMemberRole(member);
        return memberRole === "member";
    };

    return (
        <OfficerAccessGuard
            loading={access.loading}
            allowed={access.canAccess}
            title="Leadership Access Restricted"
            description={access.deniedReason}
        >
        <SafeAreaView className="flex-1 bg-[#F7F5FC]" edges={["top"]}>
            <Stack.Screen options={{ headerShown: false }} />

            <View className="border-b border-white/80 bg-white px-5 py-4">
                <View className="flex-row items-center justify-between">
                    <Pressable
                        onPress={() => router.back()}
                        className="h-10 w-10 rounded-full bg-gray-50 items-center justify-center"
                    >
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </Pressable>
                    <View className="flex-1 px-4">
                        <Text className="text-[18px] font-bold text-gray-900">Club Leadership</Text>
                        <Text className="text-[12px] text-gray-500">
                            Presidents control roles. Vice Presidents can manage the roster.
                        </Text>
                    </View>
                    <View
                        className={`rounded-full border px-3 py-1.5 ${getOfficerRoleConfig(currentRole).tint} ${getOfficerRoleConfig(currentRole).border}`}
                    >
                        <Text className={`text-[10px] font-bold uppercase ${getOfficerRoleConfig(currentRole).text}`}>
                            {getOfficerRoleLabel(currentRole)}
                        </Text>
                    </View>
                </View>

                <View className="mt-4 rounded-[24px] bg-[#111827] px-4 py-4">
                    <Text className="text-[11px] font-bold uppercase tracking-[1.2px] text-white/55">
                        Permission Model
                    </Text>
                    <Text className="mt-2 text-[16px] font-bold text-white">
                        {canManageRoles
                            ? "You can assign Vice President, Treasurer, and Secretary roles."
                            : canManageMembers
                                ? "You can review the roster and remove regular members if needed."
                                : "You can review the club roster, but only higher leadership can edit it."}
                    </Text>
                </View>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color="#8B5CF6" />
                </View>
            ) : (
                <ScrollView className="flex-1 px-5 py-4" contentContainerStyle={{ paddingBottom: 100 }}>
                    <View className="gap-4">
                        {members.map((member) => {
                            const roleTone = getOfficerRoleConfig(member.role);
                            const memberRoleLabel = getOfficerRoleLabel(member.role);
                            const editableRole = canEditMemberRole(member);
                            const removable = canRemoveMember(member);

                            return (
                                <View
                                    key={member.id}
                                    className="rounded-[24px] border border-gray-100 bg-white p-4 shadow-sm shadow-black/5"
                                >
                                    <View className="flex-row items-start justify-between gap-3">
                                        <View className="flex-row items-center gap-3 flex-1">
                                            <View className="h-14 w-14 rounded-full bg-gray-200 overflow-hidden">
                                                {member.profile?.avatar_url ? (
                                                    <Image source={{ uri: member.profile.avatar_url }} className="h-full w-full" />
                                                ) : (
                                                    <View className="h-full w-full bg-purple-100 items-center justify-center">
                                                        <Text className="text-purple-600 font-bold text-lg">
                                                            {member.profile?.full_name?.charAt(0) || "?"}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-[16px] font-bold text-gray-900">
                                                    {member.profile?.full_name || "Unknown"}
                                                </Text>
                                                <Text className="mt-1 text-[12px] text-gray-500">
                                                    {member.profile?.email || "No email"}
                                                </Text>
                                                <View className="mt-3 flex-row items-center gap-2 flex-wrap">
                                                    <View className={`rounded-full border px-2.5 py-1 ${roleTone.tint} ${roleTone.border}`}>
                                                        <Text className={`text-[10px] font-bold uppercase ${roleTone.text}`}>
                                                            {memberRoleLabel}
                                                        </Text>
                                                    </View>
                                                    {normalizeOfficerRole(member.role) === "president" && (
                                                        <View className="rounded-full bg-blue-900 px-2.5 py-1">
                                                            <Text className="text-[10px] font-bold uppercase text-white">
                                                                Highest Control
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        </View>

                                        <View className="items-end gap-2">
                                            {canManageRoles && editableRole ? (
                                                <Pressable
                                                    onPress={() => setSelectedMember(member)}
                                                    className="rounded-full border border-purple-200 bg-purple-50 px-3 py-2"
                                                >
                                                    <Text className="text-[11px] font-bold uppercase text-purple-700">
                                                        {normalizeOfficerRole(member.role) === "member" ? "Assign Role" : "Change Role"}
                                                    </Text>
                                                </Pressable>
                                            ) : null}

                                            {canManageRoles && editableRole && normalizeOfficerRole(member.role) !== "member" ? (
                                                <Pressable
                                                    onPress={() => handleDemote(member)}
                                                    className="rounded-full border border-amber-200 bg-amber-50 px-3 py-2"
                                                >
                                                    <Text className="text-[11px] font-bold uppercase text-amber-700">
                                                        Remove Role
                                                    </Text>
                                                </Pressable>
                                            ) : null}

                                            {removable ? (
                                                <Pressable
                                                    onPress={() => handleRemove(member)}
                                                    className="rounded-full border border-red-200 bg-red-50 px-3 py-2"
                                                >
                                                    <Text className="text-[11px] font-bold uppercase text-red-700">
                                                        Remove Member
                                                    </Text>
                                                </Pressable>
                                            ) : null}
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>
            )}

            <Modal visible={!!selectedMember} transparent animationType="fade" onRequestClose={closeRoleModal}>
                <View className="flex-1 bg-black/40 items-center justify-center px-5">
                    <View className="w-full rounded-[28px] bg-white p-5">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1 pr-4">
                                <Text className="text-[20px] font-bold text-gray-900">
                                    Assign Leadership Role
                                </Text>
                                <Text className="mt-1 text-[13px] text-gray-500">
                                    Choose the role for {selectedMember?.profile?.full_name || "this member"}.
                                </Text>
                            </View>
                            <Pressable onPress={closeRoleModal} className="h-10 w-10 items-center justify-center rounded-full bg-gray-50">
                                <Ionicons name="close" size={20} color="#1F2937" />
                            </Pressable>
                        </View>

                        <View className="mt-5 gap-3">
                            {OFFICER_ASSIGNABLE_ROLES.map((role) => {
                                const tone = getOfficerRoleConfig(role);
                                return (
                                    <Pressable
                                        key={role}
                                        disabled={submitting}
                                        onPress={() => handleAssignRole(role.replace("_", " "))}
                                        className={`rounded-[22px] border p-4 ${tone.tint} ${tone.border}`}
                                    >
                                        <Text className={`text-[14px] font-bold ${tone.text}`}>
                                            {getOfficerRoleLabel(role)}
                                        </Text>
                                        <Text className="mt-1 text-[12px] text-gray-500">
                                            {role === "vice_president"
                                                ? "Runs day-to-day operations under the President."
                                                : role === "treasurer"
                                                    ? "Owns financial coordination and operational planning."
                                                    : "Handles club communication, records, and execution."}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        {submitting && (
                            <View className="mt-4 flex-row items-center justify-center gap-2">
                                <ActivityIndicator color="#8B5CF6" />
                                <Text className="text-[12px] text-gray-500">Saving role…</Text>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
        </OfficerAccessGuard>
    );
}
