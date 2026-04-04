import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useOfficerAccess } from "@/hooks/useOfficerAccess";
import { getOfficerRoleConfig, getOfficerRoleLabel } from "@/lib/officerPermissions";
import {
  ensureAdminOfficerConversation,
  getAdminOfficerConversations,
} from "@/lib/adminOfficerChatService";
import { AdminConversation } from "@/types/database";
import OfficerAccessGuard from "@/components/officer/OfficerAccessGuard";

function formatTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function OfficerMessagesScreen() {
  const router = useRouter();
  const { clubId } = useLocalSearchParams<{ clubId?: string }>();
  const access = useOfficerAccess({ clubId, requiredCapabilities: ["viewInbox"] });
  const [conversations, setConversations] = useState<AdminConversation[]>([]);
  const [loading, setLoading] = useState(true);

  const currentClub = useMemo(() => access.currentClub, [access.currentClub]);
  const roleConfig = getOfficerRoleConfig(currentClub?.role);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      if (clubId) {
        await ensureAdminOfficerConversation(clubId);
      }

      const data = await getAdminOfficerConversations(clubId);
      setConversations(data);
    } catch (error) {
      console.error("Error loading admin conversations:", error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [fetchConversations])
  );

  return (
    <OfficerAccessGuard
      loading={access.loading}
      allowed={access.canAccess}
      title="Inbox Access Restricted"
      description={access.deniedReason}
    >
    <SafeAreaView className="flex-1 bg-[#F6F4FC]" edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="px-5 py-4 border-b border-white/70 bg-white">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center rounded-full bg-[#F2EDFF]"
          >
            <Ionicons name="arrow-back" size={22} color="#1F2937" />
          </Pressable>
          <View className="flex-1 px-4">
            <Text className="text-[20px] font-bold text-gray-900">Leadership Inbox</Text>
            <Text className="text-[13px] text-gray-500">
              Admin and officer coordination for your club
            </Text>
          </View>
          <Pressable
            onPress={fetchConversations}
            className="h-11 w-11 items-center justify-center rounded-full bg-gray-50"
          >
            <Ionicons name="refresh" size={20} color="#4B5563" />
          </Pressable>
        </View>

        {currentClub ? (
          <View className="mt-4 rounded-[24px] bg-[#111827] px-4 py-4">
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-1">
                <Text className="text-[11px] font-bold uppercase tracking-[1.2px] text-white/55">
                  Active Club
                </Text>
                <Text className="mt-1 text-[18px] font-bold text-white">
                  {currentClub.name}
                </Text>
              </View>
              <View
                className={`rounded-full border px-3 py-1.5 ${roleConfig.tint} ${roleConfig.border}`}
              >
                <Text className={`text-[11px] font-bold uppercase ${roleConfig.text}`}>
                  {getOfficerRoleLabel(currentClub.role)}
                </Text>
              </View>
            </View>
          </View>
        ) : null}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#8B5CF6" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          ListEmptyComponent={
            <View className="mt-16 items-center rounded-[28px] border border-dashed border-gray-200 bg-white px-6 py-10">
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-[#F2EDFF]">
                <Ionicons name="chatbubble-ellipses-outline" size={28} color="#8B5CF6" />
              </View>
              <Text className="text-center text-[18px] font-bold text-gray-900">
                No leadership messages yet
              </Text>
              <Text className="mt-2 text-center text-[13px] leading-5 text-gray-500">
                Once admins or officers start a thread for this club, it will appear here.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/officer/messages/[id]",
                  params: { id: item.id, clubId: item.club_id || clubId || "" },
                })
              }
              className="mb-4 rounded-[28px] border border-white/90 bg-white p-4 shadow-sm shadow-black/5"
            >
              <View className="flex-row items-start gap-4">
                <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-[18px] bg-[#F4F1FF]">
                  {item.club?.cover_image_url ? (
                    <Image
                      source={{ uri: item.club.cover_image_url }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="shield-checkmark" size={24} color="#8B5CF6" />
                  )}
                </View>

                <View className="flex-1">
                  <View className="flex-row items-center justify-between gap-3">
                    <Text className="flex-1 text-[16px] font-bold text-gray-900" numberOfLines={1}>
                      {item.subject}
                    </Text>
                    <Text className="text-[12px] font-medium text-gray-400">
                      {formatTime(item.last_message_at || item.updated_at)}
                    </Text>
                  </View>

                  <View className="mt-2 flex-row items-center gap-2">
                    <View className="rounded-full bg-[#F2EDFF] px-2.5 py-1">
                      <Text className="text-[10px] font-bold uppercase text-[#7C3AED]">
                        {getOfficerRoleLabel(item.member_role)}
                      </Text>
                    </View>
                    <Text className="text-[12px] text-gray-500" numberOfLines={1}>
                      {item.club?.name || "Admin channel"}
                    </Text>
                  </View>

                  <View className="mt-3 flex-row items-center justify-between gap-3">
                    <Text className="flex-1 text-[13px] leading-5 text-gray-600" numberOfLines={2}>
                      {item.last_message || "No messages yet"}
                    </Text>

                    {item.unread_count ? (
                      <View className="min-w-[26px] rounded-full bg-[#8B5CF6] px-2 py-1 items-center">
                        <Text className="text-[11px] font-bold text-white">
                          {item.unread_count}
                        </Text>
                      </View>
                    ) : (
                      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                    )}
                  </View>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
    </OfficerAccessGuard>
  );
}
