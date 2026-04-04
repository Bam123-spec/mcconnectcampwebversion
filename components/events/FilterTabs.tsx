import React, { useState, useEffect } from "react";
import { ScrollView, Text, Pressable, View, LayoutChangeEvent } from "react-native";
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from "react-native-reanimated";
import { useTheme } from "@/context/ThemeContext";

const FILTERS = ["All", "Upcoming", "Today", "This Week", "Online", "On-Campus"];

interface FilterTabsProps {
    activeFilter: string;
    onSelectFilter: (filter: string) => void;
}

export default function FilterTabs({ activeFilter, onSelectFilter }: FilterTabsProps) {
    const { darkMode, theme: currentTheme } = useTheme();
    const [tabWidths, setTabWidths] = useState<number[]>(new Array(FILTERS.length).fill(0));
    const [tabPositions, setTabPositions] = useState<number[]>(new Array(FILTERS.length).fill(0));
    const activePositionX = useSharedValue(0);
    const activeWidth = useSharedValue(0);
    const activeIndex = FILTERS.indexOf(activeFilter);

    useEffect(() => {
        if (tabPositions[activeIndex] !== undefined && tabWidths[activeIndex] !== undefined && tabWidths[activeIndex] > 0) {
            activePositionX.value = withSpring(tabPositions[activeIndex], {
                damping: 18,
                stiffness: 150,
                mass: 0.8
            });
            activeWidth.value = withSpring(tabWidths[activeIndex], {
                damping: 18,
                stiffness: 150,
                mass: 0.8
            });
        }
    }, [activeIndex, tabPositions, tabWidths]);

    const animatedPillStyle = useAnimatedStyle(() => {
        return {
            position: 'absolute',
            left: activePositionX.value,
            width: activeWidth.value,
            height: '100%',
            backgroundColor: currentTheme.text, // Themed pill matches contrast
            borderRadius: 9999,
            // Offset to match the scroll container padding
            top: 0,
            bottom: 0,
        };
    });

    return (
        <View className="py-2">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
            >
                <View className="flex-row items-center relative">
                    {/* Animated Sliding Highlight Pill */}
                    <Animated.View style={animatedPillStyle} />

                    {FILTERS.map((filter, index) => {
                        const isActive = activeFilter === filter;
                        return (
                            <Pressable
                                key={filter}
                                onPress={() => onSelectFilter(filter)}
                                onLayout={(e: LayoutChangeEvent) => {
                                    const { x, width } = e.nativeEvent.layout;
                                    setTabPositions(prev => {
                                        const next = [...prev];
                                        next[index] = x;
                                        return next;
                                    });
                                    setTabWidths(prev => {
                                        const next = [...prev];
                                        next[index] = width;
                                        return next;
                                    });
                                }}
                                style={{ 
                                    backgroundColor: isActive ? 'transparent' : currentTheme.surface,
                                    borderColor: isActive ? 'transparent' : currentTheme.border
                                }}
                                className={`px-4 py-2 flex-row items-center justify-center rounded-full z-10 border`}
                            >
                                <Text 
                                    style={{ color: isActive ? currentTheme.bg : currentTheme.textLight }}
                                    className={`text-[13px] font-semibold tracking-tight`}
                                >
                                    {filter}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
}
