import React from "react";
import { View, Text, Modal, Pressable } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { cssInterop } from "nativewind";

cssInterop(MotiView, { className: "style" });

type QRModalProps = {
    visible: boolean;
    onClose: () => void;
    qrData: string;
    eventName: string;
};

export default function QRModal({ visible, onClose, qrData, eventName }: QRModalProps) {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 bg-black/60 items-center justify-center p-6">
                <MotiView
                    from={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring" }}
                    className="bg-white w-full rounded-[32px] p-8 items-center shadow-2xl"
                >
                    <Pressable onPress={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full">
                        <Ionicons name="close" size={20} color="#1A1A1A" />
                    </Pressable>

                    <Text className="text-[20px] font-bold text-[#1A1A1A] mb-2 text-center">{eventName}</Text>
                    <Text className="text-[14px] text-[#7A7A7A] mb-8 text-center">Show this code at the entrance</Text>

                    <View className="p-4 bg-white rounded-[24px] shadow-sm border border-[#F0F0F0] mb-6">
                        <QRCode value={qrData} size={200} />
                    </View>

                    <View className="flex-row items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-100">
                        <View className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <Text className="text-[12px] font-bold text-green-700">Ticket Active</Text>
                    </View>
                </MotiView>
            </View>
        </Modal>
    );
}
