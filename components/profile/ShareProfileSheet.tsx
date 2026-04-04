import React from "react";
import { View, Text, Pressable, Modal, TouchableWithoutFeedback, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { MotiView } from "moti";
import * as Linking from "expo-linking";

interface ShareProfileSheetProps {
    visible: boolean;
    onClose: () => void;
    userId: string;
}

export default function ShareProfileSheet({ visible, onClose, userId }: ShareProfileSheetProps) {
    const profileLink = Linking.createURL(`profile/${userId}`);

    const handleCopyLink = () => {
        // In a real app with expo-clipboard:
        // await Clipboard.setStringAsync(profileLink);
        Alert.alert("Link Copied", `Profile link copied to clipboard: ${profileLink}`);
        onClose();
    };

    const handleScanNearby = () => {
        Alert.alert("Scan Nearby", "Searching for nearby students...");
        // Implement nearby scanning logic here
    };

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View className="flex-1 bg-black/40 justify-end">
                    <TouchableWithoutFeedback>
                        <MotiView
                            from={{ translateY: 300, opacity: 0 }}
                            animate={{ translateY: 0, opacity: 1 }}
                            transition={{ type: "spring", damping: 20 }}
                            className="bg-white rounded-t-[30px] p-6 pb-10"
                        >
                            {/* Handle Bar */}
                            <View className="items-center mb-6">
                                <View className="w-12 h-1.5 bg-gray-200 rounded-full" />
                            </View>

                            <Text className="text-[20px] font-bold text-gray-900 text-center mb-2">
                                Share Profile
                            </Text>
                            <Text className="text-[14px] text-gray-500 text-center mb-8 px-8">
                                Share your profile with other students to connect and chat.
                            </Text>

                            {/* QR Code */}
                            <View className="items-center mb-8">
                                <View className="p-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                    <QRCode value={profileLink} size={180} />
                                </View>
                            </View>

                            {/* Actions */}
                            <View className="flex-row gap-4">
                                <Pressable
                                    onPress={handleScanNearby}
                                    className="flex-1 bg-purple-50 p-4 rounded-2xl items-center gap-2"
                                >
                                    <View className="h-10 w-10 bg-white rounded-full items-center justify-center shadow-sm">
                                        <Ionicons name="radio-outline" size={20} color="#6D28D9" />
                                    </View>
                                    <Text className="text-[13px] font-bold text-gray-900">Scan Nearby</Text>
                                </Pressable>

                                <Pressable
                                    onPress={handleCopyLink}
                                    className="flex-1 bg-gray-50 p-4 rounded-2xl items-center gap-2"
                                >
                                    <View className="h-10 w-10 bg-white rounded-full items-center justify-center shadow-sm">
                                        <Ionicons name="link-outline" size={20} color="#374151" />
                                    </View>
                                    <Text className="text-[13px] font-bold text-gray-900">Copy Link</Text>
                                </Pressable>
                            </View>

                            {/* Close Button */}
                            <Pressable
                                onPress={onClose}
                                className="mt-6 py-3 items-center"
                            >
                                <Text className="text-[15px] font-bold text-gray-500">Close</Text>
                            </Pressable>
                        </MotiView>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}
