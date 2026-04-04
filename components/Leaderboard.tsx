import { View, Text, Pressable } from "react-native";

const leaders = [
    {
        rank: 1,
        name: "Alex M.",
        sp: "2,450 SP",
        xp: "Lvl 12",
        avatarColor: "bg-yellow-100",
        textColor: "text-yellow-700",
    },
    {
        rank: 2,
        name: "Jessica K.",
        sp: "2,320 SP",
        xp: "Lvl 11",
        avatarColor: "bg-gray-100",
        textColor: "text-gray-700",
    },
    {
        rank: 3,
        name: "David L.",
        sp: "2,100 SP",
        xp: "Lvl 10",
        avatarColor: "bg-orange-100",
        textColor: "text-orange-700",
    },
];

export function Leaderboard() {
    return (
        <View className="mt-8">
            <View className="flex-row items-center justify-between px-1">
                <Text className="text-lg font-bold text-gray-900">Weekly Leaderboard</Text>
                <Text className="text-sm font-medium text-purple-600">View All</Text>
            </View>
            <View className="mt-4 rounded-2xl bg-white p-4 shadow-sm shadow-black/5 border border-gray-100">
                {leaders.map((leader, index) => (
                    <View key={leader.rank} className={`flex-row items-center justify-between py-3 ${index !== leaders.length - 1 ? "border-b border-gray-100" : ""}`}>
                        <View className="flex-row items-center gap-3">
                            <Text className="w-6 text-center text-base font-bold text-gray-400">{leader.rank}</Text>
                            <View className={`h-10 w-10 items-center justify-center rounded-full ${leader.avatarColor}`}>
                                <Text className={`text-sm font-bold ${leader.textColor}`}>{leader.name.charAt(0)}</Text>
                            </View>
                            <View>
                                <Text className="text-base font-bold text-gray-900">{leader.name}</Text>
                                <Text className="text-xs text-gray-500">{leader.xp}</Text>
                            </View>
                        </View>
                        <View className="rounded-full bg-purple-50 px-3 py-1">
                            <Text className="text-sm font-bold text-purple-700">{leader.sp}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}
