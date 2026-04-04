import React from "react";
import { Path, Circle, G } from "react-native-svg";

export const EYE_STYLES = ["neutral", "happy", "wink", "surprised", "angry", "sleepy", "hearts"];

export const Eyes = ({ type }: { type: string }) => {
    switch (type) {
        case "happy":
            return (
                <G>
                    <Path d="M180 240 Q210 210 240 240" stroke="#000000" strokeWidth="12" strokeLinecap="round" fill="none" />
                    <Path d="M272 240 Q302 210 332 240" stroke="#000000" strokeWidth="12" strokeLinecap="round" fill="none" />
                </G>
            );
        case "wink":
            return (
                <G>
                    <Circle cx="210" cy="240" r="25" fill="#000000" />
                    <Path d="M272 240 Q302 210 332 240" stroke="#000000" strokeWidth="12" strokeLinecap="round" fill="none" />
                </G>
            );
        case "surprised":
            return (
                <G>
                    <Circle cx="210" cy="240" r="30" fill="#000000" />
                    <Circle cx="302" cy="240" r="30" fill="#000000" />
                    <Circle cx="215" cy="235" r="10" fill="#FFFFFF" />
                    <Circle cx="307" cy="235" r="10" fill="#FFFFFF" />
                </G>
            );
        case "angry":
            return (
                <G>
                    <Path d="M180 220 L240 240" stroke="#000000" strokeWidth="12" strokeLinecap="round" />
                    <Path d="M332 220 L272 240" stroke="#000000" strokeWidth="12" strokeLinecap="round" />
                    <Circle cx="210" cy="250" r="20" fill="#000000" />
                    <Circle cx="302" cy="250" r="20" fill="#000000" />
                </G>
            );
        case "sleepy":
            return (
                <G>
                    <Path d="M180 240 L240 240" stroke="#000000" strokeWidth="12" strokeLinecap="round" />
                    <Path d="M272 240 L332 240" stroke="#000000" strokeWidth="12" strokeLinecap="round" />
                </G>
            );
        default: // neutral
            return (
                <G>
                    <Circle cx="210" cy="240" r="25" fill="#000000" />
                    <Circle cx="302" cy="240" r="25" fill="#000000" />
                    <Circle cx="218" cy="232" r="8" fill="#FFFFFF" />
                    <Circle cx="310" cy="232" r="8" fill="#FFFFFF" />
                </G>
            );
    }
};
