import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Achievement, UserAchievement } from '@/types/database';
import { checkAndUnlock, getUserAchievements } from '@/lib/achievementService';
import { supabase } from '@/lib/supabase';
import BadgeRevealModal from '@/components/achievements/BadgeRevealModal';

interface AchievementContextType {
    unlockedAchievements: UserAchievement[];
    checkTrigger: (triggerType: string, data?: any, userIdOverride?: string) => Promise<void>;
    refreshAchievements: () => Promise<void>;
    showAchievementModal: (achievement: Achievement) => void;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export function AchievementProvider({ children }: { children: ReactNode }) {
    const [unlockedAchievements, setUnlockedAchievements] = useState<UserAchievement[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) {
                setUserId(data.user.id);
                refreshAchievements(data.user.id);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUserId(session.user.id);
                refreshAchievements(session.user.id);
            } else {
                setUserId(null);
                setUnlockedAchievements([]);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const refreshAchievements = async (uid: string = userId!) => {
        if (!uid) return;
        const data = await getUserAchievements(uid);
        setUnlockedAchievements(data);
    };

    const checkTrigger = async (triggerType: string, data?: any, userIdOverride?: string) => {
        let currentUserId = userIdOverride || userId;

        if (!currentUserId) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                currentUserId = user.id;
                setUserId(user.id); // Update state while we're at it
            } else {
                return;
            }
        }

        try {
            const newUnlocks = await checkAndUnlock(currentUserId, triggerType, data);

            if (newUnlocks.length > 0) {
                // Refresh list
                await refreshAchievements(currentUserId);

                // Show modal for the first new unlock (queueing could be added for multiple)
                const firstNew = newUnlocks[0];
                if (firstNew.achievement) {
                    setNewlyUnlocked(firstNew.achievement);
                    setModalVisible(true);
                }
            }
        } catch (error) {
            console.error("Error checking achievement trigger:", error);
        }
    };

    const showAchievementModal = (achievement: Achievement) => {
        setNewlyUnlocked(achievement);
        setModalVisible(true);
    };

    return (
        <AchievementContext.Provider value={{ unlockedAchievements, checkTrigger, refreshAchievements, showAchievementModal }}>
            {children}
            <BadgeRevealModal
                visible={modalVisible}
                achievement={newlyUnlocked}
                onClose={() => setModalVisible(false)}
            />
        </AchievementContext.Provider>
    );
}

export function useAchievements() {
    const context = useContext(AchievementContext);
    if (context === undefined) {
        throw new Error('useAchievements must be used within an AchievementProvider');
    }
    return context;
}
