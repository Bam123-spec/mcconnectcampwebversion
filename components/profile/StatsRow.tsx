import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

interface StatProps {
    label: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress?: () => void;
}

const StatCard = ({ label, value, icon, onPress }: StatProps) => {
    const { theme: currentTheme } = useTheme();
    return (
        <Pressable
            onPress={onPress}
            className="flex-1 p-3 rounded-2xl shadow-sm items-center justify-center"
            style={{ 
                backgroundColor: currentTheme.surface, 
                borderColor: currentTheme.border,
                borderWidth: 1
            }}
        >
            <View 
                className="h-8 w-8 rounded-full items-center justify-center mb-2"
                style={{ backgroundColor: currentTheme.iconContainer }}
            >
                <Ionicons name={icon} size={16} color={currentTheme.primary} />
            </View>
            <Text className="text-[16px] font-h1" style={{ color: currentTheme.text }}>{value}</Text>
            <Text className="text-[11px] font-metadata" style={{ color: currentTheme.textMuted }}>{label}</Text>
        </Pressable>
    );
};

interface StatsRowProps {
    clubsCount: number;
    eventsCount: number;
    friendsCount: number;
    followersCount: number;
    onFriendsPress?: () => void;
    onClubsPress?: () => void;
}

export default function StatsRow({ clubsCount, eventsCount, friendsCount, followersCount, onFriendsPress, onClubsPress }: StatsRowProps) {
    return (
        <View className="flex-row px-5 gap-3 mb-8">
            <StatCard label="Clubs" value={clubsCount.toString()} icon="people" onPress={onClubsPress} />
            <StatCard label="Events" value={eventsCount.toString()} icon="calendar" />
            <StatCard label="Friends" value={friendsCount.toString()} icon="happy" onPress={onFriendsPress} />
            <StatCard label="Followers" value={followersCount.toString()} icon="heart" />
        </View>
    );
}
