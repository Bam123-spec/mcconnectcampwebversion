import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Club } from "@/types/database";

interface OfficerClubCardProps {
    club: Club;
    role: string;
    onPress: () => void;
}

export default function OfficerClubCard({ club, role, onPress }: OfficerClubCardProps) {
    const getRoleColor = (r: string) => {
        switch (r.toLowerCase()) {
            case "president": return { bg: "bg-purple-100", text: "text-purple-700" };
            case "vice president": return { bg: "bg-blue-100", text: "text-blue-700" };
            case "treasurer": return { bg: "bg-green-100", text: "text-green-700" };
            case "secretary": return { bg: "bg-orange-100", text: "text-orange-700" };
            default: return { bg: "bg-slate-100", text: "text-slate-700" };
        }
    };

    const roleStyle = getRoleColor(role);

    return (
        <View className="bg-white p-4 rounded-[24px] shadow-sm shadow-black/5 border border-gray-100 mb-3">
            <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-3">
                    <View className="h-10 w-10 rounded-full bg-gray-50 items-center justify-center border border-gray-100">
                        <Ionicons name="people" size={20} color="#6D28D9" />
                    </View>
                    <View>
                        <Text className="text-[15px] font-bold text-[#1A1A1A]">{club.name}</Text>
                        <View className={`self-start px-2 py-0.5 rounded-full mt-1 ${roleStyle.bg}`}>
                            <Text className={`text-[10px] font-bold uppercase ${roleStyle.text}`}>{role}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <Pressable
                onPress={onPress}
                className="w-full bg-[#F9FAFB] border border-[#E5E7EB] py-2.5 rounded-[14px] items-center active:bg-gray-100"
            >
                <Text className="text-[13px] font-bold text-[#374151]">Manage Club</Text>
            </Pressable>
        </View>
    );
}
