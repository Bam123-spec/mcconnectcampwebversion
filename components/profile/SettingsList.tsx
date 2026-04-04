import React from "react";
import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

interface SettingItemProps {
    icon: any;
    label: string;
    color?: string;
    onPress?: () => void;
    isLast?: boolean;
}

const SettingItem = ({ icon, label, color = "#1A1A1A", onPress, isLast }: SettingItemProps) => (
    <Pressable
        onPress={onPress}
        className={`flex-row items-center justify-between p-4 bg-white active:bg-gray-50 ${!isLast ? "border-b border-gray-50" : ""}`}
    >
        <View className="flex-row items-center gap-3">
            <View className="h-8 w-8 rounded-full bg-gray-50 items-center justify-center">
                <Feather name={icon} size={16} color={color} />
            </View>
            <Text className="text-[14px] font-medium" style={{ color }}>{label}</Text>
        </View>
        <Feather name="chevron-right" size={16} color="#D1D5DB" />
    </Pressable>
);

interface SettingsListProps {
    onLogout: () => void;
}

export default function SettingsList({ onLogout }: SettingsListProps) {
    return (
        <View className="bg-white rounded-[24px] overflow-hidden shadow-sm shadow-black/5 border border-gray-100 mb-8">
            <SettingItem icon="bell" label="Notifications" />
            <SettingItem icon="lock" label="Privacy & Security" />
            <SettingItem icon="link" label="Connected Accounts" />
            <SettingItem icon="help-circle" label="Help & Support" />
            <SettingItem icon="log-out" label="Log Out" color="#EF4444" onPress={onLogout} isLast />
        </View>
    );
}
