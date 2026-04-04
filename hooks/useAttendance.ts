import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { EventAttendance } from "@/types/database";
import { Alert } from "react-native";

const ATTENDANCE_SELECT = "id, event_id, user_id, qr_secret, status, created_at";

export function useAttendance(eventId: string) {
    const [attendance, setAttendance] = useState<EventAttendance | null>(null);
    const [loading, setLoading] = useState(true);
    const [attending, setAttending] = useState(false);

    useEffect(() => {
        checkAttendance();
    }, [eventId]);

    const checkAttendance = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("event_attendance")
                .select(ATTENDANCE_SELECT)
                .eq("event_id", eventId)
                .eq("user_id", user.id)
                .single();

            if (data) {
                setAttendance(data);
                setAttending(true);
            } else {
                setAttendance(null);
                setAttending(false);
            }
        } catch (error) {
            // No row found is fine
        } finally {
            setLoading(false);
        }
    };

    const register = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                Alert.alert("Error", "You must be logged in to attend.");
                return;
            }

            const { data, error } = await supabase
                .from("event_attendance")
                .insert([
                    { event_id: eventId, user_id: user.id }
                ])
                .select()
                .single();

            if (error) throw error;

            setAttendance(data);
            setAttending(true);
            Alert.alert("Success", "You're registered! 🎉");
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    const cancel = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from("event_attendance")
                .delete()
                .eq("event_id", eventId)
                .eq("user_id", user.id);

            if (error) throw error;

            setAttendance(null);
            setAttending(false);
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return { attendance, loading, attending, register, cancel };
}
