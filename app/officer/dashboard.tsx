import React, { useState, useCallback, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { MotiView } from "moti";
import { cssInterop } from "nativewind";
import { useOfficerAccess } from "@/hooks/useOfficerAccess";
import { getOfficerAnalytics, getClubEvents, getClubMembers, getClubAnnouncements } from "@/lib/officerService";
import { getOfficerRoleConfig, getOfficerRoleLabel, hasOfficerCapability } from "@/lib/officerPermissions";
import { Event, Post } from "@/types/database";
import OfficerAccessGuard from "@/components/officer/OfficerAccessGuard";

// Enable className for MotiView
cssInterop(MotiView, { className: "style" });

// --- Constants & Theme ---
const COLORS = {
    primary: "#8B5CF6", // Purple-500
    background: "#F7F5FC",
    white: "#FFFFFF",
    textDark: "#1F2937",
    textMuted: "#6B7280",
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

const QuickActionButton = ({
    icon,
    label,
    color,
    delay,
    onPress,
    disabled,
    hint,
}: {
    icon: any;
    label: string;
    color: string;
    delay: number;
    onPress?: () => void;
    disabled?: boolean;
    hint?: string;
}) => (
    <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", delay }}
        className="flex-1"
    >
        <ScalePressable onPress={disabled ? undefined : onPress} className={`p-4 rounded-[24px] items-center justify-center shadow-sm shadow-black/5 border h-[118px] ${disabled ? "bg-gray-100 border-gray-200 opacity-70" : "bg-white border-gray-100"}`}>
            <View className={`h-12 w-12 rounded-full items-center justify-center mb-3`} style={{ backgroundColor: disabled ? "#E5E7EB" : `${color}20` }}>
                <Ionicons name={icon} size={24} color={disabled ? "#9CA3AF" : color} />
            </View>
            <Text className="text-[13px] font-bold text-gray-800 text-center leading-4">{label}</Text>
            {hint ? <Text className="mt-1 text-[10px] font-medium text-gray-400 text-center">{hint}</Text> : null}
        </ScalePressable>
    </MotiView>
);

const StatCard = ({ label, value, trend, delay }: { label: string; value: string; trend?: string; delay: number }) => (
    <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "spring", delay }}
        className="bg-white p-4 rounded-[20px] shadow-sm shadow-black/5 border border-gray-100 flex-1 mr-3 min-w-[140px]"
    >
        <Text className="text-[12px] font-medium text-gray-500 uppercase mb-1">{label}</Text>
        <Text className="text-[24px] font-bold text-gray-900 mb-1">{value}</Text>
        {trend && (
            <View className="flex-row items-center">
                <Ionicons name="trending-up" size={12} color="#10B981" />
                <Text className="text-[11px] font-bold text-green-500 ml-1">{trend}</Text>
            </View>
        )}
    </MotiView>
);

const SegmentedControl = ({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) => {
    const tabs = ["Overview", "Events", "Members", "Announcements"];
    return (
        <View className="flex-row bg-white p-1 rounded-[16px] border border-gray-100 mb-6">
            {tabs.map((tab) => {
                const isActive = activeTab === tab;
                return (
                    <Pressable
                        key={tab}
                        onPress={() => setActiveTab(tab)}
                        className={`flex-1 py-2 items-center rounded-[12px] ${isActive ? "bg-[#8B5CF6]" : "bg-transparent"}`}
                    >
                        <Text className={`text-[12px] font-bold ${isActive ? "text-white" : "text-gray-500"}`}>
                            {tab}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
};

// --- Tab Content Components ---

const EventsList = ({ events }: { events: Event[] }) => (
    <View className="gap-3">
        {events.length === 0 ? (
            <Text className="text-gray-500 text-center py-4">No events yet.</Text>
        ) : (
            events.map((event) => (
                <View key={event.id} className="bg-white p-4 rounded-[20px] border border-gray-100 flex-row gap-4">
                    <View className="h-16 w-16 bg-purple-50 rounded-[16px] items-center justify-center border border-purple-100">
                        <Text className="text-[18px] font-bold text-purple-600">{event.date ? new Date(event.date).getDate() : "--"}</Text>
                        <Text className="text-[10px] font-bold text-purple-400 uppercase">{event.date ? new Date(event.date).toLocaleString('default', { month: 'short' }) : "TBD"}</Text>
                    </View>
                    <View className="flex-1 justify-center">
                        <Text className="text-[16px] font-bold text-gray-900 mb-1">{event.name}</Text>
                        <Text className="text-[12px] text-gray-500">{event.location} • {event.start_time || "TBD"}</Text>
                    </View>
                </View>
            ))
        )}
    </View>
);

const MembersList = ({ members }: { members: any[] }) => (
    <View className="gap-3">
        {members.length === 0 ? (
            <Text className="text-gray-500 text-center py-4">No members yet.</Text>
        ) : (
            members.map((member) => (
                <View key={member.id} className="bg-white p-3 rounded-[20px] border border-gray-100 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                        <View className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                            {member.profile?.avatar_url ? (
                                <Image source={{ uri: member.profile.avatar_url }} className="h-full w-full" />
                            ) : (
                                <View className="h-full w-full bg-purple-100 items-center justify-center">
                                    <Text className="text-purple-600 font-bold">{member.profile?.full_name?.charAt(0) || "?"}</Text>
                                </View>
                            )}
                        </View>
                        <View>
                            <Text className="text-[14px] font-bold text-gray-900">{member.profile?.full_name || "Unknown"}</Text>
                            <Text className="text-[12px] text-gray-500 capitalize">{getOfficerRoleLabel(member.role)}</Text>
                        </View>
                    </View>
                    <View className={`px-2.5 py-1 rounded-full border ${getOfficerRoleConfig(member.role).tint} ${getOfficerRoleConfig(member.role).border}`}>
                        <Text className={`text-[10px] font-bold uppercase ${getOfficerRoleConfig(member.role).text}`}>{getOfficerRoleLabel(member.role)}</Text>
                    </View>
                </View>
            ))
        )}
    </View>
);

const AnnouncementsList = ({ posts }: { posts: Post[] }) => (
    <View className="gap-3">
        {posts.length === 0 ? (
            <Text className="text-gray-500 text-center py-4">No announcements yet.</Text>
        ) : (
            posts.map((post) => (
                <View key={post.id} className="bg-white p-4 rounded-[20px] border border-gray-100">
                    <Text className="text-[12px] text-gray-400 mb-2">{new Date(post.created_at).toLocaleDateString()}</Text>
                    <Text className="text-[14px] text-gray-800 leading-5">{post.content}</Text>
                </View>
            ))
        )}
    </View>
);


export default function OfficerDashboard() {
    const router = useRouter();
    const { clubId } = useLocalSearchParams();
    const access = useOfficerAccess({
        clubId: typeof clubId === "string" ? clubId : undefined,
        requiredCapabilities: ["viewAnalytics"],
    });
    const { officerClubs, checkOfficerStatus } = access;
    const [activeTab, setActiveTab] = useState("Overview");
    const [selectedClubIndex, setSelectedClubIndex] = useState(0);

    // Data State
    const [analytics, setAnalytics] = useState<any>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [dataLoading, setDataLoading] = useState(false);

    // Effect to select club based on param
    useEffect(() => {
        if (clubId && officerClubs.length > 0) {
            const index = officerClubs.findIndex(c => c.club_id === clubId);
            if (index !== -1) {
                setSelectedClubIndex(index);
            }
        }
    }, [clubId, officerClubs]);

    useEffect(() => {
        if (officerClubs.length === 0) {
            setSelectedClubIndex(0);
            return;
        }

        if (selectedClubIndex >= officerClubs.length) {
            setSelectedClubIndex(0);
        }
    }, [selectedClubIndex, officerClubs.length]);

    const currentClub = officerClubs[selectedClubIndex];
    const currentRole = currentClub?.role || "member";
    const roleConfig = getOfficerRoleConfig(currentRole);
    const canCreateEvents = hasOfficerCapability(currentRole, "createEvents");
    const canManageMembers = hasOfficerCapability(currentRole, "manageMembers");
    const canPostAnnouncements = hasOfficerCapability(currentRole, "postAnnouncements");
    const canScanTickets = hasOfficerCapability(currentRole, "scanTickets");
    const canViewInbox = hasOfficerCapability(currentRole, "viewInbox");

    const fetchClubData = async () => {
        if (!currentClub) return;
        setDataLoading(true);
        try {
            const [analyticsData, eventsData, membersData, postsData] = await Promise.all([
                getOfficerAnalytics(currentClub.club_id),
                getClubEvents(currentClub.club_id),
                getClubMembers(currentClub.club_id),
                getClubAnnouncements(currentClub.club_id)
            ]);

            setAnalytics(analyticsData);
            setEvents(eventsData);
            setMembers(membersData);
            setPosts(postsData);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setDataLoading(false);
        }
    };

    useEffect(() => {
        if (currentClub) {
            fetchClubData();
        }
    }, [currentClub?.club_id]);

    useFocusEffect(
        useCallback(() => {
            checkOfficerStatus();
            if (currentClub) {
                fetchClubData();
            }
        }, [checkOfficerStatus, currentClub])
    );

    const renderDashboardContent = () => {
        if (!currentClub) {
            return (
                <View className="flex-1 items-center justify-center px-6 py-20">
                    <View className="mb-4 h-16 w-16 items-center justify-center rounded-full border border-gray-100 bg-white">
                        <Ionicons name="shield-outline" size={28} color="#9CA3AF" />
                    </View>
                    <Text className="mb-2 text-center text-[18px] font-bold text-gray-900">
                        No Leadership Club Selected
                    </Text>
                    <Text className="text-center text-[14px] leading-6 text-gray-500">
                        Your officer access is active, but the club assignment is still loading. Re-open the
                        dashboard in a moment if this state persists.
                    </Text>
                </View>
            );
        }

        return (
            <ScrollView
                className="flex-1 px-5"
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >

                {/* 1. Header */}
                <View className="mb-2 flex-row items-center justify-between py-4">
                    <View>
                        <View className="mb-1 flex-row items-center gap-2">
                            <View className={`rounded-full border px-2.5 py-0.5 ${roleConfig.tint} ${roleConfig.border}`}>
                                <Text className={`text-[10px] font-bold uppercase ${roleConfig.text}`}>{getOfficerRoleLabel(currentRole)}</Text>
                            </View>
                            <Text className="text-[11px] font-semibold uppercase tracking-[1.2px] text-gray-400">Leadership Console</Text>
                        </View>
                        <Pressable className="flex-row items-center gap-1">
                            <Text className="text-[24px] font-extrabold text-gray-900">{currentClub.name}</Text>
                            {officerClubs.length > 1 && <Ionicons name="chevron-down" size={20} color="#1F2937" />}
                        </Pressable>
                    </View>
                    <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white shadow-sm">
                        <Ionicons name="close" size={20} color="#1F2937" />
                    </Pressable>
                </View>

                {officerClubs.length > 1 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
                        <View className="flex-row gap-2 pr-5">
                            {officerClubs.map((club, index) => {
                                const isActive = index === selectedClubIndex;
                                return (
                                    <Pressable
                                        key={club.officer_id}
                                        onPress={() => {
                                            setSelectedClubIndex(index);
                                            setActiveTab("Overview");
                                        }}
                                        className={`rounded-full border px-4 py-2 ${isActive ? "bg-[#111827] border-[#111827]" : "bg-white border-gray-200"}`}
                                    >
                                        <Text className={`text-[12px] font-bold ${isActive ? "text-white" : "text-gray-700"}`}>
                                            {club.name}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </ScrollView>
                )}

                <View className="mb-6 rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm shadow-black/5">
                    <View className="flex-row items-start justify-between gap-3">
                        <View className="flex-1">
                            <Text className="text-[12px] font-bold uppercase tracking-[1.2px] text-gray-400">
                                Leadership Access
                            </Text>
                            <Text className="mt-1 text-[22px] font-extrabold text-gray-900">
                                {getOfficerRoleLabel(currentRole)}
                            </Text>
                            <Text className="mt-2 text-[13px] leading-5 text-gray-500">
                                {currentRole.toLowerCase().includes("president")
                                    ? "You control officer roles, member operations, announcements, events, and the admin channel for this club."
                                    : currentRole.toLowerCase().includes("vice")
                                        ? "You can run day-to-day club operations and stay in sync with admins, while the President retains the highest level of control."
                                        : "You have a focused leadership workspace with the tools relevant to your role plus direct admin coordination."}
                            </Text>
                        </View>
                        <Pressable
                            onPress={() => canViewInbox && router.push({ pathname: "/officer/messages", params: { clubId: currentClub.club_id } })}
                            className={`rounded-[20px] px-4 py-3 ${canViewInbox ? "bg-[#111827]" : "bg-gray-200"}`}
                        >
                            <Text className={`text-[12px] font-bold uppercase ${canViewInbox ? "text-white" : "text-gray-500"}`}>
                                Leadership Inbox
                            </Text>
                        </Pressable>
                    </View>

                    <View className="mt-4 flex-row flex-wrap gap-2">
                        {[
                            { label: "Analytics", enabled: true },
                            { label: "Members", enabled: canManageMembers },
                            { label: "Roles", enabled: hasOfficerCapability(currentRole, "manageRoles") },
                            { label: "Events", enabled: canCreateEvents },
                            { label: "Announcements", enabled: canPostAnnouncements },
                            { label: "Tickets", enabled: canScanTickets },
                            { label: "Admin Chat", enabled: canViewInbox },
                        ].map((item) => (
                            <View
                                key={item.label}
                                className={`rounded-full border px-3 py-1.5 ${item.enabled ? "border-emerald-200 bg-emerald-50" : "border-gray-200 bg-gray-50"}`}
                            >
                                <Text className={`text-[11px] font-bold uppercase ${item.enabled ? "text-emerald-700" : "text-gray-400"}`}>
                                    {item.label}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* 2. Quick Actions Grid */}
                <Text className="mb-4 text-[16px] font-bold text-gray-900">Quick Actions</Text>
                <View className="flex-row gap-3 mb-3">
                    <QuickActionButton
                        icon="mail-open"
                        label="Inbox"
                        color="#111827"
                        delay={80}
                        disabled={!canViewInbox}
                        hint="Admins"
                        onPress={() => router.push({ pathname: "/officer/messages", params: { clubId: currentClub.club_id } })}
                    />
                    <QuickActionButton
                        icon="calendar"
                        label="Create Event"
                        color="#8B5CF6"
                        delay={100}
                        disabled={!canCreateEvents}
                        hint={canCreateEvents ? "Plan" : "Restricted"}
                        onPress={() => router.push({ pathname: "/officer/events/create", params: { clubId: currentClub.club_id } })}
                    />
                    <QuickActionButton
                        icon="people"
                        label="Manage Members"
                        color="#EC4899"
                        delay={200}
                        disabled={!canManageMembers}
                        hint={hasOfficerCapability(currentRole, "manageRoles") ? "Roles" : canManageMembers ? "Roster" : "President"}
                        onPress={() => router.push({ pathname: "/officer/members/manage", params: { clubId: currentClub.club_id } })}
                    />
                </View>
                <View className="flex-row gap-3 mb-8">
                    <QuickActionButton
                        icon="megaphone"
                        label="Post Update"
                        color="#F59E0B"
                        delay={300}
                        disabled={!canPostAnnouncements}
                        hint={canPostAnnouncements ? "Members" : "Restricted"}
                        onPress={() => router.push({ pathname: "/officer/announcements/create", params: { clubId: currentClub.club_id } })}
                    />
                    <QuickActionButton
                        icon="qr-code"
                        label="Scan Tickets"
                        color="#10B981"
                        delay={400}
                        disabled={!canScanTickets}
                        hint={canScanTickets ? "Check-in" : "Restricted"}
                        onPress={() => router.push("/event-details/scan")} // Using existing scanner for now
                    />
                    <QuickActionButton
                        icon="bar-chart"
                        label="Analytics"
                        color="#2563EB"
                        delay={450}
                        hint="Overview"
                        onPress={() => setActiveTab("Overview")}
                    />
                </View>

                {/* 3. Analytics Preview */}
                <Text className="mb-4 text-[16px] font-bold text-gray-900">Analytics Overview</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8 overflow-visible">
                    <StatCard label="Total Members" value={analytics?.memberCount?.toString() || "0"} trend="+0%" delay={500} />
                    <StatCard label="Avg. Attendance" value={analytics?.avgAttendance?.toString() || "0"} trend="+0%" delay={600} />
                    <StatCard label="Total Events" value={analytics?.eventCount?.toString() || "0"} delay={700} />
                    <StatCard label="Announcements" value={analytics?.postCount?.toString() || "0"} delay={800} />
                </ScrollView>

                {/* 4. Tabs */}
                <SegmentedControl activeTab={activeTab} setActiveTab={setActiveTab} />

                {/* Tab Content */}
                {dataLoading ? (
                    <ActivityIndicator color="#8B5CF6" />
                ) : (
                    <MotiView
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        className="min-h-[200px]"
                    >
                        {activeTab === "Overview" && (
                            <View>
                                <Text className="text-[16px] font-bold text-gray-900 mb-4">Recent Activity</Text>
                                <EventsList events={events.slice(0, 2)} />
                                <View className="h-4" />
                                <AnnouncementsList posts={posts.slice(0, 2)} />
                            </View>
                        )}
                        {activeTab === "Events" && <EventsList events={events} />}
                        {activeTab === "Members" && <MembersList members={members} />}
                        {activeTab === "Announcements" && <AnnouncementsList posts={posts} />}
                    </MotiView>
                )}

            </ScrollView>
        );
    };

    return (
        <OfficerAccessGuard
            loading={access.loading}
            allowed={access.canAccess}
            title="Leadership Dashboard Restricted"
            description={access.deniedReason}
        >
            <SafeAreaView className="flex-1 bg-[#F7F5FC]" edges={["top"]}>
                <Stack.Screen options={{ headerShown: false }} />
                {renderDashboardContent()}
            </SafeAreaView>
        </OfficerAccessGuard>
    );
}
