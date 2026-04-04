import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type OfficerAccessGuardProps = {
  loading: boolean;
  allowed: boolean;
  title: string;
  description: string;
  children: React.ReactNode;
};

export default function OfficerAccessGuard({
  loading,
  allowed,
  title,
  description,
  children,
}: OfficerAccessGuardProps) {
  const router = useRouter();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F7F5FC]">
        <ActivityIndicator color="#8B5CF6" />
      </View>
    );
  }

  if (allowed) {
    return <>{children}</>;
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F7F5FC]" edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 px-6 py-6">
        <Pressable
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center rounded-full bg-white border border-gray-100"
        >
          <Ionicons name="arrow-back" size={22} color="#1F2937" />
        </Pressable>

        <View className="mt-20 items-center rounded-[32px] border border-white/80 bg-white px-6 py-10 shadow-sm shadow-black/5">
          <View className="mb-5 h-20 w-20 items-center justify-center rounded-full bg-[#F2EDFF]">
            <Ionicons name="shield-half-outline" size={34} color="#8B5CF6" />
          </View>
          <Text className="text-center text-[22px] font-bold text-gray-900">{title}</Text>
          <Text className="mt-3 text-center text-[14px] leading-6 text-gray-500">{description}</Text>

          <Pressable
            onPress={() => router.replace("/(tabs)/profile")}
            className="mt-6 rounded-full bg-[#111827] px-5 py-3"
          >
            <Text className="text-[12px] font-bold uppercase text-white">Back to Profile</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
