import React, { useState, useEffect, useRef } from "react";
import { View, Text, FlatList, Image, Pressable } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { ChatRoom } from "@/types/database";
import { getRooms } from "@/lib/chatService";
import { ActivityIndicator } from "react-native";
import { useTheme } from "@/context/ThemeContext";

// --- Helper Functions ---

function truncateWithEllipsis(text: string, maxChars = 45) {
    if (!text) return "";
    return text.length <= maxChars
        ? text
        : text.slice(0, maxChars).trim() + " (…)";
}

const ChatListItem = ({ item, onPress, delay }: { item: ChatRoom; onPress: () => void; delay: number }) => {
    const { darkMode, theme: currentTheme } = useTheme();
    const clubName = item.name || item.class_name || "Chat";
    const previewText = item.last_message || "No messages yet";
    const formattedTime = new Date(item.last_message_at || item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const unreadCount = item.unread_count || 0;
    // Mock an online status based on even/odd ID length just for the premium demo effect
    const isOnline = item.id.length % 2 === 0;

    return (
        <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 400, delay }}
            className="px-3"
        >
            <Pressable
                onPress={onPress}
                style={({ pressed }) => [{
                    backgroundColor: pressed ? (darkMode ? currentTheme.surfaceSelected : '#F2EFF9') : 'transparent',
                    borderRadius: 20,
                }]}
            >
                <View 
                    style={{ borderBottomColor: darkMode ? currentTheme.border : 'rgba(229, 231, 235, 0.5)' }}
                    className="flex-row items-center py-3.5 px-3 border-b"
                >
                    {/* AVATAR with Online Indicator */}
                    <View className="relative mr-4">
                        <View 
                            style={{ 
                                backgroundColor: darkMode ? currentTheme.bg : "#F5F3FF",
                                borderColor: currentTheme.border
                            }}
                            className="h-[56px] w-[56px] rounded-full overflow-hidden border items-center justify-center"
                        >
                            {item.image_url ? (
                                <Image source={{ uri: item.image_url }} className="h-full w-full" resizeMode="cover" />
                            ) : (
                                <Ionicons name={item.type === 'class' ? "school" : "people"} size={26} color={currentTheme.primary} />
                            )}
                        </View>
                        {isOnline && (
                            <View 
                                style={{ borderColor: currentTheme.surface }}
                                className="absolute bottom-0 right-0 h-[15px] w-[15px] bg-green-500 rounded-full border-[2.5px] z-10 shadow-sm" 
                            />
                        )}
                    </View>

                    {/* CONTENT CONTAINER */}
                    <View className="flex-1 justify-center">
                        <View className="flex-row justify-between items-baseline mb-1">
                            <Text 
                                style={{ color: currentTheme.text }}
                                className="text-[16px] font-bold tracking-tight" 
                                numberOfLines={1}
                            >
                                {truncateWithEllipsis(clubName, 30)}
                            </Text>
                            <Text 
                                style={{ color: unreadCount > 0 ? currentTheme.primary : currentTheme.textLight }}
                                className="text-[12px] font-medium tracking-tight"
                            >
                                {formattedTime}
                            </Text>
                        </View>

                        <View className="flex-row justify-between items-center">
                            <Text 
                                style={{ color: unreadCount > 0 ? currentTheme.text : currentTheme.textMuted }}
                                className={`text-[14px] flex-1 mr-4 ${unreadCount > 0 ? 'font-semibold' : 'font-normal'}`} 
                                numberOfLines={1}
                            >
                                {item.last_message_is_officer && (
                                    <Text style={{ color: currentTheme.primary }} className="font-bold">Officer: </Text>
                                )}
                                {truncateWithEllipsis(previewText, 50)}
                            </Text>

                            {unreadCount > 0 && (
                                <View 
                                    style={{ backgroundColor: currentTheme.primary, shadowColor: currentTheme.primary }}
                                    className="rounded-full min-w-[24px] h-[24px] px-2 items-center justify-center shadow-sm"
                                >
                                    <Text 
                                        style={{ color: darkMode ? currentTheme.bg : "white" }}
                                        className="text-[11px] font-bold"
                                    >
                                        {unreadCount}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </Pressable>
        </MotiView>
    );
};

const PAGE_SIZE = 20;
const ROOM_LIST_STALE_MS = 30 * 1000;

export default function ChatList({ type, isActive }: { type: 'group' | 'dm' | 'class'; isActive: boolean }) {
    const { theme: currentTheme } = useTheme();
    const router = useRouter();
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const lastFetchedAtRef = useRef(0);
    const hasLoadedRef = useRef(false);

    const fetchRooms = async (nextPage = 0, reset = false, force = false) => {
        if (!force && reset && hasLoadedRef.current && Date.now() - lastFetchedAtRef.current < ROOM_LIST_STALE_MS) {
            return;
        }

        if (reset || nextPage === 0) {
            if (hasLoadedRef.current) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
        } else {
            setLoadingMore(true);
        }

        const data = await getRooms(type, { limit: PAGE_SIZE, offset: nextPage * PAGE_SIZE });

        setRooms((prev) => {
            if (reset || nextPage === 0) {
                return data;
            }

            const seen = new Set(prev.map((room) => room.id));
            return [...prev, ...data.filter((room) => !seen.has(room.id))];
        });
        setPage(nextPage);
        setHasMore(data.length === PAGE_SIZE);
        lastFetchedAtRef.current = Date.now();
        hasLoadedRef.current = true;
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
    };

    useEffect(() => {
        if (isActive && !hasLoadedRef.current) {
            fetchRooms(0, true, true);
        }
    }, [isActive, type]);

    useFocusEffect(
        React.useCallback(() => {
            if (isActive) {
                fetchRooms(0, true);
            }
        }, [isActive, type])
    );

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator color={currentTheme.primary} />
            </View>
        );
    }

    return (
        <FlatList
            data={rooms}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
                <ChatListItem
                    item={item}
                    onPress={() => router.push(`/chat/room/${item.id}`)}
                    delay={index * 100}
                />
            )}
            contentContainerStyle={{ paddingVertical: 20, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            onEndReachedThreshold={0.4}
            onEndReached={() => {
                if (!loadingMore && hasMore) {
                    fetchRooms(page + 1);
                }
            }}
            onRefresh={() => fetchRooms(0, true, true)}
            refreshing={refreshing}
            ListFooterComponent={
                loadingMore ? (
                    <View className="py-4">
                        <ActivityIndicator color={currentTheme.primary} />
                    </View>
                ) : null
            }
            ListEmptyComponent={
                <View className="items-center mt-20">
                    <Text style={{ color: currentTheme.textLight }}>No chats yet.</Text>
                </View>
            }
        />
    );
}
