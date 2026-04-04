import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

const events = [
    {
        id: "1",
        title: "Career Fair 2024",
        date: "Thu, Nov 28 • 10:00 AM",
        location: "Student Center",
        attendees: 142,
        imageColor: "bg-blue-500",
    },
    {
        id: "2",
        title: "Hackathon Kickoff",
        date: "Fri, Nov 29 • 5:00 PM",
        location: "Engineering Hall",
        attendees: 89,
        imageColor: "bg-purple-500",
    },
    {
        id: "3",
        title: "Music Fest",
        date: "Sat, Nov 30 • 2:00 PM",
        location: "Campus Green",
        attendees: 230,
        imageColor: "bg-pink-500",
    },
];

export function FeaturedEvents() {
    const { darkMode, theme: currentTheme } = useTheme();
    return (
        <View className="mt-8">
            <View className="flex-row items-center justify-between px-1">
                <Text style={{ color: currentTheme.text }} className="text-lg font-bold">Featured Events</Text>
                <Text style={{ color: currentTheme.primary }} className="text-sm font-medium">See All</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 pl-1" contentContainerStyle={{ paddingRight: 20, gap: 16 }}>
                {events.map((event) => (
                    <View 
                        key={event.id} 
                        style={{ 
                            backgroundColor: currentTheme.surface,
                            borderColor: currentTheme.border,
                            borderWidth: darkMode ? 1 : 0,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 3,
                            elevation: 3
                        }}
                        className="w-72 overflow-hidden rounded-2xl"
                    >
                        <View className={`h-32 w-full ${event.imageColor}`} />
                        <View className="p-4">
                            <Text style={{ color: currentTheme.primary }} className="text-xs font-semibold uppercase tracking-wider">{event.date}</Text>
                            <Text style={{ color: currentTheme.text }} className="mt-1 text-lg font-bold">{event.title}</Text>
                            <View className="mt-2 flex-row items-center gap-1">
                                <Ionicons name="location-outline" size={14} color={currentTheme.textLight} />
                                <Text style={{ color: currentTheme.textLight }} className="text-sm">{event.location}</Text>
                            </View>
                            <View className="mt-4 flex-row items-center justify-between">
                                <View 
                                    style={{ backgroundColor: darkMode ? '#1E293B' : '#F9FAFB' }}
                                    className="flex-row items-center gap-1 rounded-full px-2 py-1"
                                >
                                    <Ionicons name="people-outline" size={12} color={currentTheme.textLight} />
                                    <Text style={{ color: currentTheme.textLight }} className="text-xs font-medium">{event.attendees} going</Text>
                                </View>
                                <View 
                                    style={{ backgroundColor: darkMode ? '#1E293B' : '#F3F4F6' }}
                                    className="h-8 w-8 items-center justify-center rounded-full"
                                >
                                    <Ionicons name="bookmark-outline" size={16} color={currentTheme.text} accessible={false} accessibilityElementsHidden />
                                </View>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}
