import { supabase } from "@/lib/supabase";
import { ChatRoom, ChatMessage, ChatAnalytics } from "@/types/database";
import { RealtimeChannel } from "@supabase/supabase-js";
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

// --- Rooms ---

type RoomQueryOptions = {
    limit?: number;
    offset?: number;
};

type MessageQueryOptions = {
    limit?: number;
    offset?: number;
};

const CLUB_CHAT_SYNC_TTL_MS = 5 * 60 * 1000;
const lastClubChatSyncByUser = new Map<string, number>();

const OFFICER_ROLE_KEYWORDS = ['president', 'vice president', 'v. president', 'treasurer', 'secretary', 'admin', 'officer'];

const ensureClubChatsSynced = async (userId: string) => {
    const lastSyncedAt = lastClubChatSyncByUser.get(userId) || 0;
    if (Date.now() - lastSyncedAt < CLUB_CHAT_SYNC_TTL_MS) {
        return;
    }

    await syncClubChats(userId);
    lastClubChatSyncByUser.set(userId, Date.now());
};

export const getRooms = async (type?: 'group' | 'dm' | 'class', options: RoomQueryOptions = {}) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        const limit = options.limit ?? 20;
        const offset = options.offset ?? 0;

        // Sync club chats if looking for groups or all
        if (type !== 'dm') {
            await ensureClubChatsSynced(user.id);
        }

        let rooms: ChatRoom[] = [];

        if (type === 'dm') {
            const { data, error } = await supabase
                .from("chat_rooms")
                .select(`
                    *,
                    user1:user1(id, full_name, avatar_url),
                    user2:user2(id, full_name, avatar_url)
                `)
                .eq("type", "dm")
                .or(`user1.eq.${user.id},user2.eq.${user.id}`)
                .order("created_at", { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) throw error;

            rooms = data.map((room: any) => {
                const otherUser = room.user1.id === user.id ? room.user2 : room.user1;
                return {
                    ...room,
                    name: otherUser.full_name,
                    image_url: otherUser.avatar_url,
                    other_user: otherUser
                };
            });
        } else {
            let query = supabase
                .from("chat_rooms")
                .select(`
                    *,
                    chat_members!inner(user_id)
                `)
                .eq("chat_members.user_id", user.id)
                .order("created_at", { ascending: false })
                .range(offset, offset + limit - 1);

            if (type) {
                query = query.eq("type", type);
            }

            const { data, error } = await query;
            if (error) throw error;

            rooms = (data || []).map((room: any) => {
                const { chat_members, ...roomWithoutMembers } = room;
                return roomWithoutMembers;
            });
        }

        const lastMessages = await Promise.all(
            rooms.map(async (room) => {
                const { data: lastMsg } = await supabase
                    .from("chat_messages")
                    .select("content, created_at, sender_id")
                    .eq("room_id", room.id)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .maybeSingle();

                return {
                    roomId: room.id,
                    message: lastMsg || null,
                };
            })
        );

        const lastMessageMap = new Map(
            lastMessages.map((entry) => [entry.roomId, entry.message])
        );

        const clubIdsNeedingImages = [...new Set(rooms.filter((room) => room.club_id && !room.image_url).map((room) => room.club_id!))];
        const officerRelevantEntries = lastMessages.filter(
            (entry) => entry.message?.sender_id && rooms.find((room) => room.id === entry.roomId)?.club_id
        );
        const roomMap = new Map(rooms.map((room) => [room.id, room]));
        const officerClubIds = [...new Set(
            officerRelevantEntries
                .map((entry) => roomMap.get(entry.roomId)?.club_id)
                .filter(Boolean) as string[]
        )];
        const senderIds = [...new Set(
            officerRelevantEntries
                .map((entry) => entry.message?.sender_id)
                .filter(Boolean) as string[]
        )];

        const [{ data: clubsById }, { data: officerRows }, { data: memberRows }] = await Promise.all([
            clubIdsNeedingImages.length > 0
                ? supabase.from("clubs").select("id, cover_image_url").in("id", clubIdsNeedingImages)
                : Promise.resolve({ data: [] as any[] }),
            officerClubIds.length > 0 && senderIds.length > 0
                ? supabase.from("officers").select("club_id, user_id").in("club_id", officerClubIds).in("user_id", senderIds)
                : Promise.resolve({ data: [] as any[] }),
            officerClubIds.length > 0 && senderIds.length > 0
                ? supabase.from("club_members").select("club_id, user_id, role").in("club_id", officerClubIds).in("user_id", senderIds)
                : Promise.resolve({ data: [] as any[] }),
        ]);
        const clubImageMap = new Map((clubsById || []).map((club: any) => [club.id, club.cover_image_url]));
        const officerMemberships = new Set(
            (officerRows || []).map((row: any) => `${row.club_id}:${row.user_id}`)
        );
        const officerRoleMemberships = new Set(
            (memberRows || [])
                .filter((row: any) => OFFICER_ROLE_KEYWORDS.some((keyword) => (row.role || "").toLowerCase().includes(keyword)))
                .map((row: any) => `${row.club_id}:${row.user_id}`)
        );

        const roomsWithDetails = rooms.map((room) => {
            const lastMsg = lastMessageMap.get(room.id);
            let roomImage = room.image_url;
            let lastMessageIsOfficer = false;

            if (room.club_id && lastMsg?.sender_id) {
                const membershipKey = `${room.club_id}:${lastMsg.sender_id}`;
                lastMessageIsOfficer =
                    officerMemberships.has(membershipKey) ||
                    officerRoleMemberships.has(membershipKey);
            }

            if (room.club_id) {
                if (!roomImage) {
                    roomImage = clubImageMap.get(room.club_id) || roomImage;
                }
            }

            return {
                ...room,
                last_message: lastMsg?.content || "No messages yet",
                last_message_at: lastMsg?.created_at || room.created_at,
                unread_count: 0,
                image_url: roomImage || room.image_url,
                last_message_is_officer: lastMessageIsOfficer
            };
        });

        return roomsWithDetails.sort((a, b) =>
            new Date(b.last_message_at!).getTime() - new Date(a.last_message_at!).getTime()
        );

    } catch (error) {
        console.error("Error fetching rooms:", error);
        return [];
    }
};

export const getRoom = async (roomId: string): Promise<ChatRoom | null> => {
    try {
        const { data, error } = await supabase
            .from("chat_rooms")
            .select(`
                *,
                user1:user1(id, full_name, avatar_url),
                user2:user2(id, full_name, avatar_url)
            `)
            .eq("id", roomId)
            .single();

        if (error) throw error;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        if (data.type === 'dm') {
            const otherUser = data.user1.id === user.id ? data.user2 : data.user1;
            return {
                ...data,
                name: otherUser.full_name,
                image_url: otherUser.avatar_url,
                other_user: otherUser
            };
        }

        // For Club/Group chats, get member count and club image
        const { count: memberCount } = await supabase
            .from("chat_members")
            .select("id", { count: 'exact', head: true })
            .eq("room_id", roomId);

        let roomImage = data.image_url;

        // If it's a club chat and no specific room image, try to get club cover image
        if (data.club_id && !roomImage) {
            const { data: club } = await supabase
                .from("clubs")
                .select("cover_image_url")
                .eq("id", data.club_id)
                .single();

            if (club?.cover_image_url) {
                roomImage = club.cover_image_url;
            }
        }

        return {
            ...data,
            member_count: memberCount || 0,
            image_url: roomImage || data.image_url
        };
    } catch (error) {
        console.error("Error fetching room:", error);
        return null;
    }
};

export const createDM = async (otherUserId: string) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // Check if DM exists
        const { data: existing, error: fetchError } = await supabase
            .from("chat_rooms")
            .select("*")
            .eq("type", "dm")
            .or(`and(user1.eq.${user.id},user2.eq.${otherUserId}),and(user1.eq.${otherUserId},user2.eq.${user.id})`)
            .single();

        if (existing) return existing;

        // Create new DM
        const { data, error } = await supabase
            .from("chat_rooms")
            .insert([
                {
                    type: "dm",
                    user1: user.id,
                    user2: otherUserId
                }
            ])
            .select()
            .single();

        if (error) throw error;
        return data;

    } catch (error) {
        console.error("Error creating DM:", error);
        throw error;
    }
};

// --- Messages ---

export const getMessages = async (roomId: string, options: MessageQueryOptions = {}) => {
    try {
        const limit = options.limit ?? 50;
        const offset = options.offset ?? 0;
        const { data, error } = await supabase
            .from("chat_messages")
            .select(`
                *,
                sender:sender_id(id, full_name, avatar_url)
            `)
            .eq("room_id", roomId)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return (data || []).reverse() as ChatMessage[];

    } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
    }
};

export const sendMessage = async (roomId: string, content: string, imageUrl?: string) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase
            .from("chat_messages")
            .insert([
                {
                    room_id: roomId,
                    sender_id: user.id,
                    content,
                    image_url: imageUrl
                }
            ])
            .select(`
                *,
                sender:sender_id(id, full_name, avatar_url)
            `)
            .single();

        if (error) throw error;

        return data as ChatMessage;

    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
};

// --- Read Receipts & Analytics ---

export const markMessagesRead = async (roomId: string) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get all unread messages
        // This is complex to do efficiently without a stored procedure.
        // For MVP, we'll just insert a read record for the latest message 
        // and assume client handles "read up to here" logic or we just mark all fetched messages.

        // Better approach: When fetching messages, get IDs, and insert into reads if not exists.
        // For now, let's just stub this to avoid performance issues on every open.
        // Real implementation would use an RPC `mark_room_read(room_id, user_id)`.
    } catch (error) {
        console.error("Error marking read:", error);
    }
};

export const getUnreadCount = async (roomId: string) => {
    return 0;
};

// --- Realtime ---

export const subscribeToRoom = (roomId: string, onMessage: (msg: ChatMessage) => void) => {
    const channel = supabase
        .channel(`room:${roomId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `room_id=eq.${roomId}`
            },
            async (payload) => {
                // Fetch sender details since payload only has raw data
                const { data } = await supabase
                    .from("profiles") // Assuming profiles table
                    .select("id, full_name, avatar_url")
                    .eq("id", payload.new.sender_id)
                    .single();

                const message = {
                    ...payload.new,
                    sender: data
                } as ChatMessage;

                onMessage(message);
            }
        )
        .subscribe();

    return channel;
};

export const uploadChatImage = async (uri: string): Promise<string | null> => {
    try {
        const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: 'base64',
        });

        const fileName = `${Date.now()}.jpg`;
        const filePath = `chat/${fileName}`;

        const { data, error } = await supabase.storage
            .from('chat-images')
            .upload(filePath, decode(base64), {
                contentType: 'image/jpeg',
            });

        if (error) {
            console.error("Upload error:", error);
            return null;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('chat-images')
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error("Error uploading image:", error);
        return null;
    }
};

// --- Helpers ---

const syncClubChats = async (userId: string) => {
    try {
        const { data: clubs } = await supabase
            .from("club_members")
            .select("club_id")
            .eq("user_id", userId)
            .eq("status", "approved");

        if (!clubs || clubs.length === 0) return;
        const clubIds = clubs.map(c => c.club_id);

        const { data: existingRooms } = await supabase
            .from("chat_rooms")
            .select("id, club_id")
            .in("club_id", clubIds)
            .eq("type", "group");

        const membershipRows: { room_id: string; user_id: string }[] = [];
        const clubsWithRooms = new Set(existingRooms?.map(r => r.club_id) || []);
        const clubsNeedingRooms = clubIds.filter(id => !clubsWithRooms.has(id));

        if (clubsNeedingRooms.length > 0) {
            const { data: clubRecords } = await supabase
                .from("clubs")
                .select("id, name")
                .in("id", clubsNeedingRooms);

            const clubNameMap = new Map((clubRecords || []).map((club: any) => [club.id, club.name]));

            for (const clubId of clubsNeedingRooms) {
                const { data: newRoom } = await supabase
                    .from("chat_rooms")
                    .insert({
                        type: 'group',
                        club_id: clubId,
                        name: clubNameMap.get(clubId) || "Club Chat"
                    })
                    .select("id")
                    .single();

                if (newRoom) {
                    membershipRows.push({ room_id: newRoom.id, user_id: userId });
                }
            }
        }

        existingRooms?.forEach(room => {
            membershipRows.push({ room_id: room.id, user_id: userId });
        });

        if (membershipRows.length > 0) {
            await supabase
                .from("chat_members")
                .upsert(membershipRows, { onConflict: 'room_id, user_id', ignoreDuplicates: true });
        }
    } catch (error) {
        console.error("Error syncing club chats:", error);
    }
};
