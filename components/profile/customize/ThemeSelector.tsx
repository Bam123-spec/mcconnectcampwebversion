import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface ThemeSelectorProps {
    selectedTheme: string | null;
    onSelect: (theme: string) => void;
}

const THEMES = [
    { id: "default", name: "Default", colors: ['transparent', 'rgba(0,0,0,0.2)'] },
    { id: "purple_haze", name: "Purple Haze", colors: ['#7C3AED', '#4C1D95'] },
    { id: "sunrise", name: "Sunrise", colors: ['#F59E0B', '#EF4444'] },
    { id: "mc_blue", name: "MC Blue", colors: ['#3B82F6', '#1E40AF'] },
    { id: "minimal", name: "Minimal Grey", colors: ['#F3F4F6', '#E5E7EB'] },
    { id: "pastel", name: "Soft Pastel", colors: ['#F9A8D4', '#F472B6'] },
];

export default function ThemeSelector({ selectedTheme, onSelect }: ThemeSelectorProps) {
    return (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text className="text-[16px] font-bold text-gray-900 mb-4">Pick a Theme</Text>
            <View className="gap-3">
                {THEMES.map((theme) => {
                    const isSelected = selectedTheme === theme.id || (!selectedTheme && theme.id === "default");
                    return (
                        <Pressable
                            key={theme.id}
                            onPress={() => onSelect(theme.id)}
                            className={`h-20 w-full rounded-2xl overflow-hidden border-2 ${isSelected ? "border-purple-600" : "border-transparent"}`}
                        >
                            <LinearGradient
                                colors={theme.colors as any}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                className="flex-1 flex-row items-center justify-between px-5"
                            >
                                <Text className={`text-[16px] font-bold ${theme.id === "minimal" || theme.id === "default" ? "text-gray-900" : "text-white"}`}>
                                    {theme.name}
                                </Text>
                                {isSelected && (
                                    <View className="bg-white rounded-full p-1">
                                        <Ionicons name="checkmark" size={16} color="#6D28D9" />
                                    </View>
                                )}
                            </LinearGradient>
                        </Pressable>
                    );
                })}
            </View>
        </ScrollView>
    );
}
