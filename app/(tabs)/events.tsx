import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, LayoutChangeEvent } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/context/ThemeContext";
import { getEventsPage } from "@/lib/eventService";
import { Event } from "@/types/database";
import EventCard from "@/components/events/EventCard";
import FilterTabs from "@/components/events/FilterTabs";

type Segment = "All" | "My Events";
const SEGMENTS: Segment[] = ["All", "My Events"];

export default function EventsScreen() {
  const { darkMode, theme: currentTheme } = useTheme();
  const [activeSegment, setActiveSegment] = useState<Segment>("All");
  const [activeFilter, setActiveFilter] = useState("All"); // "Upcoming", "Today" etc.
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Animated Sliding Pill Setup
  const [tabWidths, setTabWidths] = useState<number[]>(new Array(SEGMENTS.length).fill(0));
  const [tabPositions, setTabPositions] = useState<number[]>(new Array(SEGMENTS.length).fill(0));
  const activePositionX = useSharedValue(0);
  const activeWidth = useSharedValue(0);
  const activeIndex = SEGMENTS.indexOf(activeSegment);

  useEffect(() => {
    if (tabPositions[activeIndex] !== undefined && tabWidths[activeIndex] !== undefined) {
      activePositionX.value = withSpring(tabPositions[activeIndex], {
        damping: 16,
        stiffness: 120,
        mass: 0.8
      });
      activeWidth.value = withSpring(tabWidths[activeIndex], {
        damping: 16,
        stiffness: 120,
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
      backgroundColor: darkMode ? currentTheme.primary : '#3B82F6', // Themed sliding pill
      borderRadius: 9999,
      top: 4, // match the p-1 padding of parent container (4px)
      bottom: 4,
    };
  });

  const fetchEvents = async (nextPage = 0, reset = false) => {
    if ((reset || nextPage === 0) && events.length === 0) setLoading(true);
    if (!reset && nextPage > 0) setLoadingMore(true);
    try {
      const { events: nextEvents, hasMore: nextHasMore } = await getEventsPage({
        page: nextPage,
        pageSize: 12,
        filter: activeFilter as "All" | "Upcoming" | "Today",
        registeredOnly: activeSegment === "My Events",
      });

      setEvents((prev) => {
        if (reset || nextPage === 0) {
          return nextEvents;
        }

        const seen = new Set(prev.map((event) => event.id));
        return [...prev, ...nextEvents.filter((event) => !seen.has(event.id))];
      });
      setPage(nextPage);
      setHasMore(nextHasMore);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchEvents(0, true);
  }, [activeFilter, activeSegment]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEvents(0, true);
  };

  const handleUpdateEvent = (eventId: string, updates: Partial<Event>) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, ...updates } : e));
  };

  const displayedEvents = events;

  return (
    <SafeAreaView 
      style={{ backgroundColor: currentTheme.bg }} 
      className="flex-1" 
      edges={["top"]}
    >
      <StatusBar style={darkMode ? "light" : "dark"} />
      {/* Top Navigation / Segmented Control */}
      <View className="px-5 pt-4 pb-2 items-center z-10">
        {/* We use py-1 for explicit padding on the top/bottom so the inner pill fits cleanly inside. */}
        <View 
          className="flex-row items-center p-1 rounded-full relative overflow-hidden" 
          style={{ 
            width: '80%', 
            height: 44, 
            backgroundColor: currentTheme.surface,
            borderColor: currentTheme.border,
            borderWidth: darkMode ? 1 : 0,
            shadowColor: "#000", 
            shadowOffset: { width: 0, height: 2 }, 
            shadowOpacity: darkMode ? 0 : 0.05, 
            shadowRadius: 8, 
            elevation: 2 
          }}
        >
          
          {/* Animated Background Pill */}
          {/* Since parent has p-1 (4px), total height is 44, so pill should be 36px tall */}
          <Animated.View style={[animatedPillStyle, { height: 36 }]} />

          {SEGMENTS.map((segment, index) => {
            const isActive = activeSegment === segment;
            return (
              <TouchableOpacity
                key={segment}
                onPress={() => setActiveSegment(segment)}
                onLayout={(e: LayoutChangeEvent) => {
                    const { x, width } = e.nativeEvent.layout;
                    // Because of the 'p-1' (4px) padding on the parent container,
                    // the layout x already includes the 4px start padding. We use exactly x.
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
                className="flex-1 flex-row items-center justify-center gap-1.5 h-full rounded-full z-10"
                activeOpacity={0.7}
              >
                {segment === "My Events" && (
                  <Ionicons name="ticket" size={14} color={isActive ? "#FFFFFF" : currentTheme.textLight} />
                )}
                {segment === "All" && (
                  <Ionicons name="calendar" size={14} color={isActive ? "#FFFFFF" : currentTheme.textLight} />
                )}
                <Text className={`text-[13px] font-semibold tracking-tight ${isActive ? "text-white" : ""}`} style={{ color: isActive ? "#FFFFFF" : currentTheme.textLight }}>
                  {segment}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Filters */}
      <FilterTabs activeFilter={activeFilter} onSelectFilter={setActiveFilter} />

      {/* List */}
      <FlatList
        data={displayedEvents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onUpdate={(updates) => handleUpdateEvent(item.id, updates)}
            showScanQr={activeSegment === "My Events"}
          />
        )}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (!loadingMore && hasMore) {
            fetchEvents(page + 1);
          }
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={currentTheme.primary} />
        }
        ListEmptyComponent={
          !loading || events.length > 0 ? (
            <View className="items-center justify-center py-20">
              <View 
                style={{ backgroundColor: darkMode ? currentTheme.surface : '#F3F4F6' }}
                className="h-20 w-20 rounded-full items-center justify-center mb-4"
              >
                <Ionicons
                  name={activeSegment === "My Events" ? "ticket-outline" : "calendar-outline"}
                  size={40}
                  color={currentTheme.textLight}
                />
              </View>
              <Text style={{ color: currentTheme.text }} className="text-[16px] font-h1 mb-1">
                {activeSegment === "My Events" ? "No Tickets Found" : "No Events Found"}
              </Text>
              <Text style={{ color: currentTheme.textLight }} className="text-[13px] font-body text-center px-10">
                {activeSegment === "My Events"
                  ? "You haven't registered for any events yet. Explore the 'All' tab to find something!"
                  : "There are no upcoming events at the moment. Check back later!"}
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loadingMore || (loading && !refreshing) ? (
            <View className="py-4">
              <ActivityIndicator color={currentTheme.primary} />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
