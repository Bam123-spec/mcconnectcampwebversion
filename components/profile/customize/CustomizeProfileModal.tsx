import React, { useState } from "react";
import { View, Text, Modal, Pressable, SafeAreaView, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Profile } from "@/types/database";
import { updateProfileCustomization } from "@/lib/profileService";
import ProfilePreview from "./ProfilePreview";
import AvatarGrid from "./AvatarGrid";
import FlairSelector from "./FlairSelector";
import FrameSelector from "./FrameSelector";
import ThemeSelector from "./ThemeSelector";
import { pickImage, uploadAvatar } from "@/lib/imageService";

interface CustomizeProfileModalProps {
    visible: boolean;
    onClose: () => void;
    profile: Profile;
    onUpdate: () => void;
}

type Tab = "Avatar" | "Flair" | "Frame" | "Theme";

export default function CustomizeProfileModal({ visible, onClose, profile, onUpdate }: CustomizeProfileModalProps) {
    const [activeTab, setActiveTab] = useState<Tab>("Avatar");
    const [saving, setSaving] = useState(false);

    // Temporary state for preview
    const [tempAvatarType, setTempAvatarType] = useState<'photo' | 'preset'>(profile.avatar_type || 'photo');
    const [tempAvatarPreset, setTempAvatarPreset] = useState<string | null>(profile.avatar_preset || null);
    const [tempFlair, setTempFlair] = useState<string | null>(profile.flair || null);
    const [tempFrame, setTempFrame] = useState<string | null>(profile.frame_style || null);
    const [tempTheme, setTempTheme] = useState<string | null>(profile.theme_style || null);
    const [newAvatarBase64, setNewAvatarBase64] = useState<string | null>(null);
    const [previewUri, setPreviewUri] = useState<string | null>(null);

    const handlePickImage = async () => {
        const base64 = await pickImage();
        if (base64) {
            setNewAvatarBase64(base64);
            setTempAvatarType('photo');
            setPreviewUri(`data:image/png;base64,${base64}`); // Immediate preview
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            let avatarUrl = profile.avatar_url;

            // Upload new avatar if selected
            if (tempAvatarType === 'photo' && newAvatarBase64) {
                const uploadedUrl = await uploadAvatar(newAvatarBase64, profile.id);
                if (uploadedUrl) {
                    avatarUrl = uploadedUrl;
                } else {
                    throw new Error("Failed to upload avatar");
                }
            }

            await updateProfileCustomization(profile.id, {
                avatar_type: tempAvatarType,
                avatar_preset: tempAvatarPreset,
                avatar_url: avatarUrl, // Save the new URL
                flair: tempFlair,
                frame_style: tempFrame,
                theme_style: tempTheme,
            });
            onUpdate();
            onClose();
        } catch (error) {
            Alert.alert("Error", "Failed to save profile changes.");
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <SafeAreaView className="flex-1 bg-gray-50">
                {/* Header */}
                <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
                    <Pressable onPress={onClose}>
                        <Text className="text-[16px] font-medium text-gray-500">Cancel</Text>
                    </Pressable>
                    <Text className="text-[16px] font-bold text-gray-900">Customize Profile</Text>
                    <Pressable onPress={handleSave} disabled={saving}>
                        {saving ? (
                            <ActivityIndicator size="small" color="#6D28D9" />
                        ) : (
                            <Text className="text-[16px] font-bold text-[#6D28D9]">Save</Text>
                        )}
                    </Pressable>
                </View>

                {/* Live Preview */}
                <ProfilePreview
                    profile={profile}
                    tempAvatarType={tempAvatarType}
                    tempAvatarPreset={tempAvatarPreset}
                    tempFrame={tempFrame}
                    tempFlair={tempFlair}
                    tempTheme={tempTheme}
                    previewUri={previewUri}
                />

                {/* Tabs */}
                <View className="flex-row px-5 mb-4 gap-4">
                    {(["Avatar", "Flair", "Frame", "Theme"] as Tab[]).map((tab) => (
                        <Pressable
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            className={`pb-2 border-b-2 ${activeTab === tab ? "border-purple-600" : "border-transparent"}`}
                        >
                            <Text className={`text-[14px] font-bold ${activeTab === tab ? "text-gray-900" : "text-gray-400"}`}>
                                {tab}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* Content Area */}
                <View className="flex-1 bg-white">
                    {activeTab === "Avatar" && (
                        <View>
                            <View className="px-5 mb-4">
                                <Pressable
                                    onPress={handlePickImage}
                                    className="flex-row items-center justify-center bg-gray-100 py-3 rounded-xl border border-gray-200 mb-2"
                                >
                                    <Ionicons name="camera" size={20} color="#6D28D9" />
                                    <Text className="ml-2 font-bold text-gray-900">Upload Photo</Text>
                                </Pressable>
                                <Text className="text-center text-gray-400 text-[12px] font-medium uppercase tracking-wider mb-2">OR CHOOSE A PRESET</Text>
                            </View>
                            <AvatarGrid
                                selectedPreset={tempAvatarPreset}
                                onSelect={(preset) => {
                                    setTempAvatarType('preset');
                                    setTempAvatarPreset(preset);
                                    setPreviewUri(null); // Clear photo preview
                                }}
                            />
                        </View>
                    )}
                    {activeTab === "Flair" && (
                        <FlairSelector
                            selectedFlair={tempFlair}
                            onSelect={setTempFlair}
                        />
                    )}
                    {activeTab === "Frame" && (
                        <FrameSelector
                            selectedFrame={tempFrame}
                            onSelect={setTempFrame}
                        />
                    )}
                    {activeTab === "Theme" && (
                        <ThemeSelector
                            selectedTheme={tempTheme}
                            onSelect={setTempTheme}
                        />
                    )}
                </View>
            </SafeAreaView>
        </Modal>
    );
}
