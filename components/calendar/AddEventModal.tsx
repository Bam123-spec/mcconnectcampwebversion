import React, { useState, useEffect } from "react";
import { View, Text, Modal, TextInput, Pressable, ScrollView, Switch, Alert, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Calendar from 'expo-calendar';
import { supabase } from "@/lib/supabase";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AddEventModalProps {
    visible: boolean;
    onClose: () => void;
    onEventAdded: () => void;
    initialDate: string;
    eventToEdit?: any; // PersonalEvent
}

const ALARM_OPTIONS = [
    { label: "5 minutes before", value: 5 },
    { label: "10 minutes before", value: 10 },
    { label: "30 minutes before", value: 30 },
    { label: "1 hour before", value: 60 },
    { label: "3 hours before", value: 180 },
    { label: "6 hours before", value: 360 },
    { label: "1 day before", value: 1440 },
];

export default function AddEventModal({ visible, onClose, onEventAdded, initialDate, eventToEdit }: AddEventModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(new Date());
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date(new Date().getTime() + 60 * 60 * 1000)); // +1 hour
    const [selectedAlarms, setSelectedAlarms] = useState<number[]>([]);
    const [saveToDevice, setSaveToDevice] = useState(false);
    const [loading, setLoading] = useState(false);

    // Date/Time Picker visibility states
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);

    useEffect(() => {
        if (visible) {
            if (eventToEdit) {
                // Edit Mode
                setTitle(eventToEdit.title);
                setDescription(eventToEdit.description || "");

                // Parse date (YYYY-MM-DD)
                const d = new Date(eventToEdit.day);
                const userTimezoneOffset = d.getTimezoneOffset() * 60000;
                setDate(new Date(d.getTime() + userTimezoneOffset));

                // Parse times (HH:MM:SS)
                const start = new Date(`${eventToEdit.day}T${eventToEdit.start_time}`);
                const end = new Date(`${eventToEdit.day}T${eventToEdit.end_time}`);
                setStartTime(start);
                setEndTime(end);

                setSelectedAlarms(eventToEdit.alarms || []);
                setSaveToDevice(false); // Default to false for edit, or maybe check if it was saved? Hard to track.
            } else {
                // Create Mode
                setTitle("");
                setDescription("");
                const d = new Date(initialDate);
                // Adjust for timezone offset to keep the selected day correct
                const userTimezoneOffset = d.getTimezoneOffset() * 60000;
                const adjustedDate = new Date(d.getTime() + userTimezoneOffset);
                setDate(adjustedDate);

                const now = new Date();
                setStartTime(now);
                setEndTime(new Date(now.getTime() + 60 * 60 * 1000));
                setSelectedAlarms([]);
                setSaveToDevice(false);
            }
        }
    }, [visible, initialDate, eventToEdit]);

    const toggleAlarm = (minutes: number) => {
        if (selectedAlarms.includes(minutes)) {
            setSelectedAlarms(selectedAlarms.filter(m => m !== minutes));
        } else {
            setSelectedAlarms([...selectedAlarms, minutes]);
        }
    };

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert("Missing Information", "Please enter an event title.");
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            // Use local date components to avoid UTC shift
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dayString = `${year}-${month}-${day}`;

            const startTimeString = startTime.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' });
            const endTimeString = endTime.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' });

            const newEvent = {
                id: eventToEdit ? eventToEdit.id : Date.now().toString(),
                user_id: user.id,
                title,
                description,
                day: dayString,
                start_time: startTimeString,
                end_time: endTimeString,
                alarms: selectedAlarms,
                created_at: eventToEdit ? eventToEdit.created_at : new Date().toISOString()
            };

            // 1. Save to AsyncStorage
            const storageKey = `personal_events_${user.id}`;
            const existingEventsJson = await AsyncStorage.getItem(storageKey);
            let existingEvents = existingEventsJson ? JSON.parse(existingEventsJson) : [];

            if (eventToEdit) {
                // Update existing
                existingEvents = existingEvents.map((e: any) => e.id === eventToEdit.id ? newEvent : e);
            } else {
                // Add new
                existingEvents.push(newEvent);
            }

            await AsyncStorage.setItem(storageKey, JSON.stringify(existingEvents));

            // 2. Save to Device Calendar (if selected)
            if (saveToDevice) {
                const { status } = await Calendar.requestCalendarPermissionsAsync();
                if (status === 'granted') {
                    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
                    const writableCalendars = calendars.filter(c => c.allowsModifications);
                    const defaultCalendar = writableCalendars.find(c => c.isPrimary) || writableCalendars[0];

                    if (defaultCalendar) {
                        const eventDate = new Date(date);
                        eventDate.setHours(startTime.getHours(), startTime.getMinutes());
                        const eventEndDate = new Date(date);
                        eventEndDate.setHours(endTime.getHours(), endTime.getMinutes());

                        await Calendar.createEventAsync(defaultCalendar.id, {
                            title,
                            notes: description,
                            startDate: eventDate,
                            endDate: eventEndDate,
                            alarms: selectedAlarms.map(minutes => ({ relativeOffset: -minutes })),
                            timeZone: 'GMT'
                        });
                    } else {
                        Alert.alert("No Writable Calendar", "Could not find a calendar on your device that allows adding events.");
                    }
                } else {
                    Alert.alert("Permission Denied", "Could not save to device calendar.");
                }
            }

            onEventAdded();
            onClose();
        } catch (error) {
            console.error("Error saving event:", error);
            Alert.alert("Error", "Failed to save event.");
        } finally {
            setLoading(false);
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) setDate(selectedDate);
    };

    const onStartTimeChange = (event: any, selectedDate?: Date) => {
        setShowStartTimePicker(false);
        if (selectedDate) {
            setStartTime(selectedDate);
            // Auto-adjust end time if it's before start time
            if (selectedDate > endTime) {
                setEndTime(new Date(selectedDate.getTime() + 60 * 60 * 1000));
            }
        }
    };

    const onEndTimeChange = (event: any, selectedDate?: Date) => {
        setShowEndTimePicker(false);
        if (selectedDate) setEndTime(selectedDate);
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View className="flex-1 bg-[#F7F5FC]">
                {/* Header */}
                <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-gray-100">
                    <Pressable onPress={onClose}>
                        <Text className="text-[16px] font-body text-gray-500">Cancel</Text>
                    </Pressable>
                    <Text className="text-[18px] font-h1 text-gray-900">{eventToEdit ? 'Edit Event' : 'New Event'}</Text>
                    <Pressable onPress={handleSave} disabled={loading}>
                        <Text className={`text-[16px] font-bold ${loading ? 'text-gray-400' : 'text-[#6D28D9]'}`}>
                            {loading ? 'Saving...' : (eventToEdit ? 'Update' : 'Add')}
                        </Text>
                    </Pressable>
                </View>

                <ScrollView className="flex-1 px-5 pt-6">
                    {/* Title & Description */}
                    <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
                        <TextInput
                            placeholder="Title"
                            value={title}
                            onChangeText={setTitle}
                            className="text-[20px] font-h1 text-gray-900 mb-3 border-b border-gray-100 pb-2"
                            placeholderTextColor="#9CA3AF"
                        />
                        <TextInput
                            placeholder="Description (optional)"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            className="text-[15px] font-body text-gray-700 h-20"
                            placeholderTextColor="#9CA3AF"
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Date & Time */}
                    <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100 gap-4">
                        {/* Date */}
                        <Pressable onPress={() => setShowDatePicker(true)} className="flex-row justify-between items-center">
                            <View className="flex-row items-center gap-2">
                                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                                <Text className="text-[15px] font-body text-gray-700">Date</Text>
                            </View>
                            <Text className="text-[15px] font-button text-[#6D28D9]">
                                {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </Text>
                        </Pressable>
                        {showDatePicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="spinner"
                                onChange={onDateChange}
                            />
                        )}

                        <View className="h-[1px] bg-gray-100" />

                        {/* Start Time */}
                        <Pressable onPress={() => setShowStartTimePicker(true)} className="flex-row justify-between items-center">
                            <View className="flex-row items-center gap-2">
                                <Ionicons name="time-outline" size={20} color="#6B7280" />
                                <Text className="text-[15px] font-body text-gray-700">Start Time</Text>
                            </View>
                            <Text className="text-[15px] font-button text-[#6D28D9]">
                                {startTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                            </Text>
                        </Pressable>
                        {showStartTimePicker && (
                            <DateTimePicker
                                value={startTime}
                                mode="time"
                                display="spinner"
                                onChange={onStartTimeChange}
                            />
                        )}

                        <View className="h-[1px] bg-gray-100" />

                        {/* End Time */}
                        <Pressable onPress={() => setShowEndTimePicker(true)} className="flex-row justify-between items-center">
                            <View className="flex-row items-center gap-2">
                                <Ionicons name="time-outline" size={20} color="#6B7280" />
                                <Text className="text-[15px] font-body text-gray-700">End Time</Text>
                            </View>
                            <Text className="text-[15px] font-button text-[#6D28D9]">
                                {endTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                            </Text>
                        </Pressable>
                        {showEndTimePicker && (
                            <DateTimePicker
                                value={endTime}
                                mode="time"
                                display="spinner"
                                onChange={onEndTimeChange}
                            />
                        )}
                    </View>

                    {/* Alarms */}
                    <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
                        <View className="flex-row items-center gap-2 mb-4">
                            <Ionicons name="notifications-outline" size={20} color="#6B7280" />
                            <Text className="text-[15px] font-h1 text-gray-900">Alarms</Text>
                        </View>
                        <View className="flex-row flex-wrap gap-2">
                            {ALARM_OPTIONS.map((option) => {
                                const isSelected = selectedAlarms.includes(option.value);
                                return (
                                    <Pressable
                                        key={option.value}
                                        onPress={() => toggleAlarm(option.value)}
                                        className={`px-3 py-2 rounded-xl border ${isSelected ? 'bg-purple-100 border-purple-200' : 'bg-gray-50 border-gray-200'}`}
                                    >
                                        <Text className={`text-[12px] font-button ${isSelected ? 'text-purple-700' : 'text-gray-600'}`}>
                                            {option.label}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>

                    {/* Save to Device Calendar */}
                    <View className="bg-white rounded-2xl p-4 mb-10 shadow-sm border border-gray-100 flex-row justify-between items-center">
                        <View className="flex-row items-center gap-2">
                            <Ionicons name="phone-portrait-outline" size={20} color="#6B7280" />
                            <Text className="text-[15px] font-body text-gray-700">Save to Device Calendar</Text>
                        </View>
                        <Switch
                            value={saveToDevice}
                            onValueChange={setSaveToDevice}
                            trackColor={{ false: "#E5E7EB", true: "#6D28D9" }}
                            thumbColor={"#FFFFFF"}
                        />
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
}
