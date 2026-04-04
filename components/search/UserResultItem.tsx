import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Profile } from "@/types/database";
import { useRouter } from "expo-router";

interface UserResultItemProps {
    user: Profile;
    onPress?: () => void;
}

export default function UserResultItem({ user, onPress }: UserResultItemProps) {
    const router = useRouter();

    const handlePress = () => {
        if (onPress) onPress();
        router.push(`/profile/${user.id}`);
    };

    return (
        <Pressable
            onPress={handlePress}
            className="flex-row items-center justify-between px-5 py-3 bg-white border-b border-gray-50 active:bg-gray-50"
        >
            <View className="flex-row items-center gap-3">
                {/* Avatar */}
                <View className="h-12 w-12 rounded-full bg-gray-100 overflow-hidden border border-gray-100">
                    {user.avatar_url ? (
                        <Image source={{ uri: user.avatar_url }} className="h-full w-full" />
                    ) : (
                        <View className="h-full w-full items-center justify-center">
                            <Ionicons name="person" size={20} color="#9CA3AF" />
                        </View>
                    )}
                </View>

                {/* Info */}
                <View>
                    <Text className="text-[16px] font-bold text-gray-900">
                        {user.username || user.full_name || "User"}
                    </Text>
                    {user.username && user.full_name && (
                        <Text className="text-[13px] text-gray-500">
                            {user.full_name}
                        </Text>
                    )}
                </View>
            </View>

            {/* Action */}
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
        </Pressable>
    );
}
