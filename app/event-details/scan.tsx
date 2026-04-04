import React from "react";
import { Stack } from "expo-router";
import QRScanner from "@/components/events/QRScanner";

export default function ScanScreen() {
    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: "Scan Ticket",
                    headerTintColor: "white",
                    headerStyle: { backgroundColor: "black" },
                }}
            />
            <QRScanner />
        </>
    );
}
