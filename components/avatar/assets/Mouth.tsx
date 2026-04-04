import React from "react";
import { Path, Circle, G } from "react-native-svg";

export const MOUTH_STYLES = ["neutral", "smile", "big_smile", "sad", "surprised", "tongue"];

export const Mouth = ({ type }: { type: string }) => {
    switch (type) {
        case "smile":
            return <Path d="M210 320 Q256 360 302 320" stroke="#000000" strokeWidth="12" strokeLinecap="round" fill="none" />;
        case "big_smile":
            return (
                <Path
                    d="M210 320 Q256 380 302 320 Z"
                    fill="#FFFFFF"
                    stroke="#000000"
                    strokeWidth="12"
                    strokeLinejoin="round"
                />
            );
        case "sad":
            return <Path d="M210 350 Q256 310 302 350" stroke="#000000" strokeWidth="12" strokeLinecap="round" fill="none" />;
        case "surprised":
            return <Circle cx="256" cy="340" r="20" fill="#000000" />;
        case "tongue":
            return (
                <G>
                    <Path d="M210 330 Q256 330 302 330" stroke="#000000" strokeWidth="12" strokeLinecap="round" />
                    <Path d="M236 330 Q236 370 256 370 Q276 370 276 330" fill="#FF6B6B" stroke="#000000" strokeWidth="8" />
                </G>
            );
        default: // neutral
            return <Path d="M220 340 L292 340" stroke="#000000" strokeWidth="12" strokeLinecap="round" />;
    }
};
