import React from "react";
import { View, Text, Pressable } from "react-native";
import { MotiView } from "moti";
import { Feather } from "@expo/vector-icons";

interface StatCardProps {
    label: string;
    value: string;
    icon: any;
    delay: number;
    onPress?: () => void;
}

export default function StatCard({ label, value, icon, delay, onPress }: StatCardProps) {
    return (
        <MotiView
            from={{ opacity: 0, scale: 0.9, translateY: 10 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{ type: "spring", delay }}
            className="flex-1"
        >
            <Pressable
                onPress={onPress}
                className="bg-white p-3 rounded-[20px] shadow-sm shadow-purple-100 items-center border border-purple-50 active:bg-gray-50"
            >
                <View className="h-8 w-8 rounded-full bg-[#F3E8FF] items-center justify-center mb-2">
                    <Feather name={icon} size={14} color="#6D28D9" />
                </View>
                <Text className="text-[16px] font-bold text-[#1A1A1A]">{value}</Text>
                <Text className="text-[10px] font-medium text-[#7A7A7A] uppercase tracking-wide">{label}</Text>
            </Pressable>
        </MotiView>
    );
}
