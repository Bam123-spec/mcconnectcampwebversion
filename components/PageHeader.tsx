import { View, Text, Platform } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface PageHeaderProps {
    title: string;
    rightIcon?: React.ReactNode;
    leftIcon?: React.ReactNode;
}

export default function PageHeader({ title, rightIcon, leftIcon }: PageHeaderProps) {
    const { theme: currentTheme } = useTheme();
    return (
        <View 
            style={{ backgroundColor: currentTheme.surface }}
            className="px-5 pt-[22px] pb-[8px] flex-row justify-between items-center z-10"
        >
            <View className="flex-row items-center">
                {leftIcon && <View className="mr-3">{leftIcon}</View>}
                <Text
                    className="tracking-tight"
                    style={{
                        fontFamily: "Lexend_400Regular",
                        fontSize: 34,
                        letterSpacing: -0.5,
                        color: currentTheme.text
                    }}
                    allowFontScaling={false}
                >
                    {title}
                </Text>
            </View>
            {rightIcon && <View>{rightIcon}</View>}
        </View>
    );
}
