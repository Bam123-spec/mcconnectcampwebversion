import React from "react";
import { Path } from "react-native-svg";

// This component might be redundant if SkinLayer handles the shape, 
// but can be used for contours, nose, etc.
export const FaceShape = ({ tone }: { tone: string }) => {
    // Adding a nose and maybe some contouring
    // The tone passed here could be a slightly darker version for shadow

    return (
        <React.Fragment>
            {/* Nose Shadow/Shape */}
            <Path
                d="M70 75 L65 85 L75 85 Z"
                fill="#000000"
                fillOpacity="0.1"
            />
        </React.Fragment>
    );
};
