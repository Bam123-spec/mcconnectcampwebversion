import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { appConfig } from "@/lib/appConfig";

export default function PendingAccessScreen() {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to sign out.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F5FC] px-6 justify-center">
      <View className="bg-white rounded-[28px] p-7 border border-[#F0F0F0] shadow-sm shadow-black/5">
        <View className="h-16 w-16 rounded-2xl bg-[#EEF2FF] items-center justify-center mb-5">
          <Ionicons name="shield-checkmark-outline" size={30} color="#4F46E5" />
        </View>
        <Text className="text-[26px] font-bold text-[#111827] mb-2">Access Pending</Text>
        <Text className="text-[15px] leading-6 text-[#6B7280] mb-6">
          This account is signed in, but it is not assigned to a licensed school tenant yet. A college admin
          needs to provision your access before you can use the app.
        </Text>

        <View className="rounded-[18px] bg-[#F8FAFC] border border-[#E5E7EB] px-4 py-3 mb-5">
          <Text className="text-[12px] uppercase tracking-wide font-bold text-[#6B7280] mb-1">Support</Text>
          <Text className="text-[14px] font-medium text-[#111827]">{appConfig.supportEmail}</Text>
        </View>

        <Pressable
          onPress={handleSignOut}
          disabled={loading}
          className={`h-[52px] rounded-[16px] items-center justify-center ${loading ? "bg-[#A78BFA]" : "bg-[#6D28D9]"}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-[16px] font-bold text-white">Sign Out</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

