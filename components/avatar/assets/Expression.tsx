import React from "react";
import { Path, Circle, G } from "react-native-svg";

export const EXPRESSIONS = ["neutral", "smile", "laugh", "sad", "surprised", "wink"];

export const Expression = ({ type }: { type: string }) => {
    const Eyes = () => {
        switch (type) {
            case "wink":
                return (
                    <G>
                        <Circle cx="55" cy="75" r="3" fill="#333" />
                        <Path d="M80 75 L90 75" stroke="#333" strokeWidth="2" />
                    </G>
                );
            case "laugh":
                return (
                    <G>
                        <Path d="M50 75 Q55 70 60 75" stroke="#333" strokeWidth="2" fill="none" />
                        <Path d="M80 75 Q85 70 90 75" stroke="#333" strokeWidth="2" fill="none" />
                    </G>
                );
            case "sad":
                return (
                    <G>
                        <Circle cx="55" cy="75" r="3" fill="#333" />
                        <Circle cx="85" cy="75" r="3" fill="#333" />
                        {/* Eyebrows */}
                        <Path d="M50 68 L60 65" stroke="#333" strokeWidth="1" />
                        <Path d="M90 68 L80 65" stroke="#333" strokeWidth="1" />
                    </G>
                );
            default: // neutral, smile, surprised
                return (
                    <G>
                        <Circle cx="55" cy="75" r="3" fill="#333" />
                        <Circle cx="85" cy="75" r="3" fill="#333" />
                    </G>
                );
        }
    };

    const Mouth = () => {
        switch (type) {
            case "smile":
                return <Path d="M55 95 Q70 105 85 95" stroke="#333" strokeWidth="2" fill="none" />;
            case "laugh":
                return <Path d="M55 95 Q70 110 85 95 Z" fill="#333" />;
            case "sad":
                return <Path d="M55 100 Q70 90 85 100" stroke="#333" strokeWidth="2" fill="none" />;
            case "surprised":
                return <Circle cx="70" cy="98" r="5" fill="#333" />;
            default: // neutral
                return <Path d="M60 98 L80 98" stroke="#333" strokeWidth="2" />;
        }
    };

    return (
        <G>
            <Eyes />
            <Mouth />
        </G>
    );
};
