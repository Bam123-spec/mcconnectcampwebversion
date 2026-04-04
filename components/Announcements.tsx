import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const announcements = [
    {
        id: "1",
        title: "Library Hours Extended",
        date: "Nov 28",
        content: "The main library will be open 24/7 during finals week starting Dec 1st.",
        type: "Important",
        color: "bg-red-50",
        textColor: "text-red-700",
    },
    {
        id: "2",
        title: "Campus Shuttle Update",
        date: "Nov 27",
        content: "New shuttle route added for the Engineering complex. Check the app for details.",
        type: "Update",
        color: "bg-blue-50",
        textColor: "text-blue-700",
    },
];

export function Announcements() {
    return (
        <View className="mt-8 mb-8">
            <View className="flex-row items-center justify-between px-1">
                <Text className="text-lg font-bold text-gray-900">Student Life Announcements</Text>
            </View>
            <View className="mt-4 gap-4">
                {announcements.map((item) => (
                    <View key={item.id} className="rounded-2xl bg-white p-4 shadow-sm shadow-black/5 border border-gray-100">
                        <View className="flex-row items-center justify-between">
                            <View className={`rounded-full px-2 py-1 ${item.color}`}>
                                <Text className={`text-xs font-bold ${item.textColor}`}>{item.type}</Text>
                            </View>
                            <Text className="text-xs text-gray-500">{item.date}</Text>
                        </View>
                        <Text className="mt-2 text-base font-bold text-gray-900">{item.title}</Text>
                        <Text className="mt-1 text-sm text-gray-600">{item.content}</Text>
                        <View className="mt-3 flex-row items-center gap-1">
                            <Text className="text-xs font-medium text-purple-600">Read More</Text>
                            <Ionicons name="arrow-forward" size={12} color="#9333ea" accessible={false} accessibilityElementsHidden />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}
