import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { supabase } from "@/lib/supabase";
import { appConfig, isEmailDomainAllowed } from "@/lib/appConfig";

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (!isEmailDomainAllowed(email)) {
            const allowedDomains = appConfig.allowedEmailDomains.join(", ");
            Alert.alert(
                "Restricted Login",
                allowedDomains
                    ? `Use a licensed school email address. Allowed domains: ${allowedDomains}.`
                    : "This account is not allowed to sign in here."
            );
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            Alert.alert("Error", error.message);
        } else {
            // Auth state listener in _layout.tsx will handle redirect
        }
        setLoading(false);
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F7F5FC] justify-center px-6">
            <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 700 }}
            >
                <View className="items-center mb-10">
                    <View className="h-20 w-20 rounded-2xl bg-[#6D28D9] items-center justify-center mb-4 shadow-lg shadow-purple-200">
                        <Ionicons name="school" size={40} color="white" />
                    </View>
                    <Text className="text-[28px] font-bold text-[#1A1A1A]">Welcome Back</Text>
                    <Text className="text-[15px] text-[#7A7A7A] mt-1">Sign in to continue your journey</Text>
                </View>

                <View className="bg-white p-6 rounded-[24px] shadow-sm shadow-black/5 border border-[#F0F0F0]">
                    <View className="mb-4">
                        <Text className="text-[13px] font-bold text-[#1A1A1A] mb-2 ml-1">Email Address</Text>
                        <View className="flex-row items-center bg-[#F9FAFB] border border-[#E5E7EB] rounded-[16px] px-4 h-[52px]">
                            <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                            <TextInput
                                className="flex-1 ml-3 text-[15px] text-[#1A1A1A]"
                                placeholder="student@college.edu"
                                placeholderTextColor="#9CA3AF"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>
                    </View>

                    <View className="mb-6">
                        <Text className="text-[13px] font-bold text-[#1A1A1A] mb-2 ml-1">Password</Text>
                        <View className="flex-row items-center bg-[#F9FAFB] border border-[#E5E7EB] rounded-[16px] px-4 h-[52px]">
                            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                            <TextInput
                                className="flex-1 ml-3 text-[15px] text-[#1A1A1A]"
                                placeholder="••••••••"
                                placeholderTextColor="#9CA3AF"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>
                    </View>

                    <Pressable
                        onPress={handleLogin}
                        disabled={loading}
                        className={`h-[52px] rounded-[16px] items-center justify-center shadow-md shadow-purple-200 ${loading ? "bg-[#8B5CF6]" : "bg-[#6D28D9]"}`}
                    >
                        {loading ? (
                            <Text className="text-white font-bold">Signing in...</Text>
                        ) : (
                            <Text className="text-[16px] font-bold text-white">Sign In</Text>
                        )}
                    </Pressable>
                </View>

                <View className="flex-row justify-center mt-6">
                    <Text className="text-[#7A7A7A]">Don't have an account? </Text>
                    <Link href="/signup" asChild>
                        <Pressable>
                            <Text className="text-[#6D28D9] font-bold">Sign Up</Text>
                        </Pressable>
                    </Link>
                </View>
            </MotiView>
        </SafeAreaView>
    );
}
