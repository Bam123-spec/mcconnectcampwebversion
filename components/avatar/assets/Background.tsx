import React from "react";
import { Rect, Defs, LinearGradient, Stop, Circle } from "react-native-svg";

export const BACKGROUND_OPTIONS = [
    "solid_gray", "solid_blue", "solid_purple", "solid_green",
    "gradient_sunset", "gradient_ocean", "gradient_purple", "gradient_peachy"
];

export const Background = ({ type }: { type: string }) => {
    const Base = ({ fill }: { fill: string | any }) => (
        <Rect x="0" y="0" width="512" height="512" fill={fill} />
    );

    switch (type) {
        case "solid_gray": return <Base fill="#F3F4F6" />;
        case "solid_blue": return <Base fill="#DBEAFE" />;
        case "solid_purple": return <Base fill="#F3E8FF" />;
        case "solid_green": return <Base fill="#DCFCE7" />;

        case "gradient_sunset":
            return (
                <>
                    <Defs>
                        <LinearGradient id="grad_sunset" x1="0" y1="0" x2="1" y2="1">
                            <Stop offset="0" stopColor="#FCD34D" stopOpacity="1" />
                            <Stop offset="1" stopColor="#F87171" stopOpacity="1" />
                        </LinearGradient>
                    </Defs>
                    <Base fill="url(#grad_sunset)" />
                </>
            );
        case "gradient_ocean":
            return (
                <>
                    <Defs>
                        <LinearGradient id="grad_ocean" x1="0" y1="0" x2="1" y2="1">
                            <Stop offset="0" stopColor="#60A5FA" stopOpacity="1" />
                            <Stop offset="1" stopColor="#3B82F6" stopOpacity="1" />
                        </LinearGradient>
                    </Defs>
                    <Base fill="url(#grad_ocean)" />
                </>
            );
        case "gradient_purple":
            return (
                <>
                    <Defs>
                        <LinearGradient id="grad_purple" x1="0" y1="0" x2="1" y2="1">
                            <Stop offset="0" stopColor="#C084FC" stopOpacity="1" />
                            <Stop offset="1" stopColor="#7C3AED" stopOpacity="1" />
                        </LinearGradient>
                    </Defs>
                    <Base fill="url(#grad_purple)" />
                </>
            );
        case "gradient_peachy":
            return (
                <>
                    <Defs>
                        <LinearGradient id="grad_peachy" x1="0" y1="0" x2="1" y2="1">
                            <Stop offset="0" stopColor="#FDBA74" stopOpacity="1" />
                            <Stop offset="1" stopColor="#FB7185" stopOpacity="1" />
                        </LinearGradient>
                    </Defs>
                    <Base fill="url(#grad_peachy)" />
                </>
            );
        default:
            return <Base fill="#F3F4F6" />;
    }
};
