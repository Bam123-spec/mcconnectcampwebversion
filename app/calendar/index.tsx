import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, ScrollView, Pressable, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, DateData } from "react-native-calendars";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { supabase } from "@/lib/supabase";
import AsyncStorage from '@react-native-async-storage/async-storage';
import PageHeader from "@/components/PageHeader";
import { Event, PersonalEvent } from "@/types/database";
import AddEventModal from "@/components/calendar/AddEventModal";

// Configure notifications
// Notifications.setNotificationHandler({
//     handleNotification: async () => ({
//         shouldShowAlert: true,
//         shouldPlaySound: true,
//         shouldSetBadge: false,
//         shouldShowBanner: true,
//         shouldShowList: true,
//     }),
// });

type CombinedEvent = {
    id: string;
    name: string;
    day: string;
    start_time: string;
    end_time: string;
    location: string;
    type: 'club' | 'personal';
    description?: string;
    alarms?: number[];
};

const CALENDAR_CACHE_TTL_MS = 60 * 1000;
const CALENDAR_EVENT_SELECT = `
  event_id,
  events (
    id,
    name,
    description,
    location,
    date,
    day,
    start_time,
    end_time
  )
`;

export default function CalendarScreen() {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });
    const [events, setEvents] = useState<CombinedEvent[]>([]);
    const [markedDates, setMarkedDates] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [eventToEdit, setEventToEdit] = useState<CombinedEvent | undefined>(undefined);
    const lastFetchedAtRef = useRef(0);

    const fetchEvents = async (force = false) => {
        if (!force && events.length > 0 && Date.now() - lastFetchedAtRef.current < CALENDAR_CACHE_TTL_MS) {
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Fetch Club Events
            const { data: clubData, error: clubError } = await supabase
                .from('event_attendance')
                .select(CALENDAR_EVENT_SELECT)
                .eq('user_id', user.id);

            if (clubError) throw clubError;

            const clubEvents: CombinedEvent[] = clubData
                .map((item: any) => item.events)
                .filter(Boolean)
                .map((e: Event) => ({
                    id: e.id,
                    name: e.name,
                    day: e.day || e.date || new Date().toISOString().split('T')[0],
                    start_time: e.start_time || '00:00',
                    end_time: e.end_time || '23:59',
                    location: e.location,
                    type: 'club',
                    description: e.description || undefined
                }));

            // 2. Fetch Personal Events from AsyncStorage
            const storageKey = `personal_events_${user.id}`;
            const personalEventsJson = await AsyncStorage.getItem(storageKey);
            const personalData: PersonalEvent[] = personalEventsJson ? JSON.parse(personalEventsJson) : [];

            const personalEvents: CombinedEvent[] = personalData.map((e: PersonalEvent) => ({
                id: e.id,
                name: e.title,
                day: e.day,
                start_time: e.start_time,
                end_time: e.end_time,
                location: 'Personal',
                type: 'personal',
                description: e.description || undefined,
                alarms: e.alarms
            }));

            const allEvents = [...clubEvents, ...personalEvents];
            setEvents(allEvents);
            markCalendarDates(allEvents);
            lastFetchedAtRef.current = Date.now();
        } catch (error) {
            console.error("Error fetching calendar events:", error);
        } finally {
            setLoading(false);
        }
    };

    const markCalendarDates = (eventsList: CombinedEvent[]) => {
        const marks: any = {};
        eventsList.forEach(event => {
            const date = event.day;
            if (!marks[date]) {
                marks[date] = { marked: true, dotColor: event.type === 'club' ? '#6D28D9' : '#10B981' };
            } else {
                // If mixed, keep purple or use a neutral color? Let's stick to purple if any club event exists
                if (event.type === 'club') {
                    marks[date].dotColor = '#6D28D9';
                }
            }
        });

        // Highlight selected date
        marks[selectedDate] = {
            ...(marks[selectedDate] || {}),
            selected: true,
            selectedColor: '#6D28D9',
            disableTouchEvent: true
        };

        setMarkedDates(marks);
    };

    useEffect(() => {
        markCalendarDates(events);
    }, [selectedDate]);

    useFocusEffect(
        useCallback(() => {
            fetchEvents();
        }, [])
    );

    const handleDayPress = (day: DateData) => {
        setSelectedDate(day.dateString);
    };

    const scheduleNotification = async (event: CombinedEvent) => {
        try {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please enable notifications to set alarms.');
                return;
            }

            const eventDate = new Date(`${event.day}T${event.start_time}`);
            const trigger = eventDate.getTime() - 15 * 60 * 1000; // 15 minutes before

            if (trigger < Date.now()) {
                Alert.alert('Event Started', 'This event has already started or is starting very soon.');
                return;
            }

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: `Upcoming Event: ${event.name}`,
                    body: `Starting in 15 minutes at ${event.location}`,
                    data: { eventId: event.id },
                },
                trigger: { type: 'date' as any, date: new Date(trigger) },
            });

            Alert.alert('Alarm Set', `You will be notified 15 minutes before ${event.name}.`);
        } catch (error) {
            console.error("Error scheduling notification:", error);
            Alert.alert('Error', 'Failed to set alarm.');
        }
    };

    const handleDeleteEvent = async (event: CombinedEvent) => {
        Alert.alert(
            "Delete Event",
            "Are you sure you want to delete this event?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const { data: { user } } = await supabase.auth.getUser();
                            if (!user) return;

                            const storageKey = `personal_events_${user.id}`;
                            const existingEventsJson = await AsyncStorage.getItem(storageKey);
                            if (existingEventsJson) {
                                const existingEvents = JSON.parse(existingEventsJson);
                                const updatedEvents = existingEvents.filter((e: any) => e.id !== event.id);
                                await AsyncStorage.setItem(storageKey, JSON.stringify(updatedEvents));
                                fetchEvents(true); // Refresh
                            }
                        } catch (error) {
                            console.error("Error deleting event:", error);
                            Alert.alert("Error", "Failed to delete event.");
                        }
                    }
                }
            ]
        );
    };

    const handleEditEvent = (event: CombinedEvent) => {
        // Find the original personal event object to pass to modal
        // We can reconstruct it or fetch it, but since we have the data here:
        const personalEvent = {
            id: event.id,
            title: event.name,
            description: event.description,
            day: event.day,
            start_time: event.start_time,
            end_time: event.end_time,
            alarms: [] // We might need to store alarms in CombinedEvent if we want to edit them properly
        };
        // Ideally we should fetch the full object or store it. 
        // Let's update CombinedEvent to include 'originalData' or similar if needed, 
        // but for now let's try to pass what we have.
        // Actually, we need the alarms. Let's update fetchEvents to include alarms in CombinedEvent or just fetch again.
        // For simplicity, let's assume we can pass the event as is and the modal handles it, 
        // but the modal expects specific fields.

        // Better approach: Pass the CombinedEvent and let Modal handle mapping if needed, 
        // OR map it here.
        setEventToEdit(event);
        setShowAddModal(true);
    };

    const selectedDayEvents = events.filter(e => e.day === selectedDate);

    return (
        <SafeAreaView className="flex-1 bg-[#F7F5FC]" edges={["top"]}>
            <PageHeader
                title="My Calendar"
                rightIcon={
                    <Pressable
                        onPress={() => {
                            setEventToEdit(undefined);
                            setShowAddModal(true);
                        }}
                        className="h-9 w-9 items-center justify-center rounded-full bg-[#F7F5FC] border border-gray-200"
                    >
                        <Ionicons name="add" size={24} color="#1A1A1A" />
                    </Pressable>
                }
            />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="mx-5 mt-2 mb-6 bg-white rounded-[24px] shadow-sm shadow-purple-100 overflow-hidden border border-[#F0F0F0]">
                    <Calendar
                        current={selectedDate}
                        onDayPress={handleDayPress}
                        markedDates={markedDates}
                        theme={{
                            backgroundColor: '#ffffff',
                            calendarBackground: '#ffffff',
                            textSectionTitleColor: '#b6c1cd',
                            selectedDayBackgroundColor: '#6D28D9',
                            selectedDayTextColor: '#ffffff',
                            todayTextColor: '#6D28D9',
                            dayTextColor: '#2d4150',
                            textDisabledColor: '#d9e1e8',
                            dotColor: '#6D28D9',
                            selectedDotColor: '#ffffff',
                            arrowColor: '#6D28D9',
                            monthTextColor: '#1A1A1A',
                            indicatorColor: '#6D28D9',
                            textDayFontFamily: 'Lexend_400Regular',
                            textMonthFontFamily: 'Lexend_700Bold',
                            textDayHeaderFontFamily: 'Lexend_500Medium',
                            textDayFontSize: 14,
                            textMonthFontSize: 16,
                            textDayHeaderFontSize: 12
                        }}
                    />
                </View>

                <View className="px-5 pb-10">
                    <Text className="text-[18px] font-h1 text-[#1A1A1A] mb-4">
                        Events for {(() => {
                            const [y, m, d] = selectedDate.split('-').map(Number);
                            const dateObj = new Date(y, m - 1, d);
                            return dateObj.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
                        })()}
                    </Text>

                    {selectedDayEvents.length > 0 ? (
                        <View className="gap-4">
                            {selectedDayEvents.map(event => (
                                <Pressable
                                    key={event.id}
                                    onPress={() => {
                                        if (event.type === 'club') {
                                            router.push(`/event-details/${event.id}`);
                                        } else {
                                            handleEditEvent(event);
                                        }
                                    }}
                                    className={`bg-white p-4 rounded-[20px] border shadow-sm flex-row items-center justify-between ${event.type === 'personal' ? 'border-green-100' : 'border-gray-100'}`}
                                >
                                    <View className="flex-1 mr-4">
                                        <View className="flex-row items-center gap-2 mb-1">
                                            <Text className="text-[16px] font-h1 text-[#1A1A1A]">{event.name}</Text>
                                            {event.type === 'personal' && (
                                                <View className="bg-green-100 px-2 py-0.5 rounded-full">
                                                    <Text className="text-[10px] font-button text-green-700">PERSONAL</Text>
                                                </View>
                                            )}
                                        </View>
                                        <View className="flex-row items-center gap-2 mb-1">
                                            <Ionicons name="time-outline" size={14} color="#6B7280" />
                                            <Text className="text-[12px] font-metadata text-gray-500">
                                                {event.start_time.slice(0, 5)} - {event.end_time.slice(0, 5)}
                                            </Text>
                                        </View>
                                        <View className="flex-row items-center gap-2">
                                            <Ionicons name="location-outline" size={14} color="#6B7280" />
                                            <Text className="text-[12px] font-metadata text-gray-500">{event.location}</Text>
                                        </View>
                                    </View>

                                    <View className="flex-row items-center gap-2">
                                        {event.type === 'personal' && (
                                            <Pressable
                                                onPress={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteEvent(event);
                                                }}
                                                className="h-10 w-10 items-center justify-center rounded-full bg-red-50 border border-red-100"
                                            >
                                                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                            </Pressable>
                                        )}

                                        {event.type === 'club' && (
                                            <Pressable
                                                onPress={(e) => {
                                                    e.stopPropagation();
                                                    // scheduleNotification(event);
                                                    Alert.alert("Notifications Disabled", "Push notifications are currently disabled.");
                                                }}
                                                className="h-10 w-10 items-center justify-center rounded-full bg-purple-50 border border-purple-100"
                                            >
                                                <Ionicons name="notifications-outline" size={20} color="#6D28D9" />
                                            </Pressable>
                                        )}
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    ) : (
                        <View className="items-center justify-center py-10 bg-white rounded-[24px] border border-dashed border-gray-200">
                            <Ionicons name="calendar-outline" size={48} color="#E5E7EB" />
                            <Text className="text-[14px] font-body text-gray-400 mt-2">No events scheduled for this day</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            <AddEventModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                onEventAdded={() => fetchEvents(true)}
                initialDate={selectedDate}
                eventToEdit={eventToEdit}
            />
        </SafeAreaView>
    );
}
