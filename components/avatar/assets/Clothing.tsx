import React from "react";
import { Path, G } from "react-native-svg";

export const CLOTHING_STYLES = ["tshirt", "hoodie", "jacket", "suit", "sweater"];

export const Clothing = ({ type, color = "#3B82F6" }: { type: string, color?: string }) => {
    switch (type) {
        case "hoodie":
            return (
                <G>
                    {/* Body */}
                    <Path
                        d="M100 450 Q100 420 150 420 L362 420 Q412 420 412 450 L412 512 L100 512 Z"
                        fill={color}
                        stroke="#000000"
                        strokeWidth="12"
                    />
                    {/* Hood Detail */}
                    <Path
                        d="M150 420 Q256 500 362 420"
                        fill="none"
                        stroke="#000000"
                        strokeWidth="12"
                        strokeLinecap="round"
                    />
                </G>
            );
        case "jacket":
            return (
                <G>
                    <Path
                        d="M100 450 Q100 420 150 420 L362 420 Q412 420 412 450 L412 512 L100 512 Z"
                        fill={color}
                        stroke="#000000"
                        strokeWidth="12"
                    />
                    {/* Zipper/Open */}
                    <Path d="M256 420 L256 512" stroke="#000000" strokeWidth="12" />
                    <Path d="M256 420 L220 450" stroke="#000000" strokeWidth="8" />
                    <Path d="M256 420 L292 450" stroke="#000000" strokeWidth="8" />
                </G>
            );
        case "suit":
            return (
                <G>
                    <Path
                        d="M100 450 Q100 420 150 420 L362 420 Q412 420 412 450 L412 512 L100 512 Z"
                        fill="#1F2937"
                        stroke="#000000"
                        strokeWidth="12"
                    />
                    {/* White Shirt Triangle */}
                    <Path d="M256 420 L220 512 L292 512 Z" fill="#FFFFFF" />
                    {/* Tie */}
                    <Path d="M256 420 L246 512 L266 512 Z" fill="#EF4444" />
                </G>
            );
        default: // tshirt
            return (
                <G>
                    <Path
                        d="M100 450 Q100 420 150 420 L362 420 Q412 420 412 450 L412 512 L100 512 Z"
                        fill={color}
                        stroke="#000000"
                        strokeWidth="12"
                    />
                    {/* Neckline */}
                    <Path
                        d="M180 420 Q256 460 332 420"
                        fill="none"
                        stroke="#000000"
                        strokeWidth="12"
                        strokeLinecap="round"
                    />
                </G>
            );
    }
};
