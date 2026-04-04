import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Switch, TextInput, Alert, ActivityIndicator, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { getProfile, updateProfileCustomization } from "@/lib/profileService";
import { Profile } from "@/types/database";
import CustomizeProfileModal from "@/components/profile/customize/CustomizeProfileModal";
import { useTheme } from "@/context/ThemeContext";

export default function SettingsScreen() {
    const router = useRouter();
    const { darkMode, toggleDarkMode, theme: currentTheme } = useTheme();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    // Form State
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState(""); // Read-only usually
    const [username, setUsername] = useState(""); // Placeholder if not in DB

    // Preferences State
    const [notifications, setNotifications] = useState(true);

    const [customizeModalVisible, setCustomizeModalVisible] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setEmail(user.email || "");
                const profileData = await getProfile(user.id);
                if (profileData) {
                    setProfile(profileData);
                    setFullName(profileData.full_name || "");
                    // setUsername(profileData.username || ""); // If username exists
                }
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!profile) return;
        setSaving(true);
        try {
            await updateProfileCustomization(profile.id, {
                full_name: fullName,
                // username: username,
            });
            Alert.alert("Success", "Profile updated successfully");
        } catch (error) {
            Alert.alert("Error", "Failed to update profile");
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Log Out",
                    style: "destructive",
                    onPress: async () => {
                        setLoggingOut(true);
                        try {
                            await supabase.auth.signOut();
                            router.replace("/(auth)/login");
                        } catch (error) {
                            Alert.alert("Error", "Failed to log out");
                            console.error(error);
                            setLoggingOut(false);
                        }
                    },
                },
            ]
        );
    };

    const SectionHeader = ({ title }: { title: string }) => (
        <Text 
            className="text-[13px] font-bold uppercase tracking-wider mb-3 px-5 mt-6"
            style={{ color: currentTheme.textMuted }}
        >
            {title}
        </Text>
    );

    const SettingItem = ({
        label,
        value,
        onPress,
        icon,
        color = currentTheme.primary,
        isDestructive = false
    }: {
        label: string;
        value?: string;
        onPress?: () => void;
        icon: keyof typeof Ionicons.glyphMap;
        color?: string;
        isDestructive?: boolean;
    }) => (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => ({
                backgroundColor: pressed && onPress ? currentTheme.surfaceSelected : currentTheme.surface,
                borderBottomColor: currentTheme.border,
                borderBottomWidth: 1,
            })}
            className="flex-row items-center justify-between px-5 py-4"
        >
            <View className="flex-row items-center gap-3">
                <View 
                    className="h-8 w-8 rounded-full items-center justify-center" 
                    style={{ backgroundColor: isDestructive ? currentTheme.destructiveBg : currentTheme.iconContainer }}
                >
                    <Ionicons name={icon} size={16} color={isDestructive ? "#EF4444" : color} />
                </View>
                <Text 
                    className="text-[16px] font-medium"
                    style={{ color: isDestructive ? "#EF4444" : currentTheme.text }}
                >
                    {label}
                </Text>
            </View>
            {value && <Text className="text-[14px]" style={{ color: currentTheme.textLight }}>{value}</Text>}
            {onPress && !value && <Ionicons name="chevron-forward" size={18} color={currentTheme.textLight} />}
        </Pressable>
    );

    const InputItem = ({
        label,
        value,
        onChangeText,
        placeholder,
        editable = true
    }: {
        label: string;
        value: string;
        onChangeText?: (text: string) => void;
        placeholder?: string;
        editable?: boolean;
    }) => (
        <View 
            className="px-5 py-3"
            style={{ 
                backgroundColor: currentTheme.surface, 
                borderBottomColor: currentTheme.border,
                borderBottomWidth: 1 
            }}
        >
            <Text className="text-[12px] font-medium mb-1" style={{ color: currentTheme.textMuted }}>{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={currentTheme.textLight}
                editable={editable}
                className="text-[16px] font-medium"
                style={{ color: editable ? currentTheme.text : currentTheme.textLight }}
            />
        </View>
    );

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center" style={{ backgroundColor: currentTheme.bg }}>
                <ActivityIndicator size="large" color={currentTheme.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: currentTheme.bg }} edges={["top"]}>
            <StatusBar style={darkMode ? "light" : "dark"} />
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View 
                className="flex-row items-center justify-between px-5 py-3"
                style={{ 
                    backgroundColor: currentTheme.headerBg, 
                    borderBottomColor: currentTheme.border,
                    borderBottomWidth: 1
                }}
            >
                <Pressable 
                    onPress={() => router.back()} 
                    className="h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: darkMode ? "#374151" : "#F9FAFB" }}
                >
                    <Ionicons name="arrow-back" size={24} color={currentTheme.text} />
                </Pressable>
                <Text className="text-[18px] font-bold" style={{ color: currentTheme.text }}>Settings</Text>
                <Pressable onPress={handleSaveProfile} disabled={saving}>
                    {saving ? (
                        <ActivityIndicator size="small" color={currentTheme.primary} />
                    ) : (
                        <Text className="text-[16px] font-bold" style={{ color: currentTheme.primary }}>Save</Text>
                    )}
                </Pressable>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>

                {/* Account Section */}
                <SectionHeader title="Account" />
                <View 
                    style={{ 
                        backgroundColor: currentTheme.surface, 
                        borderTopColor: currentTheme.border, 
                        borderBottomColor: currentTheme.border,
                        borderTopWidth: 1,
                        borderBottomWidth: 1
                    }}
                >
                    <View 
                        className="items-center py-6" 
                        style={{ 
                            borderBottomColor: currentTheme.border,
                            borderBottomWidth: 1
                        }}
                    >
                        <View 
                            className="h-24 w-24 rounded-full mb-3 overflow-hidden border-4 shadow-sm"
                            style={{ backgroundColor: currentTheme.bg, borderColor: currentTheme.surfaceSelected }}
                        >
                            {profile?.avatar_url ? (
                                <Image source={{ uri: profile.avatar_url }} className="h-full w-full" />
                            ) : (
                                <View className="h-full w-full items-center justify-center">
                                    <Ionicons name="person" size={40} color={currentTheme.textLight} />
                                </View>
                            )}
                        </View>
                        <Pressable onPress={() => setCustomizeModalVisible(true)}>
                            <Text className="font-bold text-[14px]" style={{ color: currentTheme.primary }}>Change Profile Picture</Text>
                        </Pressable>
                    </View>

                    <InputItem
                        label="Full Name"
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Enter your full name"
                    />
                    <InputItem
                        label="Email"
                        value={email}
                        editable={false}
                    />
                    <SettingItem
                        label="Change Password"
                        icon="lock-closed-outline"
                        onPress={() => Alert.alert("Info", "Password change flow would go here")}
                    />
                </View>

                {/* Preferences Section */}
                <SectionHeader title="Preferences" />
                <View 
                    style={{ 
                        backgroundColor: currentTheme.surface, 
                        borderTopColor: currentTheme.border, 
                        borderBottomColor: currentTheme.border,
                        borderTopWidth: 1,
                        borderBottomWidth: 1
                    }}
                >
                    <View 
                        className="flex-row items-center justify-between px-5 py-4" 
                        style={{ 
                            borderBottomColor: currentTheme.border,
                            borderBottomWidth: 1
                        }}
                    >
                        <View className="flex-row items-center gap-3">
                            <View className="h-8 w-8 rounded-full items-center justify-center" style={{ backgroundColor: currentTheme.iconContainer }}>
                                <Ionicons name="moon-outline" size={16} color={currentTheme.primary} />
                            </View>
                            <Text className="text-[16px] font-medium" style={{ color: currentTheme.text }}>Dark Mode</Text>
                        </View>
                        <Switch
                            value={darkMode}
                            onValueChange={toggleDarkMode}
                            trackColor={{ false: "#E5E7EB", true: currentTheme.primary }}
                        />
                    </View>
                    <View 
                        className="flex-row items-center justify-between px-5 py-4" 
                        style={{ 
                            borderBottomColor: currentTheme.border,
                            borderBottomWidth: 1
                        }}
                    >
                        <View className="flex-row items-center gap-3">
                            <View className="h-8 w-8 rounded-full items-center justify-center" style={{ backgroundColor: currentTheme.iconContainer }}>
                                <Ionicons name="notifications-outline" size={16} color={currentTheme.primary} />
                            </View>
                            <Text className="text-[16px] font-medium" style={{ color: currentTheme.text }}>Notifications</Text>
                        </View>
                        <Switch
                            value={notifications}
                            onValueChange={setNotifications}
                            trackColor={{ false: "#E5E7EB", true: currentTheme.primary }}
                        />
                    </View>
                    <SettingItem
                        label="Language"
                        value="English"
                        icon="language-outline"
                        onPress={() => { }}
                    />
                </View>

                {/* Support Section */}
                <SectionHeader title="Support" />
                <View 
                    style={{ 
                        backgroundColor: currentTheme.surface, 
                        borderTopColor: currentTheme.border, 
                        borderBottomColor: currentTheme.border,
                        borderTopWidth: 1,
                        borderBottomWidth: 1
                    }}
                >
                    <SettingItem
                        label="Contact Support"
                        icon="mail-outline"
                        onPress={() => Alert.alert("Support", "Contact support flow")}
                    />
                    <SettingItem
                        label="Report a Problem"
                        icon="warning-outline"
                        onPress={() => Alert.alert("Report", "Report problem flow")}
                    />
                    <SettingItem
                        label="FAQs"
                        icon="help-circle-outline"
                        onPress={() => { }}
                    />
                </View>

                {/* App Info Section */}
                <SectionHeader title="App Info" />
                <View 
                    style={{ 
                        backgroundColor: currentTheme.surface, 
                        borderTopColor: currentTheme.border, 
                        borderBottomColor: currentTheme.border,
                        borderTopWidth: 1,
                        borderBottomWidth: 1
                    }}
                >
                    <SettingItem
                        label="Version"
                        value="1.0.0"
                        icon="information-circle-outline"
                    />
                    <SettingItem
                        label="Terms of Service"
                        icon="document-text-outline"
                        onPress={() => { }}
                    />
                    <SettingItem
                        label="Privacy Policy"
                        icon="shield-checkmark-outline"
                        onPress={() => { }}
                    />
                </View>

                {/* Logout Button */}
                <View className="mt-8 px-5">
                    <Pressable
                        onPress={handleLogout}
                        disabled={loggingOut}
                        className="flex-row items-center justify-center py-4 rounded-xl border"
                        style={{ backgroundColor: darkMode ? "#450a0a" : "#FEF2F2", borderColor: darkMode ? "#991b1b" : "#FEE2E2" }}
                    >
                        {loggingOut ? (
                            <ActivityIndicator size="small" color="#EF4444" />
                        ) : (
                            <>
                                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                                <Text className="text-[#EF4444] font-bold text-[16px] ml-2">Log Out</Text>
                            </>
                        )}
                    </Pressable>
                    <Text className="text-center text-[12px] mt-4" style={{ color: currentTheme.textLight }}>
                        Officer App v1.0.0
                    </Text>
                </View>

            </ScrollView>

            {/* Customize Profile Modal */}
            {profile && (
                <CustomizeProfileModal
                    visible={customizeModalVisible}
                    onClose={() => setCustomizeModalVisible(false)}
                    profile={profile}
                    onUpdate={fetchProfile}
                />
            )}
        </SafeAreaView>
    );
}
