import React, { useState, useCallback, useEffect } from "react";
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, Alert, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { useAchievements } from "@/context/AchievementContext";
import { getProfile, getFriends, getFollowersCount, getFollowingCount, getOfficerClubs, getAchievements, getEventsHistory, AchievementPreviewItem } from "@/lib/profileService";
import { getMyClubs } from "@/lib/clubService";
import { Profile as UserProfile, Club, UserAchievement, Event } from "@/types/database";
import { useTheme } from "@/context/ThemeContext";

import ProfileHeader from "@/components/profile/ProfileHeader";

import SelfProfileActions from "@/components/profile/SelfProfileActions";
import ShareProfileSheet from "@/components/profile/ShareProfileSheet";
import StatsRow from "@/components/profile/StatsRow";
import BioSection from "@/components/profile/BioSection";
import FriendsRow from "@/components/profile/FriendsRow";
import ClubsRow from "@/components/profile/ClubsRow";
import AchievementsRow from "@/components/profile/AchievementsRow";
import ProfileEventsSection from "@/components/profile/ProfileEventsSection";
import OfficerDashboard from "@/components/profile/OfficerDashboard";
import CustomizeProfileModal from "@/components/profile/customize/CustomizeProfileModal";

export default function ProfileScreen() {
  const router = useRouter();
  const { darkMode, theme: currentTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [officerRoles, setOfficerRoles] = useState<{ club: Club, role: string }[]>([]);
  const [memberClubs, setMemberClubs] = useState<Club[]>([]);
  const [achievements, setAchievements] = useState<AchievementPreviewItem[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shareSheetVisible, setShareSheetVisible] = useState(false);
  const [customizeModalVisible, setCustomizeModalVisible] = useState(false);

  const { checkTrigger } = useAchievements();

  const fetchData = useCallback(async () => {
    // Only show loader if we don't have profile data yet
    if (!profile) setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const [
          profileData,
          friendsData,
          followers,
          following,
          officerData,
          clubsData,
          achievementsData,
          eventsData
        ] = await Promise.all([
          getProfile(user.id),
          getFriends(user.id, 12),
          getFollowersCount(user.id),
          getFollowingCount(user.id),
          getOfficerClubs(user.id),
          getMyClubs(user.id, 12),
          getAchievements(user.id),
          getEventsHistory(user.id, 8)
        ]);

        setProfile(profileData);
        setFriends(friendsData);
        setFollowersCount(followers);
        setFollowingCount(following);
        setOfficerRoles(officerData);
        setMemberClubs(clubsData);
        setAchievements(achievementsData);

        // Check for Club Leader achievement
        if (officerData.length > 0) {
          await checkTrigger('officer_role', { isOfficer: true }, user.id);
        }

        // Filter events into upcoming and past
        const now = new Date().toISOString();
        setUpcomingEvents(eventsData.filter(e => e.day >= now.split('T')[0]));
        setPastEvents(eventsData.filter(e => e.day < now.split('T')[0]));
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [checkTrigger, profile]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleEditProfile = () => {
    // Open customization modal instead of alert
    setCustomizeModalVisible(true);
  };

  const handleEditAvatar = () => {
    router.push("/profile/edit-avatar");
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  if (loading && !profile) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: currentTheme.bg }}>
        <ActivityIndicator size="large" color={currentTheme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: currentTheme.bg }} edges={["top"]}>
      <StatusBar style={darkMode ? "light" : "dark"} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={currentTheme.primary} />
        }
      >
        {/* 1. Header */}
        <ProfileHeader profile={profile} onEditAvatar={handleEditAvatar} />

        {/* 2. Self Profile Actions */}
        <SelfProfileActions
          onEditProfile={handleEditProfile}
          onSettings={handleSettings}
          onShareProfile={() => setShareSheetVisible(true)}
        />

        {/* 3. Stats Row */}
        <StatsRow
          clubsCount={memberClubs.length}
          eventsCount={upcomingEvents.length + pastEvents.length}
          friendsCount={friends.length}
          followersCount={followersCount}
          onFriendsPress={() => router.push("/profile/friends")}
        />

        {/* 4. Bio Section */}
        <BioSection profile={profile} />

        {/* 5. Officer Dashboard (if applicable) */}
        <OfficerDashboard roles={officerRoles} />

        {/* 6. Friends Preview */}
        <FriendsRow friends={friends} onViewAll={() => router.push("/profile/friends")} />

        {/* 7. Clubs Preview */}
        <ClubsRow clubs={memberClubs} />

        {/* 8. Achievements */}
        <View className="flex-row items-center justify-between px-5 mb-4">
          <Text className="text-[18px] font-h1" style={{ color: currentTheme.text }}>Achievements</Text>
          <Pressable onPress={() => router.push("/profile/achievements")}>
            <Text className="text-[14px] font-button" style={{ color: currentTheme.primary }}>View All</Text>
          </Pressable>
        </View>

        <AchievementsRow achievements={achievements} />

        {/* 9. Events History (Upcoming & Past) */}
        <ProfileEventsSection upcomingEvents={upcomingEvents} pastEvents={pastEvents} />

      </ScrollView>

      {/* Share Profile Sheet */}
      <ShareProfileSheet
        visible={shareSheetVisible}
        onClose={() => setShareSheetVisible(false)}
        userId={profile?.id || ""}
      />

      {/* Customize Profile Modal */}
      {profile && (
        <CustomizeProfileModal
          visible={customizeModalVisible}
          onClose={() => setCustomizeModalVisible(false)}
          profile={profile}
          onUpdate={fetchData}
        />
      )}
    </SafeAreaView>
  );
}
