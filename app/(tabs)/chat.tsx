import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withSpring,
  withTiming,
  runOnJS,
  SharedValue,
} from "react-native-reanimated";
import ChatList from "@/components/chat/ChatList";
import PageHeader from "@/components/PageHeader";
import { useTheme } from "@/context/ThemeContext";
import { StatusBar } from "expo-status-bar";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TAB_WIDTH = SCREEN_WIDTH / 3;
const CHAT_TABS = [
  { label: "Clubs", type: "group" as const },
  { label: "DM", type: "dm" as const },
  { label: "Classes", type: "class" as const },
];

const TabsHeader = ({ activeIndex, onTabPress }: { activeIndex: SharedValue<number>; onTabPress: (index: number) => void }) => {
  const { darkMode, theme: currentTheme } = useTheme();

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: activeIndex.value * TAB_WIDTH }],
    };
  });

  return (
    <View className="mb-2">
      <View className="flex-row justify-between px-0 mb-0">
        {CHAT_TABS.map((tab, index) => {
          const isActiveStyle = useAnimatedStyle(() => {
            const isActive = Math.round(activeIndex.value) === index;
            return {
              color: withTiming(isActive ? currentTheme.primary : currentTheme.textLight, { duration: 200 }),
              fontFamily: isActive ? "Lexend_500Medium" : "Lexend_400Regular",
              transform: [{ scale: withSpring(isActive ? 1.05 : 1) }],
            };
          });

          return (
            <Pressable
              key={tab.type}
              onPress={() => onTabPress(index)}
              className="flex-1 items-center py-3"
            >
              <Animated.Text style={[{ fontSize: 15 }, isActiveStyle]}>
                {tab.label}
              </Animated.Text>
            </Pressable>
          );
        })}
      </View>
      {/* Animated Underline */}
      <View 
        style={{ backgroundColor: darkMode ? currentTheme.border : "#F3F4F6" }}
        className="h-[3px] w-full rounded-full overflow-hidden"
      >
        <Animated.View
          style={[{ width: TAB_WIDTH, backgroundColor: currentTheme.primary }, indicatorStyle]}
          className="h-full rounded-full absolute left-0"
        />
      </View>
    </View>
  );
};

export default function Chat({ isHubChild }: { isHubChild?: boolean }) {
  const { darkMode, theme: currentTheme } = useTheme();
  const router = useRouter();
  const scrollX = useSharedValue(0);
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visitedTabs, setVisitedTabs] = useState<number[]>([0]);

  const markVisitedTab = (index: number) => {
    setVisitedTabs((prev) => (prev.includes(index) ? prev : [...prev, index]));
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x / SCREEN_WIDTH;
    },
    onMomentumEnd: (event) => {
      const index = Math.round(event.contentOffset.x / SCREEN_WIDTH);
      runOnJS(setCurrentIndex)(index);
      runOnJS(markVisitedTab)(index);
    },
  });

  const handleTabPress = (index: number) => {
    scrollViewRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    setCurrentIndex(index);
    markVisitedTab(index);
  };

  const Content = (
    <>
      {/* Main Header */}
      {!isHubChild && (
        <View 
          style={{ 
            backgroundColor: currentTheme.surface,
            borderColor: currentTheme.border
          }}
          className="rounded-b-[28px] shadow-sm shadow-black/5 z-10"
        >
          <PageHeader
            title="Chat"
            rightIcon={
              <Pressable 
                style={{ backgroundColor: darkMode ? currentTheme.bg : "#F7F5FC" }}
                className="h-10 w-10 items-center justify-center rounded-full"
              >
                <Ionicons name="create-outline" size={22} color={currentTheme.text} />
              </Pressable>
            }
          />
          <TabsHeader activeIndex={scrollX} onTabPress={handleTabPress} />
        </View>
      )}

      {isHubChild && (
        <View className="bg-transparent z-10 mt-4 px-2">
          <TabsHeader activeIndex={scrollX} onTabPress={handleTabPress} />
        </View>
      )}

      {/* Swipeable Content */}
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ width: SCREEN_WIDTH * 3 }}
      >
        {CHAT_TABS.map((tab, index) => (
          <View key={tab.type} style={{ width: SCREEN_WIDTH, height: '100%' }}>
            {visitedTabs.includes(index) ? (
              <ChatList type={tab.type} isActive={currentIndex === index} />
            ) : null}
          </View>
        ))}
      </Animated.ScrollView>
    </>
  );

  if (isHubChild) return <View className="flex-1">{Content}</View>;

  return (
    <SafeAreaView 
      style={{ backgroundColor: currentTheme.bg }} 
      className="flex-1" 
      edges={["top"]}
    >
      <StatusBar style={darkMode ? "light" : "dark"} />
      {Content}
    </SafeAreaView>
  );
}
