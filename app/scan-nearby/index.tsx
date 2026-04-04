import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, Share, Platform, Alert, ScrollView, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import QRCode from "react-native-qrcode-svg";
import { CameraView, useCameraPermissions } from 'expo-camera';
import { supabase } from "@/lib/supabase";
import { Profile } from "@/types/database";
import { MotiView } from "moti";
import { useNearbyDiscovery } from "@/hooks/useNearbyDiscovery";
import { ScanNearbyService } from "@/lib/ScanNearbyService";

export default function ScanNearbyScreen() {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const [mode, setMode] = useState<'share' | 'scan_qr'>('share');
    const [currentUser, setCurrentUser] = useState<Profile | null>(null);

    // Zeroconf Hook
    const { nearbyUsers, isScanning, startDiscovery, stopDiscovery, isExpoGo } = useNearbyDiscovery(currentUser);

    useEffect(() => {
        fetchCurrentUser();
        return () => {
            stopDiscovery();
        };
    }, []);

    // Start discovery once user is loaded
    useEffect(() => {
        if (currentUser) {
            startDiscovery();
        }
    }, [currentUser]);

    const fetchCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
            setCurrentUser(data);
        }
    };

    // --- Native Share Logic ---
    const handleNativeShare = async () => {
        if (!currentUser) return;

        const profileLink = ScanNearbyService.generateQRData(currentUser);
        const message = `Connect with me on Connect Camp! ${profileLink}`;

        try {
            const result = await Share.share({
                message: message,
                url: profileLink, // iOS
                title: "Connect with me", // Android
            });
        } catch (error: any) {
            Alert.alert(error.message);
        }
    };

    // --- QR Scanning Logic ---
    const handleBarCodeScanned = ({ type, data }: { type: string, data: string }) => {
        const userId = ScanNearbyService.parseQRData(data);
        if (userId) {
            router.push(`/profile/${userId}`);
        }
    };

    if (!permission) {
        // Camera permissions are still loading.
        return <View className="flex-1 bg-gray-900" />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View className="flex-1 justify-center items-center bg-gray-900 px-5">
                <Text className="text-white mb-4 text-center">We need your permission to show the camera for QR scanning.</Text>
                <Pressable onPress={requestPermission} className="bg-[#6D28D9] px-6 py-3 rounded-full">
                    <Text className="text-white font-bold">Grant Permission</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-900">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Background Gradient */}
            <LinearGradient
                colors={['#1F2937', '#111827']}
                className="absolute inset-0"
            />

            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="px-5 py-4 flex-row items-center justify-between">
                    <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-white/10">
                        <Ionicons name="close" size={24} color="white" />
                    </Pressable>
                    <Text className="text-white font-bold text-[18px]">Scan Nearby</Text>
                    <View className="w-10" />
                </View>

                <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>

                    {/* 1. Radar / Native Share Section */}
                    <View className="items-center mt-4 mb-10">
                        <View className="h-[200px] w-[200px] items-center justify-center relative">
                            {/* Radar Rings */}
                            {[0, 1, 2].map((i) => (
                                <MotiView
                                    key={i}
                                    from={{ opacity: 0.5, scale: 0.5 }}
                                    animate={{ opacity: 0, scale: 1.5 }}
                                    transition={{
                                        type: 'timing',
                                        duration: 2000,
                                        loop: true,
                                        delay: i * 600,
                                        repeatReverse: false
                                    }}
                                    className="absolute h-full w-full rounded-full border border-[#6D28D9] bg-[#6D28D9]/10"
                                />
                            ))}

                            {/* Center Icon */}
                            <View className="h-20 w-20 bg-[#6D28D9] rounded-full items-center justify-center shadow-lg shadow-purple-500/50 z-10">
                                <Ionicons name="radio-outline" size={40} color="white" />
                            </View>
                        </View>

                        <Text className="text-white text-[24px] font-bold mt-6 mb-2">Looking for students...</Text>
                        <Text className="text-gray-400 text-center px-10 mb-8">
                            Use AirDrop or Nearby Share for the fastest connection.
                        </Text>

                        <Pressable
                            onPress={handleNativeShare}
                            className="flex-row items-center gap-2 bg-white px-6 py-3 rounded-full shadow-lg"
                        >
                            <Ionicons name="share-outline" size={20} color="#6D28D9" />
                            <Text className="text-[#6D28D9] font-bold text-[16px]">
                                {Platform.OS === 'ios' ? 'Fast Connect (AirDrop)' : 'Fast Connect (Nearby Share)'}
                            </Text>
                        </Pressable>
                    </View>

                    {/* 2. Students Nearby List (Zeroconf) */}
                    <View className="px-5 mb-8">
                        <Text className="text-gray-500 font-bold text-[13px] uppercase tracking-wider mb-4">
                            Students Nearby {isExpoGo ? "(Not supported in Expo Go)" : (isScanning ? "(Scanning...)" : "(Paused)")}
                        </Text>

                        {isExpoGo && (
                            <View className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl mb-4">
                                <Text className="text-yellow-500 text-[13px] text-center">
                                    Nearby discovery requires a development build. Use the QR code scanner below instead.
                                </Text>
                            </View>
                        )}

                        {nearbyUsers.length > 0 ? (
                            nearbyUsers.map(user => (
                                <Pressable
                                    key={user.id}
                                    onPress={() => router.push(`/profile/${user.id}`)}
                                    className="flex-row items-center gap-3 bg-white/5 p-3 rounded-xl mb-2 border border-white/10"
                                >
                                    <View className="h-10 w-10 rounded-full bg-gray-700 overflow-hidden border border-white/20">
                                        {user.avatar_url ? (
                                            <Image source={{ uri: user.avatar_url }} className="h-full w-full" />
                                        ) : (
                                            <View className="h-full w-full items-center justify-center bg-gray-600">
                                                <Ionicons name="person" size={20} color="#9CA3AF" />
                                            </View>
                                        )}
                                    </View>
                                    <View>
                                        <Text className="text-white font-bold">{user.full_name}</Text>
                                        <Text className="text-gray-400 text-[12px]">@{user.username}</Text>
                                    </View>
                                    <View className="flex-1 items-end">
                                        <Ionicons name="chevron-forward" size={20} color="gray" />
                                    </View>
                                </Pressable>
                            ))
                        ) : (
                            <View className="bg-white/5 p-4 rounded-xl border border-dashed border-white/10 items-center">
                                <Text className="text-gray-500 text-[13px]">No students detected nearby yet.</Text>
                            </View>
                        )}
                    </View>

                    {/* 3. QR Code Section */}
                    <View className="mx-5 bg-white rounded-[24px] p-6 items-center shadow-lg">
                        <View className="flex-row bg-gray-100 p-1 rounded-lg mb-6 w-full">
                            <Pressable
                                onPress={() => setMode('share')}
                                className={`flex-1 py-2 items-center rounded-md ${mode === 'share' ? 'bg-white shadow-sm' : ''}`}
                            >
                                <Text className={`font-bold ${mode === 'share' ? 'text-gray-900' : 'text-gray-500'}`}>My Code</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => setMode('scan_qr')}
                                className={`flex-1 py-2 items-center rounded-md ${mode === 'scan_qr' ? 'bg-white' : ''}`}
                                style={mode === 'scan_qr' ? { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 } : {}}
                            >
                                <Text className={`font-bold ${mode === 'scan_qr' ? 'text-gray-900' : 'text-gray-500'}`}>Scan QR</Text>
                            </Pressable>
                        </View>

                        {mode === 'share' ? (
                            <View className="items-center">
                                <View className="p-4 bg-white rounded-[20px] shadow-sm border border-gray-100 mb-4">
                                    {currentUser ? (
                                        <QRCode
                                            value={ScanNearbyService.generateQRData(currentUser)}
                                            size={180}
                                            color="#1A1A1A"
                                            backgroundColor="white"
                                        />
                                    ) : (
                                        <ActivityIndicator size="large" color="#6D28D9" />
                                    )}
                                </View>
                                <Text className="text-gray-500 text-center text-[13px]">
                                    Let others scan this to view your profile.
                                </Text>
                            </View>
                        ) : (
                            <View className="h-[250px] w-full rounded-[20px] overflow-hidden bg-black relative">
                                <CameraView
                                    style={{ flex: 1 }}
                                    facing="back"
                                    onBarcodeScanned={handleBarCodeScanned}
                                />
                                <View className="absolute inset-0 border-[40px] border-black/50 items-center justify-center">
                                    <View className="h-[160px] w-[160px] border-2 border-white/50 rounded-[20px]" />
                                </View>
                            </View>
                        )}
                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
