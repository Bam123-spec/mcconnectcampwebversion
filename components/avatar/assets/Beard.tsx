import React from "react";
import { Path } from "react-native-svg";

export const BEARD_STYLES = ["none", "stubble", "full", "goatee", "mustache"];

export const Beard = ({ type, color }: { type: string, color: string }) => {
    switch (type) {
        case "stubble":
            return (
                <Path
                    d="M140 300 Q256 450 372 300 L372 320 Q256 480 140 320 Z"
                    fill={color}
                    opacity={0.3}
                />
            );
        case "full":
            return (
                <Path
                    d="M130 280 Q130 460 256 460 Q382 460 382 280 L360 280 Q360 400 256 400 Q152 400 152 280 Z"
                    fill={color}
                    stroke="#000000"
                    strokeWidth="12"
                />
            );
        case "goatee":
            return (
                <Path
                    d="M220 380 Q256 430 292 380 L292 400 Q256 450 220 400 Z"
                    fill={color}
                    stroke="#000000"
                    strokeWidth="12"
                />
            );
        case "mustache":
            return (
                <Path
                    d="M190 330 Q256 300 322 330 L322 350 Q256 320 190 350 Z"
                    fill={color}
                    stroke="#000000"
                    strokeWidth="12"
                />
            );
        default:
            return null;
    }
};
