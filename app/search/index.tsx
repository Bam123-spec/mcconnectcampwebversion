import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, FlatList, Pressable, ActivityIndicator, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import { searchUsers } from "@/lib/profileService";
import { searchClubs } from "@/lib/clubService";
import { searchEvents } from "@/lib/eventService";
import { Profile, Club, Event } from "@/types/database";
import UserResultItem from "@/components/search/UserResultItem";

const RECENT_SEARCHES_KEY = "recent_searches";
const SEARCH_CACHE_TTL_MS = 5 * 60 * 1000;

type SearchCacheEntry = {
    timestamp: number;
    users: Profile[];
    clubs: Club[];
    events: Event[];
};

export default function SearchScreen() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [userResults, setUserResults] = useState<Profile[]>([]);
    const [clubResults, setClubResults] = useState<Club[]>([]);
    const [eventResults, setEventResults] = useState<Event[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const searchCacheRef = useRef<Record<string, SearchCacheEntry>>({});
    const requestIdRef = useRef(0);

    useEffect(() => {
        getCurrentUser();
        loadRecentSearches();
    }, []);

    const getCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setCurrentUserId(user.id);
    };

    const loadRecentSearches = async () => {
        try {
            const saved = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
            if (saved) {
                setRecentSearches(JSON.parse(saved));
            }
        } catch (error) {
            console.error("Failed to load recent searches", error);
        }
    };

    const saveRecentSearch = async (text: string) => {
        if (!text.trim()) return;
        try {
            let updated = [text, ...recentSearches.filter(s => s !== text)];
            if (updated.length > 8) updated = updated.slice(0, 8);
            setRecentSearches(updated);
            await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error("Failed to save recent search", error);
        }
    };

    const removeRecentSearch = async (text: string) => {
        try {
            const updated = recentSearches.filter(s => s !== text);
            setRecentSearches(updated);
            await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error("Failed to remove recent search", error);
        }
    };

    const clearRecentSearches = async () => {
        try {
            setRecentSearches([]);
            await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
        } catch (error) {
            console.error("Failed to clear recent searches", error);
        }
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim().length >= 2 && currentUserId) {
                performSearch(query, currentUserId);
            } else {
                setUserResults([]);
                setClubResults([]);
                setEventResults([]);
            }
        }, 450);

        return () => clearTimeout(timer);
    }, [query, currentUserId]);

    const performSearch = async (text: string, userId: string) => {
        const normalizedQuery = text.trim().toLowerCase();
        if (normalizedQuery.length < 2) return;

        const cached = searchCacheRef.current[normalizedQuery];
        if (cached && Date.now() - cached.timestamp < SEARCH_CACHE_TTL_MS) {
            setUserResults(cached.users);
            setClubResults(cached.clubs);
            setEventResults(cached.events);
            setLoading(false);
            return;
        }

        const requestId = ++requestIdRef.current;
        setLoading(true);
        try {
            const [users, clubs, events] = await Promise.all([
                searchUsers(normalizedQuery, userId),
                searchClubs(normalizedQuery),
                searchEvents(normalizedQuery)
            ]);

            if (requestId !== requestIdRef.current) {
                return;
            }

            searchCacheRef.current[normalizedQuery] = {
                timestamp: Date.now(),
                users,
                clubs,
                events,
            };
            setUserResults(users);
            setClubResults(clubs);
            setEventResults(events);
        } catch (error) {
            console.error(error);
        } finally {
            if (requestId === requestIdRef.current) {
                setLoading(false);
            }
        }
    };

    const onQueryChange = (text: string) => {
        setQuery(text);
    };

    const handleResultPress = () => {
        saveRecentSearch(query);
    };

    const renderSectionHeader = (title: string, count: number) => (
        <View className="flex-row items-center justify-between px-5 py-2 mt-2">
            <Text className="text-[14px] font-bold text-gray-900">{title}</Text>
            <Text className="text-[12px] font-medium text-gray-500">{count} found</Text>
        </View>
    );

    const ClubResultItem = ({ club }: { club: Club }) => (
        <Pressable
            onPress={() => {
                handleResultPress();
                router.push(`/clubs/${club.id}`);
            }}
            className="flex-row items-center gap-3 px-5 py-3 bg-white border-b border-gray-50"
        >
            <View className="h-10 w-10 rounded-full bg-gray-100 items-center justify-center overflow-hidden border border-gray-100">
                {club.cover_image_url ? (
                    <Image source={{ uri: club.cover_image_url }} className="h-full w-full" />
                ) : (
                    <Text className="text-[14px] font-bold text-gray-500">{club.name.charAt(0)}</Text>
                )}
            </View>
            <View>
                <Text className="text-[14px] font-bold text-gray-900">{club.name}</Text>
                <Text className="text-[12px] text-gray-500">{club.member_count || 0} members</Text>
            </View>
        </Pressable>
    );

    const EventResultItem = ({ event }: { event: Event }) => {
        const eventDay = event.day || event.date || new Date().toISOString().split('T')[0];
        return (
        <Pressable
            onPress={() => {
                handleResultPress();
                router.push(`/event-details/${event.id}`);
            }}
            className="flex-row items-center gap-3 px-5 py-3 bg-white border-b border-gray-50"
        >
            <View className="h-10 w-10 rounded-xl bg-purple-50 items-center justify-center border border-purple-100">
                <Text className="text-[10px] font-bold text-purple-700 uppercase">
                    {new Date(eventDay).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </Text>
            </View>
            <View>
                <Text className="text-[14px] font-bold text-gray-900">{event.name}</Text>
                <Text className="text-[12px] text-gray-500">{event.location}</Text>
            </View>
        </Pressable>
        );
    };

    const hasResults = userResults.length > 0 || clubResults.length > 0 || eventResults.length > 0;

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header with Search Bar */}
            <View className="flex-row items-center gap-3 px-5 py-2 border-b border-gray-100 pb-4">
                <Pressable onPress={() => router.back()} className="p-1 -ml-2">
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </Pressable>

                <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-3 h-[44px]">
                    <Ionicons name="search" size={20} color="#9CA3AF" />
                    <TextInput
                        value={query}
                        onChangeText={onQueryChange}
                        placeholder="Search users, clubs, events..."
                        placeholderTextColor="#9CA3AF"
                        className="flex-1 ml-2 text-[16px] font-medium text-gray-900 h-full"
                        autoFocus
                        autoCapitalize="none"
                    />
                    {query.length > 0 && (
                        <Pressable onPress={() => onQueryChange("")}>
                            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                        </Pressable>
                    )}
                </View>
            </View>

            {/* Content */}
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="small" color="#6D28D9" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
                    {!hasResults && query.length === 0 && recentSearches.length > 0 ? (
                        <View className="mt-4">
                            <View className="flex-row items-center justify-between px-5 mb-2">
                                <Text className="text-[14px] font-bold text-gray-900">Recent Searches</Text>
                                <Pressable onPress={clearRecentSearches}>
                                    <Text className="text-[12px] font-medium text-purple-600">Clear All</Text>
                                </Pressable>
                            </View>
                            {recentSearches.map((term, index) => (
                                <Pressable
                                    key={index}
                                    onPress={() => setQuery(term)}
                                    className="flex-row items-center justify-between px-5 py-3 bg-white border-b border-gray-50 active:bg-gray-50"
                                >
                                    <View className="flex-row items-center gap-3">
                                        <Ionicons name="time-outline" size={20} color="#9CA3AF" />
                                        <Text className="text-[15px] text-gray-700">{term}</Text>
                                    </View>
                                    <Pressable onPress={() => removeRecentSearch(term)} hitSlop={10}>
                                        <Ionicons name="close" size={18} color="#D1D5DB" />
                                    </Pressable>
                                </Pressable>
                            ))}
                        </View>
                    ) : !hasResults && query.length >= 2 ? (
                        <View className="items-center justify-center py-20 px-10">
                            <View className="h-16 w-16 bg-gray-50 rounded-full items-center justify-center mb-4">
                                <Ionicons name="search-outline" size={32} color="#D1D5DB" />
                            </View>
                            <Text className="text-gray-900 font-bold text-[16px] mb-1">No results found</Text>
                            <Text className="text-gray-500 text-center">
                                We couldn't find anything matching "{query}"
                            </Text>
                        </View>
                    ) : !hasResults ? (
                        <View className="items-center justify-center py-20 px-10">
                            <View className="h-16 w-16 bg-gray-50 rounded-full items-center justify-center mb-4">
                                <Ionicons name="grid-outline" size={32} color="#D1D5DB" />
                            </View>
                            <Text className="text-gray-900 font-bold text-[16px] mb-1">Discover Campus</Text>
                            <Text className="text-gray-500 text-center">
                                Search for friends, clubs, and upcoming events.
                            </Text>
                        </View>
                    ) : (
                        <>
                            {/* Users Section */}
                            {userResults.length > 0 && (
                                <View className="mb-4">
                                    {renderSectionHeader("People", userResults.length)}
                                    {userResults.map(user => (
                                        <UserResultItem key={user.id} user={user} onPress={handleResultPress} />
                                    ))}
                                </View>
                            )}

                            {/* Clubs Section */}
                            {clubResults.length > 0 && (
                                <View className="mb-4">
                                    {renderSectionHeader("Clubs", clubResults.length)}
                                    {clubResults.map(club => (
                                        <ClubResultItem key={club.id} club={club} />
                                    ))}
                                </View>
                            )}

                            {/* Events Section */}
                            {eventResults.length > 0 && (
                                <View className="mb-4">
                                    {renderSectionHeader("Events", eventResults.length)}
                                    {eventResults.map(event => (
                                        <EventResultItem key={event.id} event={event} />
                                    ))}
                                </View>
                            )}
                        </>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
