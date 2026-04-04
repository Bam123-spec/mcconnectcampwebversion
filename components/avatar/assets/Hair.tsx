import React from "react";
import { Path, Circle, G } from "react-native-svg";

export const HAIR_STYLES = [
    "bald", "short_flat", "afro", "bob", "long_straight", "spiky", "bun", "side_part"
];

export const HAIR_COLORS = [
    "#090909", "#3B2219", "#714B34", "#B58158", "#E6BE8A",
    "#A53900", "#9A9A9A", "#FFFFFF", "#5B21B6", "#1E40AF"
];

export const Hair = ({ style, color }: { style: string, color: string }) => {
    switch (style) {
        case "bald":
            return null;
        case "afro":
            return (
                <Circle cx="256" cy="200" r="140" fill={color} stroke="#000000" strokeWidth="12" />
            );
        case "bob":
            return (
                <Path
                    d="M130 150 Q130 50 256 50 Q382 50 382 150 L382 380 L360 380 L360 150 Q256 150 152 150 L152 380 L130 380 Z"
                    fill={color}
                    stroke="#000000"
                    strokeWidth="12"
                    strokeLinejoin="round"
                />
            );
        case "spiky":
            return (
                <Path
                    d="M130 200 L160 80 L200 160 L240 60 L280 160 L320 80 L350 160 L382 200 Q382 100 256 100 Q130 100 130 200 Z"
                    fill={color}
                    stroke="#000000"
                    strokeWidth="12"
                    strokeLinejoin="round"
                />
            );
        case "bun":
            return (
                <G>
                    <Circle cx="256" cy="60" r="50" fill={color} stroke="#000000" strokeWidth="12" />
                    <Path d="M130 200 Q130 100 256 100 Q382 100 382 200 L382 180 Q382 120 256 120 Q130 120 130 180 Z" fill={color} stroke="#000000" strokeWidth="12" />
                </G>
            );
        case "side_part":
            return (
                <Path
                    d="M130 200 Q130 80 256 80 Q382 80 382 200 L382 180 Q382 100 256 100 Q130 100 130 180 Z"
                    fill={color}
                    stroke="#000000"
                    strokeWidth="12"
                />
            );
        default: // short_flat
            return (
                <Path
                    d="M130 220 Q130 80 256 80 Q382 80 382 220 L382 180 Q382 100 256 100 Q130 100 130 180 Z"
                    fill={color}
                    stroke="#000000"
                    strokeWidth="12"
                />
            );
    }
};
