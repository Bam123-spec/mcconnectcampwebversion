import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Event } from "@/types/database";
import EventsRow from "./EventsRow";
import { useTheme } from "@/context/ThemeContext";

interface ProfileEventsSectionProps {
    upcomingEvents: Event[];
    pastEvents: Event[];
}

export default function ProfileEventsSection({ upcomingEvents, pastEvents }: ProfileEventsSectionProps) {
    const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
    const { theme: currentTheme } = useTheme();

    return (
        <View className="mb-8">
            {/* Tabs Header */}
            <View className="flex-row items-center px-5 mb-4 gap-6 border-b pb-1" style={{ borderBottomColor: currentTheme.border }}>
                <Pressable
                    onPress={() => setActiveTab("upcoming")}
                    className={`pb-2 border-b-2 ${activeTab === "upcoming" ? "" : "border-transparent"}`}
                    style={activeTab === "upcoming" ? { borderBottomColor: currentTheme.primary } : {}}
                >
                    <Text className="text-[16px] font-button" style={{ color: activeTab === "upcoming" ? currentTheme.text : currentTheme.textMuted }}>
                        Upcoming
                    </Text>
                </Pressable>
                <Pressable
                    onPress={() => setActiveTab("past")}
                    className={`pb-2 border-b-2 ${activeTab === "past" ? "" : "border-transparent"}`}
                    style={activeTab === "past" ? { borderBottomColor: currentTheme.primary } : {}}
                >
                    <Text className="text-[16px] font-button" style={{ color: activeTab === "past" ? currentTheme.text : currentTheme.textMuted }}>
                        Past Events
                    </Text>
                </Pressable>
            </View>

            {/* Content */}
            <View>
                {activeTab === "upcoming" ? (
                    <EventsRow events={upcomingEvents} />
                ) : (
                    <EventsRow events={pastEvents} />
                )}
            </View>
        </View>
    );
}
