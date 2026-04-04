import React, { useState } from "react";
import { View, Text, Pressable, LayoutChangeEvent } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from "react-native-reanimated";
import PageHeader from "@/components/PageHeader";
import ClubsScreen from "./clubs";
import ChatScreen from "./chat";
import { useTheme } from "@/context/ThemeContext";
import { StatusBar } from "expo-status-bar";

export type HubTab = "Clubs" | "Messages";
const TABS: HubTab[] = ["Clubs", "Messages"];

export default function CommunityScreen() {
  const { darkMode, theme: currentTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<HubTab>("Clubs");
  const [tabWidth, setTabWidth] = useState(0);
  const translateX = useSharedValue(0);

  const handleToggle = (tab: HubTab, index: number) => {
    setActiveTab(tab);
    // Move the pill
    translateX.value = withSpring(index * tabWidth, {
      damping: 20,
      stiffness: 200,
    });
  };

  const animatedPillStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      width: tabWidth,
    };
  });

  return (
    <SafeAreaView 
      style={{ backgroundColor: currentTheme.bg }} 
      className="flex-1" 
      edges={["left", "right"]}
    >
      <StatusBar style={darkMode ? "light" : "dark"} />
      {/* Header Area */}
      <View 
        style={{ 
          backgroundColor: currentTheme.surface,
          borderBottomColor: currentTheme.border
        }}
        className="pt-14 pb-3 rounded-b-[24px] shadow-sm shadow-black/5 border-b z-20"
      >
        {/* Animated Segmented Control */}
        <View className="px-5 mt-1">
          <View 
            style={{ backgroundColor: darkMode ? currentTheme.bg : "#f3f4f6" }}
            className="flex-row p-1.5 rounded-full relative"
          >
            {/* The sliding dark pill */}
            {tabWidth > 0 && (
              <Animated.View
                style={[
                  animatedPillStyle,
                  { backgroundColor: darkMode ? currentTheme.primary : "#111827" }
                ]}
                className="absolute top-1.5 bottom-1.5 left-1.5 rounded-full shadow-sm"
              />
            )}

            {TABS.map((tab, index) => {
              const isActive = activeTab === tab;
              return (
                <Pressable
                  key={tab}
                  className="flex-1 py-2.5 items-center justify-center z-10"
                  onPress={() => handleToggle(tab, index)}
                  onLayout={(e: LayoutChangeEvent) => {
                    if (index === 0) setTabWidth(e.nativeEvent.layout.width);
                  }}
                >
                  <Text
                    style={{ color: isActive ? (darkMode ? currentTheme.bg : "white") : currentTheme.textLight }}
                    className={`text-[14px] font-semibold tracking-tight`}
                  >
                    {tab}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* Content Area */}
      <View className="flex-1 -mt-4"> 
        {/* Negative margin to tuck content slightly under the rounded header */}
        {activeTab === "Clubs" ? (
          <ClubsScreen isHubChild />
        ) : (
          <ChatScreen isHubChild />
        )}
      </View>
    </SafeAreaView>
  );
}
