import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { StatusBar } from "expo-status-bar";
import { MotiView } from "moti";
import { cssInterop } from "nativewind";
import { useRouter, useSegments, Link, useFocusEffect } from "expo-router";
import { supabase } from "@/lib/supabase";
import { getMyClubs } from "@/lib/clubService";
import { getFeaturedEvents } from "@/lib/eventService";
import { getTrendingPosts } from "@/lib/forumService";
import { Club, Event, ForumPost } from "@/types/database";

// Enable className for MotiView
cssInterop(MotiView, { className: "style" });

// --- Helper Functions ---

// Safely parse a date string like "2025-03-15" or "2025-03-15T00:00:00Z" in local time.
// new Date("YYYY-MM-DD") is treated as UTC midnight by JS, causing off-by-one errors.
const parseLocalDate = (dateString: string | null | undefined): Date => {
  if (!dateString) return new Date(NaN);
  const datePart = dateString.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  if (!year || !month || !day) return new Date(NaN);
  return new Date(year, month - 1, day);
};

const formatDate = (dateString: string | null | undefined) => {
  const date = parseLocalDate(dateString);
  if (isNaN(date.getTime())) return "TBD";
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatShortDate = (dateString: string | null | undefined) => {
  const date = parseLocalDate(dateString);
  if (isNaN(date.getTime())) return "TBD";
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

// --- Helper Components ---

type ScalePressableProps = {
  children: React.ReactNode;
  className?: string;
  onPress?: () => void;
  style?: any;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

const ScalePressable = ({
  children,
  className,
  onPress,
  style,
  accessibilityLabel,
  accessibilityHint,
}: ScalePressableProps) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    accessibilityHint={accessibilityHint}
    style={({ pressed }) => [
      {
        transform: [{ scale: pressed ? 0.96 : 1 }],
        opacity: pressed ? 0.9 : 1,
      },
      style
    ]}
    className={className}
  >
    {children}
  </Pressable>
);

const WaveHand = () => (
  <MotiView
    from={{ rotate: '0deg' }}
    animate={{ rotate: ['0deg', '14deg', '-8deg', '14deg', '-4deg', '10deg', '0deg'] }}
  transition={{
      type: 'timing',
      duration: 2500,
      loop: true,
      repeatReverse: false,
    }}
    className="ml-1.5"
    accessible={false}
  >
    <Text style={{ fontSize: 20 }}>👋</Text>
  </MotiView>
);

const SectionHeader = ({ title, action, isLive, delay = 0, onAction }: { title: string; action?: string; isLive?: boolean; delay?: number; onAction?: () => void }) => {
  const { theme: currentTheme } = useTheme();
  return (
    <MotiView
      from={{ opacity: 0, translateY: 15 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 600, delay }}
      className="flex-row items-center justify-between px-5 mb-3 mt-6"
    >
      <View className="flex-row items-center gap-2">
        <Text
          style={{ color: currentTheme.text }}
          className="text-[18px] font-h1 tracking-tight"
          accessibilityRole="header"
        >
          {title}
        </Text>
        {isLive && (
          <View 
            style={{ 
              backgroundColor: currentTheme.surface, 
              borderColor: currentTheme.border, 
              borderWidth: 1,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 1
            }} 
            className="flex-row items-center gap-1 px-2 py-0.5 rounded-full ml-1"
          >
            <View className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <Text className="text-[10px] font-button text-green-600">LIVE</Text>
          </View>
        )}
      </View>
      {action && onAction && (
        <Pressable
          onPress={onAction}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`${action} ${title}`}
          accessibilityHint={`Opens the ${title.toLowerCase()} section`}
        >
          <Text style={{ color: currentTheme.primary }} className="text-[13px] font-button">{action}</Text>
        </Pressable>
      )}
    </MotiView>
  );
};

const QuickActionItem = ({ icon, label, delay, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; delay: number; onPress?: () => void }) => {
  const { theme: currentTheme } = useTheme();
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9, translateY: 10 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ type: "spring", delay }}
      className="items-center gap-2"
    >
      <ScalePressable
        onPress={onPress}
        accessibilityLabel={label}
        accessibilityHint={`Opens ${label.toLowerCase()}`}
      >
        <View 
          style={{ 
            backgroundColor: currentTheme.surface, 
            borderColor: currentTheme.border,
            borderWidth: 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2
          }} 
          className="h-[52px] w-[52px] items-center justify-center rounded-[20px]"
        >
          <Ionicons name={icon} size={24} color={currentTheme.primary} accessible={false} accessibilityElementsHidden />
        </View>
      </ScalePressable>
      <Text style={{ color: currentTheme.textLight }} className="text-[11px] font-metadata">{label}</Text>
    </MotiView>
  );
};

const CampusNowCard = ({ title, subtitle, badge, badgeColor, delay }: { title: string; subtitle: string; badge: string; badgeColor: string; delay: number }) => {
  const { darkMode, theme: currentTheme } = useTheme();
  return (
    <MotiView
      from={{ opacity: 0, translateY: 15 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 500, delay }}
      className="flex-1"
    >
      <View>
        <View 
          style={{ 
            backgroundColor: currentTheme.surface, 
            borderColor: currentTheme.border,
            borderWidth: 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3
          }} 
          className="h-[120px] rounded-[24px] p-4 justify-between"
        >
          <View className={`self-start px-2 py-1 rounded-lg ${badgeColor}`}>
            <Text className="text-[9px] font-button uppercase tracking-wide">{badge}</Text>
          </View>
          <View>
            <Text style={{ color: currentTheme.text }} className="text-[15px] font-h1 mb-0.5 leading-tight">{title}</Text>
            <Text style={{ color: currentTheme.textLight }} className="text-[12px] font-metadata">{subtitle}</Text>
          </View>
        </View>
      </View>
    </MotiView>
  );
};

const ClubBubble = ({ club, delay }: { club: Club; delay: number }) => {
  const { theme: currentTheme } = useTheme();
  const router = useRouter();
  return (
    <MotiView
      from={{ opacity: 0, translateY: 15 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "spring", delay }}
    >
      <ScalePressable
        onPress={() => router.push(`/clubs/${club.id}`)}
        className="items-center gap-2 mr-5 w-[64px]"
        accessibilityLabel={club.name}
        accessibilityHint={`Opens the ${club.name} club page`}
      >
        <View 
          style={{ 
            backgroundColor: currentTheme.surface, 
            borderColor: currentTheme.border, 
            borderWidth: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2
          }} 
          className="h-[60px] w-[60px] rounded-full overflow-hidden items-center justify-center"
        >
          {club.cover_image_url ? (
            <Image source={{ uri: club.cover_image_url }} className="h-full w-full" resizeMode="cover" accessible={false} accessibilityIgnoresInvertColors />
          ) : (
            <Text style={{ color: currentTheme.primary }} className="text-[20px] font-h1">{club.name.charAt(0)}</Text>
          )}
        </View>
        <Text style={{ color: currentTheme.textLight }} className="text-[11px] font-metadata text-center leading-3" numberOfLines={2}>{club.name}</Text>
      </ScalePressable>
    </MotiView>
  );
};

const EventCard = ({ event, delay }: { event: Event; delay: number }) => {
  const { theme: currentTheme } = useTheme();
  const router = useRouter();
  return (
    <MotiView
      from={{ opacity: 0, translateY: 15 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "spring", delay }}
    >
      <ScalePressable
        onPress={() => router.push(`/event-details/${event.id}`)}
        accessibilityLabel={`${event.name}, ${formatShortDate(event.date ?? undefined)}`}
        accessibilityHint="Opens event details"
      >
        <View 
          style={{ 
            backgroundColor: currentTheme.surface, 
            borderColor: currentTheme.border,
            borderWidth: 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3
          }}
          className="w-[260px] h-[150px] rounded-[24px] p-5 mr-4 justify-between"
        >
          <View>
            <Text style={{ color: currentTheme.primary }} className="text-[11px] font-button uppercase mb-1 tracking-wide">
              {formatShortDate(event.date ?? undefined)}
            </Text>
            <Text style={{ color: currentTheme.text }} className="text-[17px] font-h1 mb-1 leading-tight" numberOfLines={2}>{event.name}</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View style={{ backgroundColor: currentTheme.bg }} className="p-1 rounded-full">
              <Ionicons name="location" size={12} color={currentTheme.textLight} accessible={false} accessibilityElementsHidden />
            </View>
            <Text style={{ color: currentTheme.textLight }} className="text-[12px] font-metadata" numberOfLines={1}>{event.location}</Text>
          </View>
        </View>
      </ScalePressable>
    </MotiView>
  );
};

const PostItem = ({ post }: { post: ForumPost }) => {
  const { theme: currentTheme } = useTheme();
  return (
    <View 
      style={{ 
        backgroundColor: currentTheme.surface, 
        borderColor: currentTheme.border, 
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
      }} 
      className="rounded-[24px] p-5 mb-4"
    >
        <View className="flex-row items-center gap-3 mb-3">
          <View style={{ backgroundColor: currentTheme.bg, borderColor: currentTheme.border, borderWidth: 1 }} className="h-9 w-9 rounded-full overflow-hidden items-center justify-center">
          {post.author?.avatar_url ? (
            <Image source={{ uri: post.author.avatar_url }} className="h-full w-full" accessible={false} accessibilityIgnoresInvertColors />
          ) : (
            <Ionicons name="person" size={18} color={currentTheme.textLight} accessible={false} accessibilityElementsHidden />
          )}
        </View>
        <View>
          <Text style={{ color: currentTheme.text }} className="text-[14px] font-button">{post.author?.full_name || "Anonymous"}</Text>
          <Text style={{ color: currentTheme.textLight }} className="text-[11px] font-metadata">{formatDate(post.created_at)}</Text>
        </View>
      </View>
      <Text style={{ color: currentTheme.text }} className="text-[14px] leading-6 mb-4 font-body">{post.content}</Text>
      <View style={{ borderTopColor: currentTheme.border, borderTopWidth: 1 }} className="flex-row gap-6 pt-3">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="heart-outline" size={18} color={currentTheme.textLight} accessible={false} accessibilityElementsHidden />
          <Text style={{ color: currentTheme.textLight }} className="text-[12px] font-metadata">{post.likes_count || 0}</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="chatbubble-outline" size={18} color={currentTheme.textLight} accessible={false} accessibilityElementsHidden />
          <Text style={{ color: currentTheme.textLight }} className="text-[12px] font-metadata">{post.comments_count || 0}</Text>
        </View>
      </View>
    </View>
  );
};

const AnnouncementCard = () => {
  const { theme: currentTheme } = useTheme();
  const router = useRouter();
  return (
    <View style={{ backgroundColor: currentTheme.primary }} className="rounded-[28px] p-6 shadow-lg shadow-black/10 mb-8 mt-2">
      <View className="flex-row items-center gap-2 mb-3">
        <View className="bg-white/20 p-1.5 rounded-lg">
          <Ionicons name="megaphone" size={16} color="white" accessible={false} accessibilityElementsHidden />
        </View>
        <Text className="text-[11px] font-button text-white/90 uppercase tracking-widest">ANNOUNCEMENT</Text>
      </View>
      <Text className="text-[20px] font-h1 text-white mb-2 leading-tight">Welcome to Connect Camp!</Text>
      <Text className="text-[14px] text-white/80 leading-6 mb-6 font-body">Explore clubs, join events, and connect with your campus community in a whole new way.</Text>
      <Pressable 
        onPress={() => router.push("/search")}
        accessibilityRole="button"
        accessibilityLabel="Get started"
        accessibilityHint="Opens search to discover clubs, events, and forum posts"
        style={{ 
          backgroundColor: currentTheme.surface,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2
        }} 
        className="self-start px-6 py-3 rounded-[16px]"
        > 
        <Text style={{ color: currentTheme.primary }} className="text-[13px] font-button">Get Started</Text>
      </Pressable>
    </View>
  );
};

// --- Main Screen ---

export default function Home() {
  const { darkMode, theme: currentTheme } = useTheme();
  const [followedClubs, setFollowedClubs] = useState<Club[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<ForumPost[]>([]);
  const [userName, setUserName] = useState("Student");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchData = async () => {
    // Only show loader on initial mount if we have no data
    if (featuredEvents.length === 0) setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch User Profile Name
        const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
        if (profile?.full_name) setUserName(profile.full_name.split(' ')[0]); // Use first name

        // Fetch Data
        const [clubs, events, posts] = await Promise.all([
          getMyClubs(user.id, 8),
          getFeaturedEvents(5),
          getTrendingPosts(3, 10)
        ]);

        setFollowedClubs(clubs);
        setFeaturedEvents(events);
        setTrendingPosts(posts);
      }
    } catch (error) {
      console.error("Error fetching home data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && featuredEvents.length === 0) {
    return (
      <SafeAreaView style={{ backgroundColor: currentTheme.bg }} className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={currentTheme.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ backgroundColor: currentTheme.bg }} className="flex-1" edges={["top"]}>
      <StatusBar style={darkMode ? "light" : "dark"} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Personalized Header */}
        <MotiView
          from={{ opacity: 0, translateY: -15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 700 }}
          style={{ 
            backgroundColor: currentTheme.surface, 
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
            borderBottomWidth: 1,
            borderBottomColor: currentTheme.border
          }}
          className="px-6 pt-2 pb-6 rounded-b-[32px] z-10"
        >
          <View className="flex-row justify-between items-center">
            <View>
              <Text style={{ color: currentTheme.textLight }} className="text-[14px] font-body mb-0.5">Good Morning,</Text>
              <View className="flex-row items-center gap-2">
                <Text style={{ color: currentTheme.text }} className="text-[26px] font-h1">{userName}</Text>
                <WaveHand />
              </View>
            </View>
            <Pressable
              onPress={() => router.push("/search")}
              style={{ padding: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Search"
              accessibilityHint="Opens the search screen"
            >
              <View 
                style={{ 
                  backgroundColor: currentTheme.bg, 
                  borderColor: currentTheme.border, 
                  borderWidth: 1,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 1
                }}
                className="h-10 w-10 items-center justify-center rounded-full"
              >
                <Ionicons name="search" size={20} color={currentTheme.text} accessible={false} accessibilityElementsHidden />
              </View>
            </Pressable>
          </View>
        </MotiView>

        {/* 2. Quick Actions Bar */}
        <View className="flex-row justify-between px-8 mt-8 mb-2">
          <QuickActionItem
            icon="calendar-number-outline"
            label="My Calendar"
            delay={300}
            onPress={() => router.push("/calendar")}
          />
          <QuickActionItem
            icon="people-outline"
            label="My Clubs"
            delay={400}
            onPress={() => router.push("/(tabs)/clubs")}
          />
          <QuickActionItem
            icon="calendar-outline"
            label="My Events"
            delay={500}
            onPress={() => router.push("/(tabs)/events")}
          />
          <QuickActionItem
            icon="map-outline"
            label="Campus Map"
            delay={600}
            onPress={() => router.push("/campus-map" as any)}
          />
        </View>

        {/* 3. Campus Now */}
        <SectionHeader title="Campus Now" isLive delay={700} />
        <View className="px-5 flex-row gap-4">
          <CampusNowCard
            title="Tech Talk: AI Futures"
            subtitle="Starting in 15m"
            badge="STARTING SOON"
            badgeColor="bg-pink-100 text-pink-700"
            delay={800}
          />
          <CampusNowCard
            title="Calculus II Group"
            subtitle="5 students active"
            badge="ACTIVE NOW"
            badgeColor="bg-green-100 text-green-700"
            delay={900}
          />
        </View>

        {/* 6. Clubs You Follow */}
        {followedClubs.length > 0 && (
          <>
            <SectionHeader title="Clubs You Follow" delay={1700} onAction={() => router.push("/(tabs)/clubs")} action="See All" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}>
              {followedClubs.map((club, index) => (
                <ClubBubble key={club.id} club={club} delay={1800 + index * 100} />
              ))}
            </ScrollView>
          </>
        )}

        {/* 7. Featured Events */}
        {featuredEvents.length > 0 && (
          <>
            <SectionHeader title="Featured Events" action="See All" delay={2300} onAction={() => router.push("/(tabs)/events")} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}>
              {featuredEvents.map((event, index) => (
                <EventCard key={event.id} event={event} delay={2400 + index * 100} />
              ))}
            </ScrollView>
          </>
        )}

        {/* 8. Trending Posts */}
        {trendingPosts.length > 0 && (
          <>
            <SectionHeader title="Trending Posts" action="Forum" delay={2600} onAction={() => router.push("/(tabs)/forum")} />
            <View className="px-5">
              {trendingPosts.map((post) => (
                <PostItem key={post.id} post={post} />
              ))}
            </View>
          </>
        )}

        {/* 10. Announcements */}
        <SectionHeader title="Announcement" delay={2800} />
        <View className="px-5">
          <AnnouncementCard />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
