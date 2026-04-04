import "react-native-gesture-handler";
import "../global.css";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AchievementProvider } from "@/context/AchievementContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { enableFreeze } from "react-native-screens";
import { appConfig } from "@/lib/appConfig";
import { getSessionProfile, hasTenantMembership, SessionProfile } from "@/lib/sessionAccess";

import {
  useFonts,
  Lexend_100Thin,
  Lexend_200ExtraLight,
  Lexend_300Light,
  Lexend_400Regular,
  Lexend_500Medium,
} from "@expo-google-fonts/lexend";

enableFreeze(true);

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionProfile, setSessionProfile] = useState<SessionProfile | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [accessLoading, setAccessLoading] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Lexend_100Thin,
    Lexend_200ExtraLight,
    Lexend_300Light,
    Lexend_400Regular,
    Lexend_500Medium,
  });

  useEffect(() => {
    const loadSessionProfile = async () => {
      setAccessLoading(true);
      const profile = await getSessionProfile();
      setSessionProfile(profile);
      setAccessLoading(false);
    };

    // 1. Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadSessionProfile();
      } else {
        setSessionProfile(null);
      }
      setInitialized(true);
    });

    // 2. Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadSessionProfile();
      } else {
        setSessionProfile(null);
        setAccessLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!initialized) return;

    // 3. Handle redirection
    const inAuthGroup = segments[0] === "(auth)";
    const onPendingAccessScreen = segments[0] === "pending-access";
    const requiresTenantMembership = appConfig.requireTenantMembership;
    const hasAccess = !requiresTenantMembership || hasTenantMembership(sessionProfile);

    if (session && accessLoading) {
      return;
    }

    if (session && !hasAccess) {
      if (!onPendingAccessScreen) {
        router.replace("/pending-access");
      }
      return;
    }

    if (session && (inAuthGroup || onPendingAccessScreen)) {
      router.replace("/(tabs)/home");
    } else if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    }
  }, [session, sessionProfile, accessLoading, initialized, segments, router]);

  if (!initialized || !fontsLoaded || (session && accessLoading)) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F7F5FC]">
        <ActivityIndicator size="large" color="#6D28D9" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <AchievementProvider>
        <Stack 
          screenOptions={{ 
            headerShown: false,
            animation: 'slide_from_right', 
            animationDuration: 350,
            fullScreenGestureEnabled: true,
            gestureEnabled: true,
            gestureDirection: 'horizontal'
          }}
        >
          <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
        </Stack>
      </AchievementProvider>
    </ThemeProvider>
  );
}
