import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { getProfile, updateProfileCustomization } from "@/lib/profileService";
import AvatarRenderer, { AvatarConfig } from "@/components/avatar/AvatarRenderer";
import { SKIN_TONES } from "@/components/avatar/assets/SkinLayer";
import { HAIR_STYLES, HAIR_COLORS } from "@/components/avatar/assets/Hair";
import { BEARD_STYLES } from "@/components/avatar/assets/Beard";
import { GLASSES_STYLES } from "@/components/avatar/assets/Glasses";
import { HAT_STYLES } from "@/components/avatar/assets/Hat";
import { EYE_STYLES } from "@/components/avatar/assets/Eyes";
import { MOUTH_STYLES } from "@/components/avatar/assets/Mouth";
import { CLOTHING_STYLES } from "@/components/avatar/assets/Clothing";
import { BACKGROUND_OPTIONS } from "@/components/avatar/assets/Background";

export default function EditAvatarScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState<AvatarConfig>({});

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const profile = await getProfile(user.id);
            if (profile?.avatar_config) {
                setConfig(profile.avatar_config);
            }
        } catch (error) {
            console.error("Error fetching avatar config:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await updateProfileCustomization(user.id, {
                avatar_config: config,
                avatar_type: 'photo',
            });

            router.back();
        } catch (error) {
            console.error("Error saving avatar:", error);
            Alert.alert("Error", "Failed to save avatar.");
        } finally {
            setSaving(false);
        }
    };

    const updateConfig = (key: keyof AvatarConfig, value: string) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <View className="mb-6">
            <Text className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-5">{title}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                {children}
            </ScrollView>
        </View>
    );

    const Option = ({
        selected,
        onPress,
        label,
        color,
        preview
    }: {
        selected: boolean,
        onPress: () => void,
        label?: string,
        color?: string,
        preview?: React.ReactNode
    }) => (
        <Pressable
            onPress={onPress}
            className={`mr-3 items-center justify-center rounded-xl border-2 ${selected ? "border-purple-600 bg-purple-50" : "border-gray-200 bg-white"}`}
            style={{ width: 70, height: 70 }}
        >
            {color ? (
                <View className="h-10 w-10 rounded-full border border-gray-200" style={{ backgroundColor: color }} />
            ) : preview ? (
                <View className="h-12 w-12 pointer-events-none">
                    {preview}
                </View>
            ) : (
                <Text className={`text-xs font-medium text-center ${selected ? "text-purple-700" : "text-gray-600"}`}>
                    {label}
                </Text>
            )}
        </Pressable>
    );

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#6D28D9" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
            {/* Header */}
            <View className="px-5 py-2 flex-row items-center justify-between border-b border-gray-100 pb-4">
                <Pressable onPress={() => router.back()} className="p-2 -ml-2 rounded-full bg-gray-50">
                    <Ionicons name="close" size={24} color="#1F2937" />
                </Pressable>
                <Text className="text-lg font-bold text-gray-900">Customize Avatar</Text>
                <Pressable onPress={handleSave} disabled={saving} className="bg-purple-600 px-4 py-2 rounded-full">
                    {saving ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Text className="text-white font-bold text-sm">Save</Text>
                    )}
                </Pressable>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Live Preview */}
                <View className="items-center justify-center py-8 bg-gray-50 mb-6">
                    <View className="shadow-xl shadow-purple-200/50">
                        <AvatarRenderer config={config} size={220} />
                    </View>
                </View>

                {/* Skin Tone */}
                <Section title="Skin Tone">
                    {SKIN_TONES.map(tone => (
                        <Option
                            key={tone}
                            selected={config.skin === tone}
                            onPress={() => updateConfig("skin", tone)}
                            color={tone}
                        />
                    ))}
                </Section>

                {/* Hair Style */}
                <Section title="Hair Style">
                    {HAIR_STYLES.map(style => (
                        <Option
                            key={style}
                            selected={config.hairStyle === style}
                            onPress={() => updateConfig("hairStyle", style)}
                            label={style.replace("_", " ")}
                            preview={<AvatarRenderer config={{ ...config, hairStyle: style, background: 'transparent' }} size={48} />}
                        />
                    ))}
                </Section>

                {/* Hair Color */}
                <Section title="Hair Color">
                    {HAIR_COLORS.map(color => (
                        <Option
                            key={color}
                            selected={config.hairColor === color}
                            onPress={() => updateConfig("hairColor", color)}
                            color={color}
                        />
                    ))}
                </Section>

                {/* Eyes */}
                <Section title="Eyes">
                    {EYE_STYLES.map(style => (
                        <Option
                            key={style}
                            selected={config.eyes === style}
                            onPress={() => updateConfig("eyes", style)}
                            label={style}
                            preview={<AvatarRenderer config={{ ...config, eyes: style, background: 'transparent' }} size={48} />}
                        />
                    ))}
                </Section>

                {/* Mouth */}
                <Section title="Mouth">
                    {MOUTH_STYLES.map(style => (
                        <Option
                            key={style}
                            selected={config.mouth === style}
                            onPress={() => updateConfig("mouth", style)}
                            label={style}
                            preview={<AvatarRenderer config={{ ...config, mouth: style, background: 'transparent' }} size={48} />}
                        />
                    ))}
                </Section>

                {/* Beard */}
                <Section title="Beard">
                    {BEARD_STYLES.map(style => (
                        <Option
                            key={style}
                            selected={config.beard === style}
                            onPress={() => updateConfig("beard", style)}
                            label={style}
                            preview={<AvatarRenderer config={{ ...config, beard: style, background: 'transparent' }} size={48} />}
                        />
                    ))}
                </Section>

                {/* Clothing */}
                <Section title="Clothing">
                    {CLOTHING_STYLES.map(style => (
                        <Option
                            key={style}
                            selected={config.clothing === style}
                            onPress={() => updateConfig("clothing", style)}
                            label={style}
                            preview={<AvatarRenderer config={{ ...config, clothing: style, background: 'transparent' }} size={48} />}
                        />
                    ))}
                </Section>

                {/* Glasses */}
                <Section title="Glasses">
                    {GLASSES_STYLES.map(style => (
                        <Option
                            key={style}
                            selected={config.glasses === style}
                            onPress={() => updateConfig("glasses", style)}
                            label={style}
                            preview={<AvatarRenderer config={{ ...config, glasses: style, background: 'transparent' }} size={48} />}
                        />
                    ))}
                </Section>

                {/* Hat */}
                <Section title="Hat">
                    {HAT_STYLES.map(style => (
                        <Option
                            key={style}
                            selected={config.hat === style}
                            onPress={() => updateConfig("hat", style)}
                            label={style}
                            preview={<AvatarRenderer config={{ ...config, hat: style, background: 'transparent' }} size={48} />}
                        />
                    ))}
                </Section>

                {/* Background */}
                <Section title="Background">
                    {BACKGROUND_OPTIONS.map(bg => (
                        <Option
                            key={bg}
                            selected={config.background === bg}
                            onPress={() => updateConfig("background", bg)}
                            label={bg.replace("solid_", "").replace("gradient_", "")}
                            preview={<AvatarRenderer config={{ ...config, background: bg, hairStyle: 'bald', beard: 'none', glasses: 'none', hat: 'none' }} size={48} />}
                        />
                    ))}
                </Section>

                <View className="h-20" />
            </ScrollView>
        </SafeAreaView>
    );
}
