import React from "react";
import Svg, { Defs, ClipPath, Circle, G } from "react-native-svg";
import { View } from "react-native";

import { Background } from "./assets/Background";
import { Head } from "./assets/Head";
import { Clothing } from "./assets/Clothing";
import { Hair } from "./assets/Hair";
import { Eyes } from "./assets/Eyes";
import { Mouth } from "./assets/Mouth";
import { Beard } from "./assets/Beard";
import { Glasses } from "./assets/Glasses";
import { Hat } from "./assets/Hat";

export interface AvatarConfig {
    skin?: string;
    hairStyle?: string;
    hairColor?: string;
    beard?: string;
    glasses?: string;
    hat?: string;
    eyes?: string;
    mouth?: string;
    clothing?: string;
    clothingColor?: string;
    background?: string;
    // Legacy mapping
    expression?: string;
}

interface AvatarRendererProps {
    config: AvatarConfig;
    size?: number;
}

export default function AvatarRenderer({ config, size = 100 }: AvatarRendererProps) {
    // Default config if missing
    const safeConfig = {
        skin: config.skin || "#E8CDAA",
        hairStyle: config.hairStyle || "short_flat",
        hairColor: config.hairColor || "#090909",
        beard: config.beard || "none",
        glasses: config.glasses || "none",
        hat: config.hat || "none",
        eyes: config.eyes || "neutral",
        mouth: config.mouth || "neutral",
        clothing: config.clothing || "tshirt",
        clothingColor: config.clothingColor || "#3B82F6",
        background: config.background || "solid_gray",
    };

    // Legacy expression mapping if eyes/mouth not set
    if (config.expression && !config.eyes) {
        safeConfig.eyes = config.expression;
        safeConfig.mouth = config.expression;
    }

    return (
        <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }}>
            <Svg width={size} height={size} viewBox="0 0 512 512">
                <Defs>
                    <ClipPath id="circle">
                        <Circle cx="256" cy="256" r="256" />
                    </ClipPath>
                </Defs>

                <G clipPath="url(#circle)">
                    <Background type={safeConfig.background} />
                    <Clothing type={safeConfig.clothing} color={safeConfig.clothingColor} />
                    <Head tone={safeConfig.skin} />
                    <Eyes type={safeConfig.eyes} />
                    <Mouth type={safeConfig.mouth} />
                    <Hair style={safeConfig.hairStyle} color={safeConfig.hairColor} />
                    <Beard type={safeConfig.beard} color={safeConfig.hairColor} />
                    <Glasses type={safeConfig.glasses} />
                    <Hat type={safeConfig.hat} />
                </G>
            </Svg>
        </View>
    );
}
