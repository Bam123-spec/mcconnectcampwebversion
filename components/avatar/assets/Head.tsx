import React from "react";
import { Path, G } from "react-native-svg";

export const Head = ({ tone }: { tone: string }) => {
    return (
        <G>
            {/* Neck */}
            <Path
                d="M200 400 L200 480 L312 480 L312 400 Z"
                fill={tone}
                stroke="#000000"
                strokeWidth="12"
                strokeLinejoin="round"
            />
            {/* Head Shape - Squarish Circle */}
            <Path
                d="M130 150 Q130 80 256 80 Q382 80 382 150 L382 320 Q382 420 256 420 Q130 420 130 320 Z"
                fill={tone}
                stroke="#000000"
                strokeWidth="12"
                strokeLinejoin="round"
            />
            {/* Ear Left */}
            <Path
                d="M130 250 Q100 250 100 280 Q100 310 130 310"
                fill={tone}
                stroke="#000000"
                strokeWidth="12"
                strokeLinecap="round"
            />
            {/* Ear Right */}
            <Path
                d="M382 250 Q412 250 412 280 Q412 310 382 310"
                fill={tone}
                stroke="#000000"
                strokeWidth="12"
                strokeLinecap="round"
            />
        </G>
    );
};
