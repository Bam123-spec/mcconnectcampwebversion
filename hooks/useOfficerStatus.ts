import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type OfficerClub = {
    club_id: string;
    id: string;
    name: string;
    cover_image_url?: string | null;
    role: string;
    officer_id: string;
};

export function useOfficerStatus() {
    const [isOfficer, setIsOfficer] = useState(false);
    const [officerClubs, setOfficerClubs] = useState<OfficerClub[]>([]);
    const [loading, setLoading] = useState(true);

    const checkOfficerStatus = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            // Fetch from 'officers' table
            const { data: officerRows, error } = await supabase
                .from("officers")
                .select(`
          *,
          clubs (
            id,
            name,
            cover_image_url
          )
        `)
                .eq("user_id", user.id);

            if (error) {
                console.error("Error checking officer status:", error);
                return;
            }

            if (officerRows && officerRows.length > 0) {
                setIsOfficer(true);
                // Normalize the club shape so screens can safely depend on club_id.
                const clubs = officerRows.map((item: any) => ({
                    club_id: item.clubs.id,
                    ...item.clubs,
                    role: item.role, // Get role from officers table
                    officer_id: item.id
                }));
                setOfficerClubs(clubs);
            } else {
                setIsOfficer(false);
                setOfficerClubs([]);
            }
        } catch (error) {
            console.error("Error in useOfficerStatus:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkOfficerStatus();
    }, [checkOfficerStatus]);

    return { isOfficer, officerClubs, loading, checkOfficerStatus };
}
