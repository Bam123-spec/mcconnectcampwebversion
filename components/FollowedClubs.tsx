import { View, Text, ScrollView, Pressable } from "react-native";

const clubs = [
    {
        id: "1",
        name: "Coding Club",
        initial: "CC",
        color: "bg-blue-100",
        textColor: "text-blue-700",
    },
    {
        id: "2",
        name: "Debate Team",
        initial: "DT",
        color: "bg-red-100",
        textColor: "text-red-700",
    },
    {
        id: "3",
        name: "Chess Club",
        initial: "CC",
        color: "bg-gray-100",
        textColor: "text-gray-700",
    },
    {
        id: "4",
        name: "Robotics",
        initial: "RC",
        color: "bg-orange-100",
        textColor: "text-orange-700",
    },
    {
        id: "5",
        name: "Art Guild",
        initial: "AG",
        color: "bg-purple-100",
        textColor: "text-purple-700",
    },
];

export function FollowedClubs() {
    return (
        <View className="mt-8">
            <View className="flex-row items-center justify-between px-1">
                <Text className="text-lg font-bold text-gray-900">Clubs You Follow</Text>
                <Text className="text-sm font-medium text-purple-600">See All</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 pl-1" contentContainerStyle={{ paddingRight: 20, gap: 16 }}>
                {clubs.map((club) => (
                    <Pressable key={club.id} className="items-center gap-2">
                        <View className={`h-16 w-16 items-center justify-center rounded-full ${club.color} border-2 border-white shadow-sm shadow-black/10`}>
                            <Text className={`text-lg font-bold ${club.textColor}`}>{club.initial}</Text>
                        </View>
                        <Text className="text-xs font-medium text-gray-700 w-16 text-center" numberOfLines={1}>{club.name}</Text>
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    );
}
