import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FlairSelectorProps {
    selectedFlair: string | null;
    onSelect: (flair: string) => void;
}

const FLAIRS = [
    "🎓 Freshman", "🎓 Sophomore", "🧠 Honor Student", "🇪🇹 Ethiopian Student",
    "🌍 International", "🧑‍💻 Coding Club", "🎨 Art Club", "🏀 Athletics",
    "⭐ High XP", "💬 Active Member"
];

export default function FlairSelector({ selectedFlair, onSelect }: FlairSelectorProps) {
    return (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text className="text-[16px] font-bold text-gray-900 mb-4">Select a Flair</Text>
            <View className="flex-row flex-wrap gap-3">
                {FLAIRS.map((flair) => {
                    const isSelected = selectedFlair === flair;
                    return (
                        <Pressable
                            key={flair}
                            onPress={() => onSelect(flair)}
                            className={`px-4 py-3 rounded-xl border ${isSelected ? "bg-purple-600 border-purple-600" : "bg-white border-gray-200"}`}
                        >
                            <Text className={`text-[14px] font-bold ${isSelected ? "text-white" : "text-gray-700"}`}>
                                {flair}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </ScrollView>
    );
}
