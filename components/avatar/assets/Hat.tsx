import React from "react";
import { Path, G } from "react-native-svg";

export const HAT_STYLES = ["none", "cap", "beanie", "bucket_hat", "bandana"];

export const Hat = ({ type }: { type: string }) => {
    switch (type) {
        case "cap":
            return (
                <G>
                    <Path d="M130 150 Q256 50 382 150" stroke="#EF4444" strokeWidth="60" fill="none" />
                    <Path d="M120 150 L400 150 L400 170 L120 170 Z" fill="#EF4444" stroke="#000" strokeWidth="8" />
                </G>
            );
        case "beanie":
            return (
                <Path
                    d="M130 180 Q130 60 256 60 Q382 60 382 180 Z"
                    fill="#3B82F6"
                    stroke="#000"
                    strokeWidth="12"
                />
            );
        case "bucket_hat":
            return (
                <G>
                    <Path d="M150 120 L362 120 L370 180 L142 180 Z" fill="#F59E0B" stroke="#000" strokeWidth="8" />
                    <Path d="M110 180 L402 180 L420 220 L92 220 Z" fill="#F59E0B" stroke="#000" strokeWidth="8" />
                </G>
            );
        default:
            return null;
    }
};
