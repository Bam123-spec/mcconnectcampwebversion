import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  getAdminConversationMembers,
  getAdminOfficerConversation,
  getAdminOfficerMessages,
  markAdminConversationRead,
  sendAdminOfficerMessage,
  subscribeToAdminConversation,
} from "@/lib/adminOfficerChatService";
import { getOfficerRoleConfig, getOfficerRoleLabel } from "@/lib/officerPermissions";
import { AdminConversation, AdminMessage } from "@/types/database";
import { supabase } from "@/lib/supabase";
import { useOfficerAccess } from "@/hooks/useOfficerAccess";
import OfficerAccessGuard from "@/components/officer/OfficerAccessGuard";

function getSenderTone(role?: string | null) {
  const config = getOfficerRoleConfig(role);
  return {
    accent: config.accent,
    tint: config.tint,
    text: config.text,
    border: config.border,
    label: getOfficerRoleLabel(role),
  };
}

export default function AdminConversationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, clubId } = useLocalSearchParams<{ id: string; clubId?: string }>();
  const access = useOfficerAccess({ clubId, requiredCapabilities: ["viewInbox"] });

  const [conversation, setConversation] = useState<AdminConversation | null>(null);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  const myMemberRole = useMemo(() => {
    return members.find((member) => member.user_id === currentUserId)?.role || "officer";
  }, [members, currentUserId]);

  const scrollToBottom = (animated = true) => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated });
    });
  };

  const loadConversation = useCallback(async () => {
    if (!id) {
      return;
    }

    setLoading(true);
    try {
      const [{ data: userData }, conversationData, messagesData, membersData] = await Promise.all([
        supabase.auth.getUser(),
        getAdminOfficerConversation(id),
        getAdminOfficerMessages(id),
        getAdminConversationMembers(id),
      ]);

      setCurrentUserId(userData.user?.id || "");
      setConversation(conversationData);
      setMessages(messagesData);
      setMembers(membersData);
      await markAdminConversationRead(id);
      scrollToBottom(false);
    } catch (error) {
      console.error("Error loading admin conversation:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadConversation();
    }, [loadConversation])
  );

  useEffect(() => {
    if (!id) {
      return;
    }

    const channel = subscribeToAdminConversation(id, async (message) => {
      setMessages((prev) => {
        if (prev.some((item) => item.id === message.id)) {
          return prev;
        }

        return [...prev, message];
      });

      await markAdminConversationRead(id);
      scrollToBottom();
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleSend = async () => {
    if (!id || !input.trim() || sending) {
      return;
    }

    setSending(true);
    try {
      const message = await sendAdminOfficerMessage(id, input, myMemberRole);
      setMessages((prev) => {
        if (prev.some((item) => item.id === message.id)) {
          return prev;
        }

        return [...prev, message];
      });
      setInput("");
      scrollToBottom();
    } catch (error) {
      console.error("Error sending admin message:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <OfficerAccessGuard
      loading={access.loading}
      allowed={access.canAccess}
      title="Chat Access Restricted"
      description={access.deniedReason}
    >
    <SafeAreaView className="flex-1 bg-[#F7F5FC]" edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="border-b border-white/80 bg-white px-5 py-4">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center rounded-full bg-[#F2EDFF]"
          >
            <Ionicons name="arrow-back" size={22} color="#1F2937" />
          </Pressable>

          <View className="flex-1">
            <Text className="text-[20px] font-bold text-gray-900" numberOfLines={1}>
              {conversation?.subject || "Leadership Chat"}
            </Text>
            <Text className="mt-1 text-[13px] text-gray-500" numberOfLines={1}>
              {conversation?.club?.name || "Admin and officer coordination"}
            </Text>
          </View>

          <View className="rounded-full bg-[#111827] px-3 py-1.5">
            <Text className="text-[11px] font-bold uppercase text-white">
              {getOfficerRoleLabel(myMemberRole)}
            </Text>
          </View>
        </View>

        {!!members.length && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-4"
            contentContainerStyle={{ paddingRight: 12 }}
          >
            {members.map((member) => {
              const tone = getSenderTone(member.role);
              return (
                <View
                  key={member.id}
                  className={`mr-2 rounded-full border px-3 py-2 ${tone.tint} ${tone.border}`}
                >
                  <Text className={`text-[11px] font-bold ${tone.text}`}>
                    {member.profile?.full_name || "Unknown"} · {getOfficerRoleLabel(member.role)}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#8B5CF6" />
        </View>
      ) : (
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
        >
          <ScrollView
            ref={scrollRef}
            className="flex-1 px-4"
            contentContainerStyle={{ paddingVertical: 20, paddingBottom: 36 }}
            showsVerticalScrollIndicator={false}
          >
            <LinearGradient
              colors={["#18181B", "#312E81"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="mb-6 rounded-[28px] px-4 py-4"
            >
              <Text className="text-[11px] font-bold uppercase tracking-[1.2px] text-white/60">
                Admin Channel
              </Text>
              <Text className="mt-2 text-[18px] font-bold text-white">
                Keep leadership decisions in one thread
              </Text>
              <Text className="mt-1 text-[13px] leading-5 text-white/70">
                Use this space for approvals, escalations, and officer-admin follow-up without
                mixing it into member chat.
              </Text>
            </LinearGradient>

            {messages.map((message) => {
              const isSelf = message.sender_id === currentUserId;
              const tone = getSenderTone(message.sender_role);

              return (
                <View
                  key={message.id}
                  className={`mb-4 ${isSelf ? "items-end" : "items-start"}`}
                >
                  <View className="mb-1 flex-row items-center gap-2 px-1">
                    {!isSelf && (
                      <Text className="text-[12px] font-medium text-gray-500">
                        {message.sender?.full_name || "Leadership"}
                      </Text>
                    )}
                    <View className={`rounded-full border px-2 py-0.5 ${tone.tint} ${tone.border}`}>
                      <Text className={`text-[10px] font-bold uppercase ${tone.text}`}>
                        {tone.label}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      backgroundColor: isSelf ? "#111827" : "#FFFFFF",
                      borderColor: isSelf ? "#111827" : "#E5E7EB",
                    }}
                    className={`max-w-[86%] rounded-[24px] border px-4 py-3 ${
                      isSelf ? "rounded-tr-md" : "rounded-tl-md"
                    }`}
                  >
                    <Text
                      className={`text-[15px] leading-6 ${
                        isSelf ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {message.body}
                    </Text>
                  </View>

                  <Text className="mt-1 px-1 text-[11px] text-gray-400">
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              );
            })}
          </ScrollView>

          <View
            className="border-t border-white/70 bg-white px-4 pt-3"
            style={{ paddingBottom: Math.max(insets.bottom, 12) }}
          >
            <View className="flex-row items-end gap-3">
              <View className="flex-1 rounded-[24px] border border-gray-200 bg-[#F8F7FB] px-4 py-3">
                <TextInput
                  value={input}
                  onChangeText={setInput}
                  placeholder="Write to admins and club leadership..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  className="max-h-32 text-[15px] text-gray-900"
                />
              </View>

              <Pressable
                onPress={handleSend}
                disabled={sending || !input.trim()}
                className={`h-14 w-14 items-center justify-center rounded-full ${
                  sending || !input.trim() ? "bg-purple-200" : "bg-[#8B5CF6]"
                }`}
              >
                {sending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Ionicons name="paper-plane" size={20} color="white" />
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
    </OfficerAccessGuard>
  );
}
