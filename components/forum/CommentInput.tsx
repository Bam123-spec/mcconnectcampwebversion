import React, { useState } from "react";
import { View, TextInput, Pressable, ActivityIndicator, Keyboard } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { addComment } from "@/lib/forumService";

interface CommentInputProps {
    postId: string;
    onCommentAdded: () => void;
}

export default function CommentInput({ postId, onCommentAdded }: CommentInputProps) {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!content.trim()) return;

        setLoading(true);
        Keyboard.dismiss();

        try {
            await addComment(postId, content);
            setContent("");
            onCommentAdded();
        } catch (error) {
            console.error("Failed to add comment:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-row items-center gap-3 p-4 bg-white border-t border-gray-100">
            <View className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 flex-row items-center">
                <TextInput
                    className="flex-1 text-[14px] text-gray-900"
                    placeholder="Add a comment..."
                    placeholderTextColor="#9CA3AF"
                    value={content}
                    onChangeText={setContent}
                    multiline
                    maxLength={500}
                />
            </View>

            <Pressable
                onPress={handleSend}
                disabled={loading || !content.trim()}
                className={`h-10 w-10 rounded-full items-center justify-center ${content.trim() ? "bg-[#6D28D9]" : "bg-gray-200"}`}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="white" />
                ) : (
                    <Ionicons name="send" size={18} color="white" />
                )}
            </Pressable>
        </View>
    );
}
