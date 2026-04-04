import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button, Alert } from "react-native";
import { CameraView, Camera } from "expo-camera";
import { supabase } from "@/lib/supabase";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";

export default function QRScanner() {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);
    const [scanResult, setScanResult] = useState<{ success: boolean; message: string; user_name?: string } | null>(null);

    useEffect(() => {
        const getCameraPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
        };

        getCameraPermissions();
    }, []);

    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        setScanned(true);
        try {
            const payload = JSON.parse(data);

            if (!payload.event_id || !payload.qr_secret) {
                throw new Error("Invalid QR Code format");
            }

            const { data: result, error } = await supabase.rpc("verify_event_attendance", {
                p_event_id: payload.event_id,
                p_secret: payload.qr_secret,
            });

            if (error) throw error;

            setScanResult(result);
        } catch (error: any) {
            console.error("Scan Error:", error);
            setScanResult({ success: false, message: error.message || "Invalid QR Code" });
        }
    };

    if (hasPermission === null) {
        return <Text>Requesting for camera permission</Text>;
    }
    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
    }

    return (
        <View className="flex-1 bg-black">
            {!scanned ? (
                <View className="flex-1">
                    <CameraView
                        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                        style={StyleSheet.absoluteFillObject}
                        barcodeScannerSettings={{
                            barcodeTypes: ["qr"],
                        }}
                    />

                    {/* Dark Overlay */}
                    <View style={StyleSheet.absoluteFill}>
                        <View className="flex-1 bg-black/60" />
                        <View className="flex-row h-[280px]">
                            <View className="flex-1 bg-black/60" />
                            <View className="w-[280px] h-[280px] relative overflow-hidden">
                                {/* Corner Markers */}
                                <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl" />
                                <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl" />
                                <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl" />
                                <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl" />

                                {/* Scanning Animation */}
                                <MotiView
                                    from={{ translateX: -10 }}
                                    animate={{ translateX: 280 }}
                                    transition={{
                                        loop: true,
                                        type: 'timing',
                                        duration: 2500,
                                        repeatReverse: false
                                    }}
                                    className="absolute top-0 bottom-0 w-[2px] bg-green-500 shadow-lg shadow-green-500"
                                >
                                    <View className="absolute top-1/2 -mt-1.5 -ml-1.5 w-4 h-4 rounded-full bg-green-400 border-2 border-white shadow-lg shadow-green-500" />
                                </MotiView>
                            </View>
                            <View className="flex-1 bg-black/60" />
                        </View>
                        <View className="flex-1 bg-black/60 items-center pt-10">
                            <Text className="text-white/90 text-[16px] font-medium bg-black/40 px-6 py-3 rounded-full overflow-hidden border border-white/10">
                                Align QR code within the frame
                            </Text>
                        </View>
                    </View>
                </View>
            ) : (
                <View className="flex-1 items-center justify-center p-6">
                    {scanResult?.success ? (
                        <MotiView
                            from={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="items-center"
                        >
                            <View className="h-24 w-24 bg-green-100 rounded-full items-center justify-center mb-6">
                                <Ionicons name="checkmark" size={48} color="#16A34A" />
                            </View>
                            <Text className="text-white text-[24px] font-bold mb-2">Check-in Successful!</Text>
                            <Text className="text-gray-400 text-[16px] mb-8">Welcome, {scanResult.user_name}!</Text>
                        </MotiView>
                    ) : (
                        <MotiView
                            from={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="items-center"
                        >
                            <View className="h-24 w-24 bg-red-100 rounded-full items-center justify-center mb-6">
                                <Ionicons name="close" size={48} color="#DC2626" />
                            </View>
                            <Text className="text-white text-[24px] font-bold mb-2">Check-in Failed</Text>
                            <Text className="text-gray-400 text-[16px] mb-8">{scanResult?.message}</Text>
                        </MotiView>
                    )}

                    <Button title="Scan Again" onPress={() => { setScanned(false); setScanResult(null); }} color="#6D28D9" />
                </View>
            )}
        </View>
    );
}
