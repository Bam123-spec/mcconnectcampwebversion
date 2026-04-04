import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { supabase } from "@/lib/supabase";
import { appConfig, isEmailDomainAllowed } from "@/lib/appConfig";

export default function Signup() {
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!fullName || !email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (!appConfig.allowSelfSignup) {
            Alert.alert(
                "Signup Disabled",
                `This app is provisioned by your school. Contact ${appConfig.supportEmail} or your campus admin for access.`
            );
            return;
        }

        if (!isEmailDomainAllowed(email)) {
            const allowedDomains = appConfig.allowedEmailDomains.join(", ");
            Alert.alert(
                "Restricted Signup",
                allowedDomains
                    ? `Use a school email address from one of these domains: ${allowedDomains}.`
                    : "This email domain is not allowed for self-service signup."
            );
            return;
        }

        setLoading(true);

        // 1. Sign up user
        const { data: { session, user }, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (signUpError) {
            Alert.alert("Error", signUpError.message);
            setLoading(false);
            return;
        }

        if (user) {
            // 2. Create profile
            const { error: profileError } = await supabase
                .from("profiles")
                .insert([
                    {
                        id: user.id,
                        full_name: fullName,
                        email,
                        role: "student",
                        avatar_url: `https://ui-avatars.com/api/?name=${fullName}&background=random`,
                        updated_at: new Date(),
                    },
                ]);

            if (profileError) {
                console.error("Error creating profile:", profileError);
                Alert.alert("Error", "Account created but profile setup failed.");
            } else {
                Alert.alert("Success", "Account created successfully!");
                // Auth state listener will handle redirect
            }
        }

        setLoading(false);
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F7F5FC]">
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}>
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "timing", duration: 700 }}
                >
                    <View className="items-center mb-8">
                        <View className="h-16 w-16 rounded-2xl bg-[#F3E8FF] items-center justify-center mb-4 border border-[#E9E3FF]">
                            <Ionicons name="person-add" size={32} color="#6D28D9" />
                        </View>
                        <Text className="text-[28px] font-bold text-[#1A1A1A]">Create Account</Text>
                        <Text className="text-[15px] text-[#7A7A7A] mt-1">Join the student community today</Text>
                    </View>

                    <View className="bg-white p-6 rounded-[24px] shadow-sm shadow-black/5 border border-[#F0F0F0]">
                        <View className="mb-4">
                            <Text className="text-[13px] font-bold text-[#1A1A1A] mb-2 ml-1">Full Name</Text>
                            <View className="flex-row items-center bg-[#F9FAFB] border border-[#E5E7EB] rounded-[16px] px-4 h-[52px]">
                                <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                                <TextInput
                                    className="flex-1 ml-3 text-[15px] text-[#1A1A1A]"
                                    placeholder="John Doe"
                                    placeholderTextColor="#9CA3AF"
                                    value={fullName}
                                    onChangeText={setFullName}
                                />
                            </View>
                        </View>

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
                            onPress={handleSignup}
                            disabled={loading}
                            className={`h-[52px] rounded-[16px] items-center justify-center shadow-md shadow-purple-200 ${loading ? "bg-[#8B5CF6]" : "bg-[#6D28D9]"}`}
                        >
                            {loading ? (
                                <Text className="text-white font-bold">Creating Account...</Text>
                            ) : (
                                <Text className="text-[16px] font-bold text-white">Sign Up</Text>
                            )}
                        </Pressable>
                    </View>

                    <View className="flex-row justify-center mt-6">
                        <Text className="text-[#7A7A7A]">Already have an account? </Text>
                        <Link href="/login" asChild>
                            <Pressable>
                                <Text className="text-[#6D28D9] font-bold">Sign In</Text>
                            </Pressable>
                        </Link>
                    </View>
                </MotiView>
            </ScrollView>
        </SafeAreaView>
    );
}
