import React from "react";
import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AvatarGridProps {
    selectedPreset: string | null;
    onSelect: (preset: string) => void;
}

const AVATAR_PRESETS = [
    "Felix", "Aneka", "Zoe", "Bear", "Leo", "Max", "Liam", "Milo"
];

export default function AvatarGrid({ selectedPreset, onSelect }: AvatarGridProps) {
    return (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text className="text-[16px] font-bold text-gray-900 mb-4">Choose an Avatar</Text>
            <View className="flex-row flex-wrap gap-4 justify-between">
                {AVATAR_PRESETS.map((preset) => {
                    const isSelected = selectedPreset === preset;
                    return (
                        <Pressable
                            key={preset}
                            onPress={() => onSelect(preset)}
                            className={`w-[47%] aspect-square rounded-2xl border-2 ${isSelected ? "border-purple-600 bg-purple-50" : "border-gray-100 bg-white"} items-center justify-center p-2`}
                        >
                            <Image
                                source={{ uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${preset}` }}
                                className="h-24 w-24"
                                resizeMode="contain"
                            />
                            <Text className={`text-[12px] font-medium mt-2 ${isSelected ? "text-purple-700" : "text-gray-500"}`}>
                                {preset}
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
