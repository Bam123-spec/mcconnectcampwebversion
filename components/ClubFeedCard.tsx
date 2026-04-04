import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { cssInterop } from "nativewind";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";

// Enable className for MotiView
cssInterop(MotiView, { className: "style" });

type ClubFeedCardProps = {
    post: any; // Using any for now to handle joined data structure, will refine type
    delay?: number;
};

export default function ClubFeedCard({ post, delay = 0 }: ClubFeedCardProps) {
    const { darkMode, theme: currentTheme } = useTheme();
    const router = useRouter();
    const club = post.clubs;
    const isMember = post.is_member; // We'll need to pass this or derive it

    return (
        <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", delay }}
            className="bg-white rounded-[24px] p-4 mb-4 shadow-sm shadow-black/5 border border-[#F0F0F0]"
        >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-3">
                <Pressable
                    onPress={() => router.push(`/clubs/${club.id}`)}
                    className="flex-row items-center gap-3"
                >
                    <View style={{ backgroundColor: darkMode ? currentTheme.bg : "#F3F4F6", borderColor: currentTheme.border }} className="h-10 w-10 rounded-full overflow-hidden border">
                        {club.cover_image_url ? (
                            <Image source={{ uri: club.cover_image_url }} className="h-full w-full" resizeMode="cover" />
                        ) : (
                            <View style={{ backgroundColor: darkMode ? currentTheme.bg : "#F3E8FF" }} className="h-full w-full items-center justify-center">
                                <Text style={{ color: currentTheme.primary }} className="text-[16px] font-h1">{club.name.charAt(0)}</Text>
                            </View>
                        )}
                    </View>
                    <View>
                        <Text style={{ color: currentTheme.text }} className="text-[14px] font-button">{club.name}</Text>
                        <Text style={{ color: currentTheme.textLight }} className="text-[11px] font-metadata">{new Date(post.created_at).toLocaleDateString()}</Text>
                    </View>
                </Pressable>

                {isMember ? (
                    <View style={{ backgroundColor: darkMode ? currentTheme.surfaceSelected : "#F3E8FF", borderColor: darkMode ? currentTheme.bg : "#E9E3FF" }} className="px-2.5 py-1 rounded-full border">
                        <Text style={{ color: currentTheme.primary }} className="text-[10px] font-button">Member</Text>
                    </View>
                ) : (
                    <Pressable style={{ backgroundColor: currentTheme.primary }} className="px-3 py-1.5 rounded-full shadow-sm">
                        <Text style={{ color: darkMode ? currentTheme.bg : "white" }} className="text-[11px] font-button">Join Club</Text>
                    </Pressable>
                )}
            </View>

            {/* Content */}
            <Text style={{ color: currentTheme.text }} className="text-[14px] font-body leading-5 mb-3">{post.text}</Text>

            {/* Optional Image */}
            {post.image_url && (
                <View style={{ backgroundColor: darkMode ? currentTheme.bg : "#F3F4F6" }} className="h-[200px] w-full rounded-[16px] overflow-hidden mb-3">
                    <Image source={{ uri: post.image_url }} className="h-full w-full" resizeMode="cover" />
                </View>
            )}

            {/* Stats Row */}
            <View style={{ borderTopColor: currentTheme.border }} className="flex-row items-center gap-6 pt-2 border-t">
                <Pressable className="flex-row items-center gap-1.5">
                    <Ionicons name="heart-outline" size={18} color={currentTheme.textLight} />
                    <Text style={{ color: currentTheme.textLight }} className="text-[12px] font-metadata">{post.likes_count || 0}</Text>
                </Pressable>
                <Pressable className="flex-row items-center gap-1.5">
                    <Ionicons name="chatbubble-outline" size={18} color={currentTheme.textLight} />
                    <Text style={{ color: currentTheme.textLight }} className="text-[12px] font-metadata">{post.comments_count || 0}</Text>
                </Pressable>
                <Pressable className="ml-auto">
                    <Ionicons name="share-outline" size={18} color={currentTheme.textLight} />
                </Pressable>
            </View>
        </MotiView>
    );
}
