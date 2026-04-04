import React from "react";
import { View, Text } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "@/context/ThemeContext";

// Safely parse a date string like "2025-03-15" or "2025-03-15T00:00:00Z"
// Using new Date("YYYY-MM-DD") treats it as UTC midnight, causing local-time
// off-by-one errors. Splitting and constructing with local components is reliable.
function parseLocalDate(dateStr: string | null | undefined): Date {
    if (!dateStr) return new Date(NaN);
    const datePart = dateStr.split('T')[0]; // handles both date-only and ISO timestamps
    const [year, month, day] = datePart.split('-').map(Number);
    if (!year || !month || !day) return new Date(NaN);
    return new Date(year, month - 1, day); // month is 0-indexed
}

export default function DateBubble({ date }: { date: string | null }) {
    const { darkMode, theme: currentTheme } = useTheme();
    const dateObj = parseLocalDate(date);
    const isValid = !isNaN(dateObj.getTime());
    const month = isValid ? dateObj.toLocaleString("default", { month: "short" }).toUpperCase() : "---";
    const day = isValid ? dateObj.getDate() : "?";

    return (
        <BlurView 
            intensity={80} 
            tint={darkMode ? "dark" : "light"}
            className="rounded-[12px] overflow-hidden"
        >
            <View 
                style={{ 
                    backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.4)',
                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.6)'
                }}
                className="h-[50px] w-[45px] items-center justify-center border"
            >
                <Text style={{ color: currentTheme.textLight }} className="text-[10px] font-bold">{month}</Text>
                <Text style={{ color: currentTheme.text }} className="text-[18px] font-bold leading-5">{day}</Text>
            </View>
        </BlurView>
    );
}
