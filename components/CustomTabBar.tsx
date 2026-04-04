import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, LayoutChangeEvent } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';

type IconName = keyof typeof Ionicons.glyphMap;

// Isolated to prevent the tab bar body from re-rendering on every animation frame
const AnimatedIndicator = React.memo(({ activePositionX, currentTheme }: { activePositionX: any; currentTheme: any }) => {
  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: activePositionX.value,
    top: 0,
    width: 40,
    height: 3,
    backgroundColor: currentTheme.primary,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    shadowColor: currentTheme.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 10,
  }));
  return <Animated.View style={style} />;
});

// Memoized to prevent re-renders of non-active tabs
const TabItem = React.memo(({
  isFocused,
  onPress,
  onLongPress,
  icon,
  label,
  onLayout,
}: {
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  icon: IconName;
  label: string;
  onLayout: (e: LayoutChangeEvent) => void;
}) => {
  const { theme: currentTheme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onLayout={onLayout}
      unstable_pressDelay={0}
      className="flex-1 items-center justify-center pt-2 pb-7"
    >
      <View className="items-center justify-center h-9 w-9 mb-0.5">
        <Ionicons
          name={isFocused ? icon : `${icon}-outline` as any}
          size={24}
          color={isFocused ? currentTheme.primary : currentTheme.textLight}
        />
      </View>
      <Text
        style={{
          color: isFocused ? currentTheme.primary : currentTheme.textLight,
          fontSize: 10,
          fontWeight: isFocused ? '600' : '500',
        }}
        className="font-metadata tracking-tight"
      >
        {label}
      </Text>
    </Pressable>
  );
});

// Separate component per route — this lets useCallback be called properly at component level, not in a loop
const RouteTab = React.memo(({
  route,
  isFocused,
  index,
  onTabLayout,
  onPressTab,
  navigation,
}: {
  route: any;
  isFocused: boolean;
  index: number;
  onTabLayout: (index: number, x: number, w: number) => void;
  onPressTab: (route: any, index: number, isFocused: boolean) => void;
  navigation: BottomTabBarProps['navigation'];
}) => {
  const handlePress = useCallback(() => {
    onPressTab(route, index, isFocused);
  }, [index, isFocused, onPressTab, route]);

  const handleLongPress = useCallback(() => {
    navigation.emit({ type: 'tabLongPress', target: route.key });
  }, [route.key, navigation]);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    onTabLayout(index, e.nativeEvent.layout.x, e.nativeEvent.layout.width);
  }, [index, onTabLayout]);

  let iconName: IconName = 'home';
  let label = 'Home';
  if (route.name === 'events') { iconName = 'calendar'; label = 'Events'; }
  else if (route.name === 'community') { iconName = 'people'; label = 'Community'; }
  else if (route.name === 'profile') { iconName = 'person'; label = 'Profile'; }

  return (
    <TabItem
      isFocused={isFocused}
      onPress={handlePress}
      onLongPress={handleLongPress}
      icon={iconName}
      label={label}
      onLayout={handleLayout}
    />
  );
});

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const { darkMode, theme: currentTheme } = useTheme();
  const visibleRoutes = state.routes.slice(0, 4);
  const [tabWidths, setTabWidths] = useState<number[]>(new Array(visibleRoutes.length).fill(0));
  const [tabPositions, setTabPositions] = useState<number[]>(new Array(visibleRoutes.length).fill(0));
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const activePositionX = useSharedValue(0);
  const activeIndex = pendingIndex ?? state.index;

  const handleTabLayout = useCallback((index: number, x: number, w: number) => {
    setTabPositions(prev => { const n = [...prev]; n[index] = x; return n; });
    setTabWidths(prev => { const n = [...prev]; n[index] = w; return n; });
  }, []);

  const handleTabPress = useCallback((route: any, index: number, isFocused: boolean) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (isFocused || event.defaultPrevented) {
      return;
    }

    setPendingIndex(index);
    navigation.navigate(route.name, route.params);
  }, [navigation]);

  useEffect(() => {
    setPendingIndex(null);
  }, [state.index]);

  useEffect(() => {
    if (tabPositions[activeIndex] !== undefined && tabWidths[activeIndex] > 0) {
      const indicatorWidth = 40;
      const centeredX = tabPositions[activeIndex] + (tabWidths[activeIndex] - indicatorWidth) / 2;
      activePositionX.value = withSpring(centeredX, {
        damping: 25,
        stiffness: 350,
        mass: 0.4,
      });
    }
  }, [activeIndex, tabPositions, tabWidths]);

  return (
    <View className="absolute bottom-0 left-0 right-0 z-50">
      <BlurView
        intensity={darkMode ? 100 : 80}
        tint={darkMode ? 'dark' : 'light'}
        className="flex-row items-center relative border-t"
        style={{
          backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          borderTopColor: currentTheme.border,
        }}
      >
        <AnimatedIndicator activePositionX={activePositionX} currentTheme={currentTheme} />

        {visibleRoutes.map((route, index) => (
          <RouteTab
            key={route.key}
            route={route}
            isFocused={activeIndex === index}
            onPressTab={handleTabPress}
            navigation={navigation}
            index={index}
            onTabLayout={handleTabLayout}
          />
        ))}
      </BlurView>
    </View>
  );
}
