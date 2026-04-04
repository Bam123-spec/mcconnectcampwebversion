import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Image, TextInput, RefreshControl, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from "react-native-reanimated";
import { cssInterop } from "nativewind";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { supabase } from "@/lib/supabase";
import { getDiscoverClubs, getMyClubs } from "@/lib/clubService";
import { Club } from "@/types/database";
import ClubFeedSection from "@/components/ClubFeedSection";
import PageHeader from "@/components/PageHeader";
import { useTheme } from "@/context/ThemeContext";
import { StatusBar } from "expo-status-bar";



// Enable className for MotiView
cssInterop(MotiView, { className: "style" });

// --- Constants & Theme ---
const COLORS = {
  background: "#F7F5FC",
  primary: "#6D28D9",
  softPurple: "#E9E3FF",
  textDark: "#1A1A1A",
  textMuted: "#7A7A7A",
  white: "#FFFFFF",
};

// --- Helper Components ---

const ScalePressable = ({ children, className, onPress, style }: { children: React.ReactNode; className?: string; onPress?: () => void; style?: any }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      {
        transform: [{ scale: pressed ? 0.98 : 1 }],
        opacity: pressed ? 0.9 : 1,
      },
      style
    ]}
    className={className}
  >
    {children}
  </Pressable>
);

const SectionHeader = ({ title, action, delay = 0 }: { title: string; action?: string; delay?: number }) => {
  const { theme: currentTheme } = useTheme();
  return (
    <MotiView
      from={{ opacity: 0, translateY: 15 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 600, delay }}
      className="flex-row items-center justify-between px-5 mb-3 mt-6"
    >
      <Text style={{ color: currentTheme.text }} className="text-[17px] font-h1 tracking-tight">{title}</Text>
      {action && (
        <Pressable>
          <Text style={{ color: currentTheme.primary }} className="text-[13px] font-button">{action}</Text>
        </Pressable>
      )}
    </MotiView>
  );
};

const MyClubCard = ({ club, delay }: { club: Club; delay: number; key?: string }) => {
  const { darkMode, theme: currentTheme } = useTheme();
  const router = useRouter();
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", delay }}
    >
      <ScalePressable
        onPress={() => router.push(`/clubs/${club.id}`)}
        style={{ 
          backgroundColor: currentTheme.surface,
          borderColor: currentTheme.border,
          shadowColor: "#000",
        }}
        className="w-[150px] h-[180px] rounded-[22px] p-4 shadow-sm shadow-black/5 mr-3 border justify-between"
      >
        <View style={{ backgroundColor: darkMode ? currentTheme.bg : "#F3E8FF", borderColor: darkMode ? currentTheme.border : "#E9E3FF" }} className="h-10 w-10 rounded-full items-center justify-center overflow-hidden border">
          {club.cover_image_url ? (
            <Image source={{ uri: club.cover_image_url }} className="h-full w-full" resizeMode="cover" />
          ) : (
            <Text style={{ color: currentTheme.primary }} className="text-[16px] font-h1">{club.name.charAt(0)}</Text>
          )}
        </View>
 
        <View>
          <Text style={{ color: currentTheme.text }} className="text-[14px] font-button mb-0.5 leading-tight" numberOfLines={2}>{club.name}</Text>
          <Text style={{ color: currentTheme.textLight }} className="text-[11px] font-metadata mb-2">{club.member_count || 0} members</Text>
          <View style={{ backgroundColor: darkMode ? currentTheme.surfaceSelected : "#F3F4F6" }} className="self-start px-2 py-0.5 rounded-full">
            <Text style={{ color: currentTheme.textLight }} className="text-[10px] font-button">Member</Text>
          </View>
        </View>
      </ScalePressable>
    </MotiView>
  );
};

const DiscoverClubCard = ({ club, delay, key }: { club: Club; delay: number; key?: string }) => {
  const { theme: currentTheme } = useTheme();
  const router = useRouter();
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 500, delay }}
    >
      <ScalePressable
        onPress={() => router.push(`/clubs/${club.id}`)}
        className="w-full h-[360px] mb-6 rounded-[32px] overflow-hidden shadow-sm border border-gray-100"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 10,
        }}
      >
        <ImageBackground 
          source={{ uri: club.cover_image_url || 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=800&auto=format&fit=crop' }} 
          className="w-full h-full justify-end bg-gray-200"
          imageStyle={{ borderRadius: 32 }}
        >
          {/* Dark Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.9)']}
            className="absolute left-0 right-0 bottom-0 h-[60%] rounded-b-[32px]"
          />
          
          <View className="p-6 relative z-10 w-full">
            <Text className="text-white text-[28px] font-bold tracking-tight mb-1">{club.name}</Text>
            <Text className="text-gray-300 text-[14px] leading-5 mb-5" numberOfLines={2}>
              {club.description || "Join this club to start engaging with the community and making new friends!"}
            </Text>
            
            <View className="flex-row items-center gap-3 w-full">
              <View className="flex-row items-center rounded-full overflow-hidden border border-white/20">
                <BlurView intensity={20} tint="dark" className="flex-row items-center px-3 py-2">
                  <Ionicons name="people" size={14} color="white" />
                  <Text className="text-white text-[12px] font-semibold ml-1.5">{club.member_count || 0} Members</Text>
                </BlurView>
              </View>
              <View className="flex-row items-center rounded-full overflow-hidden border border-white/20">
                <BlurView intensity={20} tint="dark" className="flex-row items-center px-3 py-2">
                  <Ionicons name="time" size={14} color="white" />
                  <Text className="text-white text-[12px] font-semibold ml-1.5">{club.meeting_time || "TBA"}</Text>
                </BlurView>
              </View>
            </View>
          </View>
        </ImageBackground>
      </ScalePressable>
    </MotiView>
  );
};

// --- Main Screen ---

export default function Clubs({ isHubChild }: { isHubChild?: boolean }) {
  const { darkMode, theme: currentTheme } = useTheme();
  const [activeSubTab, setActiveSubTab] = useState<"Feed" | "Discover">("Feed");
  const [tabWidth, setTabWidth] = useState(0);
  const translateX = useSharedValue(0);

  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [discoverClubs, setDiscoverClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [discoverQuery, setDiscoverQuery] = useState("");
  const [discoverPage, setDiscoverPage] = useState(0);
  const [discoverHasMore, setDiscoverHasMore] = useState(true);
  const [loadingMoreDiscover, setLoadingMoreDiscover] = useState(false);

  const handleToggle = (tab: "Feed" | "Discover", index: number) => {
    setActiveSubTab(tab);
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

  const fetchData = async (resetDiscover = true) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const myClubsData = await getMyClubs(user.id);
        setMyClubs(myClubsData);
        await fetchDiscoverClubs(myClubsData, 0, resetDiscover);
      }
    } catch (error) {
      console.error("Error fetching clubs:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchDiscoverClubs = async (currentMyClubs = myClubs, nextPage = 0, reset = false) => {
    const myClubIds = currentMyClubs.map((club) => club.id);
    if (!reset && nextPage > 0) setLoadingMoreDiscover(true);

    const { clubs, hasMore } = await getDiscoverClubs({
      page: nextPage,
      pageSize: 6,
      query: discoverQuery,
      excludeClubIds: myClubIds,
    });

    setDiscoverClubs((prev) => {
      if (reset || nextPage === 0) return clubs;
      const seen = new Set(prev.map((club) => club.id));
      return [...prev, ...clubs.filter((club) => !seen.has(club.id))];
    });
    setDiscoverPage(nextPage);
    setDiscoverHasMore(hasMore);
    setLoadingMoreDiscover(false);
  };

  useEffect(() => {
    fetchData(true);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchDiscoverClubs(myClubs, 0, true);
    }, 250);

    return () => clearTimeout(timeout);
  }, [discoverQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  const Content = (
    <>
      {!isHubChild && (
        <View style={{ backgroundColor: currentTheme.surface, borderBottomColor: currentTheme.border }} className="rounded-b-[28px] shadow-sm shadow-black/5 z-10 border-b">
          <PageHeader
            title="Clubs"
            rightIcon={
              <Pressable style={{ backgroundColor: darkMode ? currentTheme.bg : "#F7F5FC" }} className="h-9 w-9 items-center justify-center rounded-full">
                <Ionicons name="add" size={22} color={currentTheme.text} />
              </Pressable>
            }
          />
 
          {/* Search Bar */}
          <View className="px-5 pb-4">
            <View style={{ backgroundColor: darkMode ? currentTheme.bg : "#F7F5FC", borderColor: currentTheme.border }} className="flex-row items-center rounded-[16px] px-4 py-2.5 border">
              <Ionicons name="search-outline" size={18} color={currentTheme.textLight} />
              <TextInput
                placeholder="Search clubs..."
                placeholderTextColor={currentTheme.textLight}
                style={{ color: currentTheme.text }}
                className="flex-1 ml-2 text-[14px] font-body"
                value={discoverQuery}
                onChangeText={setDiscoverQuery}
              />
            </View>
          </View>
        </View>
      )}

      {/* Sub-Toggle for Feed / Discover */}
      {isHubChild && (
        <View className="px-5 pt-2 pb-0 z-10 w-full mt-2">
          <View style={{ borderBottomColor: darkMode ? currentTheme.border : "#E9E3FF" }} className="flex-row border-b relative">
            {tabWidth > 0 && (
              <Animated.View
                style={[animatedPillStyle, { backgroundColor: currentTheme.primary }]}
                className="absolute bottom-[-1px] left-0 h-[3px] rounded-t-full"
              />
            )}
            {(["Feed", "Discover"] as const).map((tab, index) => {
              const isActive = activeSubTab === tab;
              return (
                <Pressable
                  key={tab}
                  className="flex-1 py-3 items-center justify-center z-10"
                  onPress={() => handleToggle(tab, index)}
                  onLayout={(e: any) => {
                    if (index === 0) setTabWidth(e.nativeEvent.layout.width);
                  }}
                >
                  <Text
                    style={{ color: isActive ? currentTheme.text : currentTheme.textLight }}
                    className={`text-[15px] font-semibold tracking-tight`}
                  >
                    {tab}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {isHubChild && activeSubTab === "Discover" && (
        // A dedicated search bar area only on the Discover tab
        <View className="px-5 pt-1 pb-2 bg-transparent z-10 w-full">
            <View 
              style={{ 
                backgroundColor: currentTheme.surface,
                borderColor: currentTheme.border
              }}
              className="flex-row items-center rounded-2xl px-4 py-3 border shadow-sm shadow-black/5"
            >
              <Ionicons name="search" size={20} color={currentTheme.textLight} />
              <TextInput
                placeholder="Find a club..."
                placeholderTextColor={currentTheme.textLight}
                style={{ color: currentTheme.text }}
                className="flex-1 ml-2 text-[15px] font-medium"
                value={discoverQuery}
                onChangeText={setDiscoverQuery}
              />
            </View>
        </View>
      )}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100, paddingTop: isHubChild ? 10 : 0 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={currentTheme.primary} />}
      >
        {/* FEED TAB CONTENT */}
        {(!isHubChild || activeSubTab === "Feed") && (
          <>
            {/* My Clubs Section */}
            {myClubs.length > 0 && (
              <>
                <SectionHeader title="My Clubs" action="Manage" delay={100} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 10 }}>
                  {myClubs.map((club, index) => (
                    <MyClubCard key={club.id} club={club} delay={200 + index * 100} />
                  ))}
                </ScrollView>
              </>
            )}

            {/* Club Feed */}
            <ClubFeedSection />
          </>
        )}

        {/* DISCOVER TAB CONTENT */}
        {(!isHubChild || activeSubTab === "Discover") && (
          <>
            {/* Discover Clubs Heading */}
            <View className="flex-row justify-between items-center px-5 mb-4 mt-2">
              <Text style={{ color: currentTheme.text }} className="text-[17px] font-h1 tracking-tight">Discover</Text>
              <Pressable>
                <Text style={{ color: currentTheme.primary }} className="text-[13px] font-button">See All</Text>
              </Pressable>
            </View>
            
            {/* Discover Cards */}
            <View className="px-5">
              {loading ? (
                <Text style={{ color: currentTheme.textLight }} className="text-center mt-10 font-body">Loading clubs...</Text>
              ) : discoverClubs.length > 0 ? (
                <>
                  {discoverClubs.map((club, index) => (
                    <DiscoverClubCard key={club.id} club={club} delay={500 + index * 100} />
                  ))}
                  {discoverHasMore && (
                    <Pressable
                      onPress={() => {
                        if (!loadingMoreDiscover) {
                          fetchDiscoverClubs(myClubs, discoverPage + 1);
                        }
                      }}
                      className="mb-6 items-center justify-center rounded-[20px] bg-white py-4 border border-gray-100"
                      disabled={loadingMoreDiscover}
                    >
                      <Text style={{ color: currentTheme.primary }} className="text-[13px] font-button">
                        {loadingMoreDiscover ? "Loading..." : "Load More Clubs"}
                      </Text>
                    </Pressable>
                  )}
                </>
              ) : (
                <Text style={{ color: currentTheme.textLight }} className="text-center mt-10 font-body">No clubs found.</Text>
              )}
            </View>
          </>
        )}

      </ScrollView>
    </>
  );

  if (isHubChild) return <View className="flex-1">{Content}</View>;
  return <SafeAreaView style={{ backgroundColor: currentTheme.bg }} className="flex-1" edges={["top"]}>{Content}</SafeAreaView>;
}
