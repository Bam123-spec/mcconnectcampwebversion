import { Profile } from "@/types/database";

export const ScanNearbyService = {
    /**
     * Generates the QR code data for a given user.
     * Format: connectcamp://profile/<userId>
     */
    generateQRData: (user: Profile): string => {
        if (!user || !user.id) return "";
        return `connectcamp://profile/${user.id}`;
    },

    /**
     * Parses scanned QR code data to extract the User ID.
     * Returns null if the format is invalid.
     */
    parseQRData: (data: string): string | null => {
        if (!data) return null;

        // Handle direct deep link
        if (data.startsWith("connectcamp://profile/")) {
            const parts = data.split("connectcamp://profile/");
            return parts.length > 1 ? parts[1] : null;
        }

        // Handle potential JSON format (legacy or future proofing)
        try {
            const json = JSON.parse(data);
            if (json.userId) return json.userId;
            if (json.id) return json.id;
        } catch (e) {
            // Not JSON
        }

        return null;
    },

    /**
     * Helper to format a discovered Zeroconf service into a Profile object.
     * (This logic is also in the hook, but kept here for reference/reuse)
     */
    formatDiscoveredUser: (txtRecord: any): Profile | null => {
        if (!txtRecord || !txtRecord.userId) return null;
        return {
            id: txtRecord.userId,
            username: txtRecord.username || "Student",
            full_name: txtRecord.username || "Student",
            avatar_url: txtRecord.avatarUrl,
        } as Profile;
    }
};
