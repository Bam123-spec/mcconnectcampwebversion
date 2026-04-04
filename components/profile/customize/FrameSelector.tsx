import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FrameSelectorProps {
    selectedFrame: string | null;
    onSelect: (frame: string) => void;
}

const FRAMES = [
    { id: "default", name: "None", color: "border-white" },
    { id: "gold", name: "Gold (XP > 100)", color: "border-yellow-400" },
    { id: "neon", name: "Purple Neon", color: "border-purple-500" },
    { id: "officer", name: "Officer Green", color: "border-green-500" },
];

export default function FrameSelector({ selectedFrame, onSelect }: FrameSelectorProps) {
    return (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text className="text-[16px] font-bold text-gray-900 mb-4">Choose a Frame</Text>
            <View className="flex-row flex-wrap gap-4">
                {FRAMES.map((frame) => {
                    const isSelected = selectedFrame === frame.id || (!selectedFrame && frame.id === "default");
                    return (
                        <Pressable
                            key={frame.id}
                            onPress={() => onSelect(frame.id)}
                            className={`w-[47%] p-4 rounded-2xl border-2 ${isSelected ? "border-purple-600 bg-purple-50" : "border-gray-100 bg-white"} items-center`}
                        >
                            <View className={`h-16 w-16 rounded-full border-4 ${frame.color} bg-gray-200 mb-3`} />
                            <Text className={`text-[13px] font-bold ${isSelected ? "text-purple-700" : "text-gray-700"}`}>
                                {frame.name}
                            </Text>
                            {isSelected && (
                                <View className="absolute top-2 right-2 bg-purple-600 rounded-full p-1">
                                    <Ionicons name="checkmark" size={12} color="white" />
                                </View>
                            )}
                        </Pressable>
                    );
                })}
            </View>
        </ScrollView>
    );
}
