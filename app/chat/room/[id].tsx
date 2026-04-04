import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    Pressable,
    Image,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Keyboard,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { getRoom, getMessages, sendMessage, subscribeToRoom, uploadChatImage } from "@/lib/chatService";
import { ChatRoom, ChatMessage } from "@/types/database";
import { supabase } from "@/lib/supabase";
import * as ImagePicker from 'expo-image-picker';
import { useAchievements } from "@/context/AchievementContext";
import { useTheme } from "@/context/ThemeContext";
import { StatusBar } from "expo-status-bar";

const ScalePressable = ({ children, className, onPress, style }: { children: React.ReactNode; className?: string; onPress?: () => void; style?: any }) => (
    <Pressable
        onPress={onPress}
        style={({ pressed }) => [
            {
                transform: [{ scale: pressed ? 0.98 : 1 }],
                opacity: pressed ? 0.9 : 1,
            },
            style
        ]}
        className={className}
    >
        {children}
    </Pressable>
);

const getDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === now.toDateString()) {
        return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
    } else {
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    }
};

const MessageBubble = ({ message, index, currentUserId, isOfficer }: { message: ChatMessage; index: number; currentUserId: string; isOfficer: boolean }) => {
    const { darkMode, theme: currentTheme } = useTheme();
    const isSelf = message.sender_id === currentUserId;

    return (
        <MotiView
            from={{ opacity: 0, scale: 0.9, translateY: 10 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{ type: "spring", delay: 0 }}
            className={`mb-3 max-w-[80%] ${isSelf ? "self-end" : "self-start"}`}
        >
            <View className="flex-row items-center mb-1 ml-1">
                {!isSelf && <Text style={{ color: currentTheme.textLight }} className="text-[11px] font-metadata mr-2">{message.sender?.full_name || "Unknown"}</Text>}
                {isOfficer && (
                    <View className="px-2 py-0.5 rounded-full bg-green-100 border border-green-300 shadow-sm">
                        <Text className="text-green-700 text-[10px] font-button">Officer</Text>
                    </View>
                )}
            </View>

            <View
                style={{ 
                    backgroundColor: isOfficer 
                        ? "#2ecc71" 
                        : isSelf 
                            ? currentTheme.primary 
                            : (darkMode ? currentTheme.surfaceSelected : "#F1F1F5"),
                    borderColor: isOfficer ? "transparent" : currentTheme.border
                }}
                className={`px-4 py-3 rounded-[20px] shadow-sm shadow-black/5 relative overflow-hidden ${isOfficer
                    ? `${isSelf ? "rounded-tr-none" : "rounded-tl-none"}`
                    : isSelf
                        ? "rounded-tr-none"
                        : "rounded-tl-none border"
                    }`}
            >
                {/* Sparkles for Officer */}
                {isOfficer && (
                    <>
                        <Text className="absolute top-1 left-2 text-white opacity-20 text-[10px]">✦</Text>
                        <Text className="absolute bottom-2 right-4 text-white opacity-20 text-[12px]">✧</Text>
                        <Text className="absolute top-1/2 left-1/2 text-white opacity-10 text-[14px]">✦</Text>
                    </>
                )}

                {message.image_url ? (
                    <Image
                        source={{ uri: message.image_url }}
                        style={{ backgroundColor: darkMode ? currentTheme.bg : "#E5E7EB" }}
                        className="w-[200px] h-[150px] rounded-lg mb-2"
                        resizeMode="cover"
                    />
                ) : null}
                {message.content ? (
                    <Text 
                        style={{ color: (isOfficer || isSelf) ? "white" : currentTheme.text }}
                        className={`text-[15px] leading-5 font-body`}
                    >
                        {message.content}
                    </Text>
                ) : null}
            </View>
            <Text style={{ color: currentTheme.textLight }} className={`text-[10px] font-metadata mt-1 ${isSelf ? "text-right mr-1" : "ml-1"}`}>
                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
        </MotiView>
    );
};

export default function ChatRoomScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { darkMode, theme: currentTheme } = useTheme();

    const [room, setRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingOlder, setLoadingOlder] = useState(false);
    const [messagePage, setMessagePage] = useState(0);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [inputText, setInputText] = useState("");
    const [currentUserId, setCurrentUserId] = useState<string>("");
    const [sentMessageCount, setSentMessageCount] = useState<number>(0);
    const [uploading, setUploading] = useState(false);
    const [officerIds, setOfficerIds] = useState<Set<string>>(new Set());

    const scrollViewRef = useRef<ScrollView>(null);

    // Auto-scroll helper
    const scrollToBottom = (animated = true) => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated });
        }, 100);
    };

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) setCurrentUserId(data.user.id);
        });
    }, []);

    useEffect(() => {
        if (!currentUserId) return;

        let isActive = true;

        supabase
            .from("chat_messages")
            .select("id", { count: "exact", head: true })
            .eq("sender_id", currentUserId)
            .then(({ count, error }) => {
                if (!isActive || error) return;
                setSentMessageCount(count || 0);
            });

        return () => {
            isActive = false;
        };
    }, [currentUserId]);

    useEffect(() => {
        const fetchRoomData = async () => {
            if (!id || typeof id !== 'string') return;

            // Reset state for new room
            setOfficerIds(new Set());

            try {
                const [roomData, messagesData] = await Promise.all([
                    getRoom(id),
                    getMessages(id, { limit: 50, offset: 0 })
                ]);

                setRoom(roomData);
                setMessages(messagesData);
                setMessagePage(0);
                setHasMoreMessages(messagesData.length === 50);

                // Fetch officers if club chat
                if (roomData?.club_id) {
                    const officerSet = new Set<string>();
                    const officerRoles = ['president', 'vice president', 'v. president', 'treasurer', 'secretary', 'admin', 'officer'];

                    // 1. Fetch from officers table (definitive)
                    const { data: officialOfficers } = await supabase
                        .from("officers")
                        .select("user_id")
                        .eq("club_id", roomData.club_id);

                    officialOfficers?.forEach(o => officerSet.add(o.user_id));

                    // 2. Fetch from club_members (fallback for roles stored there)
                    const { data: members } = await supabase
                        .from("club_members")
                        .select("user_id, role")
                        .eq("club_id", roomData.club_id)
                        .neq("role", "member")
                        .neq("role", "student");

                    members?.forEach(m => {
                        if (m.role && officerRoles.some(r => m.role.toLowerCase().includes(r))) {
                            officerSet.add(m.user_id);
                        }
                    });

                    setOfficerIds(officerSet);
                }

                scrollToBottom(false);
            } catch (error) {
                console.error("Error fetching chat data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRoomData();
    }, [id]);

    const loadOlderMessages = async () => {
        if (!id || typeof id !== 'string' || loadingOlder || !hasMoreMessages) return;

        setLoadingOlder(true);
        try {
            const nextPage = messagePage + 1;
            const olderMessages = await getMessages(id, { limit: 50, offset: nextPage * 50 });
            if (olderMessages.length > 0) {
                setMessages(prev => {
                    const seen = new Set(prev.map(message => message.id));
                    return [
                        ...olderMessages.filter(message => !seen.has(message.id)),
                        ...prev,
                    ];
                });
            }
            setMessagePage(nextPage);
            setHasMoreMessages(olderMessages.length === 50);
        } catch (error) {
            console.error("Error loading older messages:", error);
        } finally {
            setLoadingOlder(false);
        }
    };

    useEffect(() => {
        if (!id || typeof id !== 'string') return;

        const channel = subscribeToRoom(id, (newMessage) => {
            setMessages(prev => {
                // Prevent duplicates if we already added it optimistically
                if (prev.some(m => m.id === newMessage.id)) return prev;
                return [...prev, newMessage];
            });
            scrollToBottom();
        });

        // Keyboard listeners for auto-scroll
        const showListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            () => scrollToBottom()
        );

        return () => {
            supabase.removeChannel(channel);
            showListener.remove();
        };
    }, [id]);

    const { checkTrigger } = useAchievements();

    const handleSend = async () => {
        if (!inputText.trim() || !id || typeof id !== 'string') return;

        const content = inputText.trim();
        setInputText("");
        scrollToBottom();

        try {
            const sentMessage = await sendMessage(id, content);
            setMessages(prev => [...prev, sentMessage]);
            scrollToBottom();

            const nextSentCount = sentMessageCount + 1;
            setSentMessageCount(nextSentCount);
            await checkTrigger('message_count', { count: nextSentCount });

        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    const handlePickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled) {
                setUploading(true);
                const uri = result.assets[0].uri;
                const publicUrl = await uploadChatImage(uri);

                if (publicUrl && typeof id === 'string') {
                    const sentMessage = await sendMessage(id, "Sent an image", publicUrl);
                    setMessages(prev => [...prev, sentMessage]);
                    scrollToBottom();
                }
            }
        } catch (error) {
            console.error("Error picking image:", error);
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <View style={{ backgroundColor: currentTheme.bg }} className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color={currentTheme.primary} />
            </View>
        );
    }

    if (!room) {
        return (
            <View style={{ backgroundColor: currentTheme.bg }} className="flex-1 items-center justify-center">
                <Text style={{ color: currentTheme.textLight }} className="text-gray-500 font-body">Chat not found</Text>
            </View>
        );
    }

    return (
        <View style={{ backgroundColor: currentTheme.bg }} className="flex-1">
            <StatusBar style={darkMode ? "light" : "dark"} />
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView className="flex-1" edges={["top"]}>
                {/* Header - Outside KAV */}
                <View 
                    style={{ backgroundColor: currentTheme.surface, borderBottomColor: currentTheme.border }}
                    className="flex-row items-center px-4 py-3 border-b shadow-sm shadow-black/5 z-10"
                >
                    <Pressable onPress={() => router.back()} className="mr-3 p-1">
                        <Ionicons name="chevron-back" size={24} color={currentTheme.text} />
                    </Pressable>
                    <View style={{ backgroundColor: darkMode ? currentTheme.bg : "#F3F4F6", borderColor: currentTheme.border }} className="h-9 w-9 rounded-full overflow-hidden mr-3 border items-center justify-center">
                        {room.image_url ? (
                            <Image source={{ uri: room.image_url }} className="h-full w-full" resizeMode="cover" />
                        ) : (
                            <Ionicons name={room.type === 'class' ? "school" : "people"} size={18} color={currentTheme.primary} />
                        )}
                    </View>
                    <View>
                        <Text style={{ color: currentTheme.text }} className="text-[16px] font-h1">{room.name || room.class_name || "Chat"}</Text>
                        <Text style={{ color: currentTheme.textLight }} className="text-[11px] font-metadata">
                            {room.type === 'dm' ? "Online now" : `${room.member_count || 0} members`}
                        </Text>
                    </View>
                </View>

                {/* KeyboardAvoidingView - Wraps Content & Input */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "padding"}
                    className="flex-1"
                    keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
                >
                    <View className="flex-1">
                        <ScrollView
                            ref={scrollViewRef}
                            className="flex-1 px-4"
                            contentContainerStyle={{ paddingVertical: 20 }}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            keyboardDismissMode="on-drag"
                        >
                            {hasMoreMessages && (
                                <View className="items-center mb-4">
                                    <Pressable
                                        onPress={loadOlderMessages}
                                        style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}
                                        className="px-4 py-2 rounded-full border"
                                    >
                                        {loadingOlder ? (
                                            <ActivityIndicator size="small" color={currentTheme.primary} />
                                        ) : (
                                            <Text style={{ color: currentTheme.textLight }} className="text-[11px] font-button">
                                                Load older messages
                                            </Text>
                                        )}
                                    </Pressable>
                                </View>
                            )}

                            {messages.map((msg, index) => {
                                const currentDateHeader = getDateHeader(msg.created_at);
                                const prevDateHeader = index > 0 ? getDateHeader(messages[index - 1].created_at) : null;
                                const showHeader = currentDateHeader !== prevDateHeader;

                                return (
                                    <React.Fragment key={msg.id}>
                                        {showHeader && (
                                            <View className="items-center my-4">
                                                <View style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }} className="px-3 py-1 rounded-full border">
                                                    <Text style={{ color: currentTheme.textLight }} className="text-[10px] font-button">{currentDateHeader}</Text>
                                                </View>
                                            </View>
                                        )}
                                        <MessageBubble
                                            message={msg}
                                            index={index}
                                            currentUserId={currentUserId}
                                            isOfficer={officerIds.has(msg.sender_id)}
                                        />
                                    </React.Fragment>
                                );
                            })}
                        </ScrollView>

                        {/* Input Bar */}
                        <View
                            style={{ 
                                backgroundColor: currentTheme.surface, 
                                borderTopColor: currentTheme.border,
                                paddingBottom: Math.max(insets.bottom, 12) 
                            }}
                            className="px-4 py-3 border-t"
                        >
                            <View className="flex-row items-center gap-3">
                                <Pressable 
                                    onPress={handlePickImage} 
                                    style={{ backgroundColor: darkMode ? currentTheme.bg : "#F9FAFB" }}
                                    className="p-2 rounded-full"
                                >
                                    {uploading ? (
                                        <ActivityIndicator size="small" color={currentTheme.primary} />
                                    ) : (
                                        <Ionicons name="image-outline" size={22} color={currentTheme.primary} />
                                    )}
                                </Pressable>
                                <View 
                                    style={{ 
                                        backgroundColor: darkMode ? currentTheme.bg : "#F7F5FC",
                                        borderColor: currentTheme.border
                                    }}
                                    className="flex-1 h-[44px] rounded-[22px] px-4 justify-center border"
                                >
                                    <TextInput
                                        placeholder="Type a message..."
                                        placeholderTextColor={currentTheme.textLight}
                                        style={{ color: currentTheme.text }}
                                        className="text-[14px] font-body h-full"
                                        value={inputText}
                                        onChangeText={setInputText}
                                        onSubmitEditing={handleSend}
                                        returnKeyType="send"
                                    />
                                </View>
                                <ScalePressable 
                                    onPress={handleSend} 
                                    style={{ backgroundColor: currentTheme.primary }}
                                    className="h-[44px] w-[44px] rounded-full items-center justify-center shadow-sm"
                                >
                                    <Ionicons name="arrow-up" size={20} color="white" />
                                </ScalePressable>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View >
    );
}
