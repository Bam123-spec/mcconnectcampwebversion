import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ActionButtonsProps {
    onFollow?: () => void;
    onMessage?: () => void;
    onShare?: () => void;
    isFollowing?: boolean;
}

export default function ActionButtons({ onFollow, onMessage, onShare, isFollowing = false }: ActionButtonsProps) {
    return (
        <View className="flex-row items-center gap-3 px-5 mb-6">
            {/* Follow Button */}
            <Pressable
                onPress={onFollow}
                className={`flex-1 h-10 flex-row items-center justify-center gap-2 rounded-full ${isFollowing ? "bg-gray-100 border border-gray-200" : "bg-[#6D28D9]"}`}
            >
                <Text className={`text-[14px] font-bold ${isFollowing ? "text-gray-900" : "text-white"}`}>
                    {isFollowing ? "Following" : "Follow"}
                </Text>
            </Pressable>

            {/* Message Button */}
            <Pressable
                onPress={onMessage}
                className="flex-1 h-10 flex-row items-center justify-center gap-2 rounded-full bg-gray-100 border border-gray-200"
            >
                <Ionicons name="chatbubble-outline" size={16} color="#374151" />
                <Text className="text-[14px] font-bold text-gray-900">Message</Text>
            </Pressable>

            {/* Share/Scan Button */}
            <Pressable
                onPress={onShare}
                className="h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white"
            >
                <Ionicons name="qr-code-outline" size={20} color="#374151" />
            </Pressable>
        </View>
    );
}
