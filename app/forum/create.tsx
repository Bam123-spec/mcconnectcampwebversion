import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { createPost } from "@/lib/forumService";
import { FORUM_CATEGORIES } from "@/lib/forum/constants";

export default function CreatePostScreen() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState(FORUM_CATEGORIES[0].id);
    const [imageUrl, setImageUrl] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!title.trim() || !content.trim()) {
            Alert.alert("Error", "Please fill in the title and content.");
            return;
        }

        setLoading(true);
        try {
            await createPost(title, content, category, imageUrl || undefined);
            Alert.alert("Success", "Post created successfully!");
            router.back();
        } catch (error) {
            Alert.alert("Error", "Failed to create post.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView className="flex-1" edges={["top"]}>
                {/* Header */}
                <View className="px-5 py-3 flex-row items-center justify-between border-b border-gray-100">
                    <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-gray-50">
                        <Ionicons name="close" size={24} color="#1A1A1A" />
                    </Pressable>
                    <Text className="text-[18px] font-bold text-gray-900">Create Post</Text>
                    <Pressable
                        onPress={handleCreate}
                        disabled={loading}
                        className={`px-5 py-2 rounded-full ${loading ? "bg-gray-300" : "bg-[#6D28D9]"}`}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text className="text-white font-bold text-[14px]">Post</Text>
                        )}
                    </Pressable>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1"
                >
                    <ScrollView className="flex-1 px-5 pt-5" contentContainerStyle={{ paddingBottom: 100 }}>
                        {/* Category Selector */}
                        <Text className="text-[14px] font-bold text-gray-900 mb-3">Select Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6" contentContainerStyle={{ gap: 8 }}>
                            {FORUM_CATEGORIES.map((cat) => (
                                <Pressable
                                    key={cat.id}
                                    onPress={() => setCategory(cat.id)}
                                    className={`px-4 py-2 rounded-full border ${category === cat.id ? `${cat.bg} ${cat.border}` : "bg-white border-gray-200"}`}
                                >
                                    <Text className={`text-[13px] font-bold ${category === cat.id ? cat.text : "text-gray-600"}`}>
                                        {cat.label}
                                    </Text>
                                </Pressable>
                            ))}
                        </ScrollView>

                        {/* Inputs */}
                        <TextInput
                            className="text-[22px] font-bold text-gray-900 mb-4"
                            placeholder="Title"
                            placeholderTextColor="#9CA3AF"
                            value={title}
                            onChangeText={setTitle}
                            maxLength={100}
                        />

                        <TextInput
                            className="text-[16px] text-gray-700 leading-6 min-h-[150px]"
                            placeholder="What's on your mind?"
                            placeholderTextColor="#9CA3AF"
                            value={content}
                            onChangeText={setContent}
                            multiline
                            textAlignVertical="top"
                        />

                        {/* Image URL Input (Placeholder for Uploader) */}
                        <View className="mt-6">
                            <Text className="text-[14px] font-bold text-gray-900 mb-2">Image URL (Optional)</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-200 rounded-[12px] px-4 py-3 text-[14px] text-gray-900"
                                placeholder="https://example.com/image.jpg"
                                placeholderTextColor="#9CA3AF"
                                value={imageUrl}
                                onChangeText={setImageUrl}
                                autoCapitalize="none"
                            />
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}
