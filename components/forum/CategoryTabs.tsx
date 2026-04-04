import React from "react";
import { ScrollView, Text, Pressable, View } from "react-native";
import { MotiView } from "moti";
import { FORUM_CATEGORIES } from "@/lib/forum/constants";

interface CategoryTabsProps {
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
}

export default function CategoryTabs({ selectedCategory, onSelectCategory }: CategoryTabsProps) {
    return (
        <View className="bg-white border-b border-gray-100 pb-3 pt-2">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
            >
                <Pressable onPress={() => onSelectCategory("All")}>
                    <MotiView
                        animate={{
                            backgroundColor: selectedCategory === "All" ? "#1A1A1A" : "#F3F4F6",
                        }}
                        transition={{ type: "timing", duration: 200 }}
                        className="px-4 py-2 rounded-full border border-transparent"
                        style={{ borderColor: selectedCategory === "All" ? "transparent" : "#E5E7EB" }}
                    >
                        <Text
                            className={`text-[13px] font-button ${selectedCategory === "All" ? "text-white" : "text-gray-600"}`}
                        >
                            All Posts
                        </Text>
                    </MotiView>
                </Pressable>

                {FORUM_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                        <Pressable key={cat.id} onPress={() => onSelectCategory(cat.id)}>
                            <MotiView
                                animate={{
                                    backgroundColor: isSelected ? getActiveColor(cat.id) : "#FFFFFF",
                                    scale: isSelected ? 1.05 : 1,
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className={`px-4 py-2 rounded-full border ${isSelected ? "border-transparent" : "border-gray-200"}`}
                            >
                                <Text
                                    className={`text-[13px] font-button ${isSelected ? "text-white" : "text-gray-600"}`}
                                >
                                    {cat.label}
                                </Text>
                            </MotiView>
                        </Pressable>
                    );
                })}
            </ScrollView>
        </View>
    );
}

// Helper to get the hex color for the active background based on tailwind class
// Since we can't easily interpolate tailwind classes in Moti animate prop for colors sometimes, 
// we might need hardcoded colors or just use the class logic if Moti supports it via nativewind.
// Actually, for simplicity and reliability with Moti, I'll use a helper or just conditional rendering of classes if Moti isn't strictly needed for color interpolation.
// But the user asked for "Silky animations". 
// Let's use conditional classes for the text and Moti for the container scale/bg.

function getActiveColor(id: string) {
    switch (id) {
        case "general": return "#6366F1"; // Indigo-500
        case "lost_found": return "#F59E0B"; // Amber-500
        case "tips": return "#10B981"; // Emerald-500
        case "marketplace": return "#A855F7"; // Purple-500
        case "questions": return "#0EA5E9"; // Sky-500
        case "announcements": return "#F43F5E"; // Rose-500
        default: return "#1A1A1A";
    }
}
