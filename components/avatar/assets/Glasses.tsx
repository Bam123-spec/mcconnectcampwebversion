import React from "react";
import { Path, Circle, G, Rect } from "react-native-svg";

export const GLASSES_STYLES = ["none", "round", "square", "sunglasses", "cat_eye"];

export const Glasses = ({ type }: { type: string }) => {
    switch (type) {
        case "round":
            return (
                <G>
                    <Circle cx="200" cy="240" r="45" stroke="#333" strokeWidth="8" fill="rgba(255,255,255,0.2)" />
                    <Circle cx="312" cy="240" r="45" stroke="#333" strokeWidth="8" fill="rgba(255,255,255,0.2)" />
                    <Path d="M245 240 L267 240" stroke="#333" strokeWidth="8" />
                </G>
            );
        case "square":
            return (
                <G>
                    <Rect x="155" y="200" width="90" height="80" rx="10" stroke="#333" strokeWidth="8" fill="rgba(255,255,255,0.2)" />
                    <Rect x="267" y="200" width="90" height="80" rx="10" stroke="#333" strokeWidth="8" fill="rgba(255,255,255,0.2)" />
                    <Path d="M245 240 L267 240" stroke="#333" strokeWidth="8" />
                </G>
            );
        case "sunglasses":
            return (
                <G>
                    <Path d="M150 210 L250 210 L250 260 Q200 280 150 260 Z" fill="#111" stroke="#000" strokeWidth="4" />
                    <Path d="M262 210 L362 210 L362 260 Q312 280 262 260 Z" fill="#111" stroke="#000" strokeWidth="4" />
                    <Path d="M250 220 L262 220" stroke="#111" strokeWidth="8" />
                </G>
            );
        default:
            return null;
    }
};
