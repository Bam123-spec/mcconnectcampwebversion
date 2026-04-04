import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Profile } from "@/types/database";

interface FriendAvatarProps {
    friend: Profile;
    onPress: () => void;
}

export default function FriendAvatar({ friend, onPress }: FriendAvatarProps) {
    return (
        <Pressable onPress={onPress} className="mr-4 items-center gap-2 w-[70px]">
            <View className="h-[64px] w-[64px] rounded-full overflow-hidden border border-[#F0F0F0] bg-gray-100 items-center justify-center">
                {friend.avatar_url ? (
                    <Image source={{ uri: friend.avatar_url }} className="h-full w-full" resizeMode="cover" />
                ) : (
                    <View className="h-full w-full items-center justify-center bg-[#E9E3FF]">
                        <Text className="text-[20px] font-bold text-[#6D28D9]">{friend.full_name?.charAt(0) || "?"}</Text>
                    </View>
                )}
            </View>
            <Text className="text-[12px] font-medium text-[#7A7A7A] text-center" numberOfLines={1}>
                {friend.full_name?.split(" ")[0]}
            </Text>
        </Pressable>
    );
}
