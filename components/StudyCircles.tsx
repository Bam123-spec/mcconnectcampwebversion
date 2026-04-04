import { View, Text, ScrollView, Pressable } from "react-native";

const circles = [
    {
        id: "1",
        title: "Calculus II Final Prep",
        members: 12,
        reward: "50 SP",
        color: "bg-indigo-50",
        textColor: "text-indigo-700",
    },
    {
        id: "2",
        title: "Physics Lab Report",
        members: 8,
        reward: "30 SP",
        color: "bg-emerald-50",
        textColor: "text-emerald-700",
    },
    {
        id: "3",
        title: "React Native Study",
        members: 5,
        reward: "20 SP",
        color: "bg-sky-50",
        textColor: "text-sky-700",
    },
];

export function StudyCircles() {
    return (
        <View className="mt-8">
            <View className="flex-row items-center justify-between px-1">
                <Text className="text-lg font-bold text-gray-900">Active Study Circles</Text>
                <Text className="text-sm font-medium text-purple-600">See All</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 pl-1" contentContainerStyle={{ paddingRight: 20, gap: 12 }}>
                {circles.map((circle) => (
                    <Pressable key={circle.id} className="w-64 rounded-2xl bg-white p-4 shadow-sm shadow-black/5 border border-gray-100">
                        <View className="flex-row justify-between items-start">
                            <View className={`rounded-full px-2 py-1 ${circle.color}`}>
                                <Text className={`text-xs font-bold ${circle.textColor}`}>{circle.reward}</Text>
                            </View>
                            <View className="flex-row items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
                                <Text className="text-xs">🟢</Text>
                                <Text className="text-xs font-medium text-gray-600">{circle.members} online</Text>
                            </View>
                        </View>
                        <Text className="mt-3 text-base font-bold text-gray-900">{circle.title}</Text>
                        <View className="mt-3 flex-row items-center gap-2">
                            <View className="flex-row -space-x-2">
                                <View className="h-6 w-6 rounded-full bg-gray-200 border border-white" />
                                <View className="h-6 w-6 rounded-full bg-gray-300 border border-white" />
                                <View className="h-6 w-6 rounded-full bg-gray-400 border border-white" />
                            </View>
                            <Text className="text-xs text-gray-500">+ {circle.members - 3} others</Text>
                        </View>
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    );
}
