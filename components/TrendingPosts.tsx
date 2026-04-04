import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const posts = [
    {
        id: "1",
        author: "Sarah J.",
        time: "2h ago",
        title: "Does anyone have the notes for CS101 lecture today?",
        content: "I missed the first 15 minutes and I heard the professor mentioned something about the midterm...",
        likes: 24,
        comments: 5,
        tag: "CS101",
        tagColor: "bg-blue-50 text-blue-700",
    },
    {
        id: "2",
        author: "Mike T.",
        time: "4h ago",
        title: "Selling: Calculus Textbook (New Condition)",
        content: "Bought it for $120, selling for $80. DM me if interested!",
        likes: 12,
        comments: 2,
        tag: "Marketplace",
        tagColor: "bg-green-50 text-green-700",
    },
];

export function TrendingPosts() {
    return (
        <View className="mt-8">
            <View className="flex-row items-center justify-between px-1">
                <Text className="text-lg font-bold text-gray-900">Trending Posts</Text>
                <Text className="text-sm font-medium text-purple-600">View Forum</Text>
            </View>
            <View className="mt-4 gap-4">
                {posts.map((post) => (
                    <View key={post.id} className="rounded-2xl bg-white p-4 shadow-sm shadow-black/5 border border-gray-100">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-2">
                                <View className="h-8 w-8 rounded-full bg-gray-200" />
                                <View>
                                    <Text className="text-sm font-semibold text-gray-900">{post.author}</Text>
                                    <Text className="text-xs text-gray-500">{post.time}</Text>
                                </View>
                            </View>
                            <View className={`rounded-full px-2 py-1 ${post.tagColor}`}>
                                <Text className="text-xs font-semibold text-inherit">{post.tag}</Text>
                            </View>
                        </View>
                        <Text className="mt-3 text-base font-bold text-gray-900">{post.title}</Text>
                        <Text className="mt-1 text-sm text-gray-600" numberOfLines={2}>{post.content}</Text>
                        <View className="mt-3 flex-row items-center gap-4">
                            <View className="flex-row items-center gap-1">
                                <Ionicons name="heart-outline" size={16} color="#6b7280" accessible={false} accessibilityElementsHidden />
                                <Text className="text-xs font-medium text-gray-600">{post.likes}</Text>
                            </View>
                            <View className="flex-row items-center gap-1">
                                <Ionicons name="chatbubble-outline" size={16} color="#6b7280" accessible={false} accessibilityElementsHidden />
                                <Text className="text-xs font-medium text-gray-600">{post.comments}</Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}
