import React from "react";
import { Path, Circle } from "react-native-svg";

export const SKIN_TONES = [
    "#FFDFC4", // Lightest
    "#F0D5BE",
    "#E8CDAA",
    "#D7B297",
    "#C69C7E",
    "#A87F64",
    "#8D5524",
    "#5E3C24", // Darkest
    "#FFEDB4", // Yellowish
    "#E0AC69", // Tan
];

export const SkinLayer = ({ tone }: { tone: string }) => {
    // Standard face shape base
    return (
        <React.Fragment>
            {/* Neck */}
            <Path
                d="M50 110 L50 140 L90 140 L90 110 Z"
                fill={tone}
                stroke="none"
            />
            {/* Head Base */}
            <Circle cx="70" cy="70" r="35" fill={tone} />
            {/* Jaw/Chin adjustment to make it less perfectly round if needed, but circle is a good base style */}
            <Path
                d="M40 60 Q70 120 100 60"
                fill={tone}
            />
            {/* Ears */}
            <Circle cx="35" cy="75" r="6" fill={tone} />
            <Circle cx="105" cy="75" r="6" fill={tone} />
        </React.Fragment>
    );
};
