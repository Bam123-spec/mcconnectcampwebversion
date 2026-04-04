import React, { useEffect } from 'react';
import { View, Text, Modal, StyleSheet, Dimensions } from 'react-native';
import { MotiView, MotiText } from 'moti';
import { Achievement } from '@/types/database';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface BadgeRevealModalProps {
    visible: boolean;
    achievement: Achievement | null;
    onClose: () => void;
}

export default function BadgeRevealModal({ visible, achievement, onClose }: BadgeRevealModalProps) {
    useEffect(() => {
        if (visible && achievement) {
            // Trigger haptics
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // Auto close after 4 seconds
            const timer = setTimeout(() => {
                onClose();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [visible, achievement]);

    if (!visible || !achievement) return null;

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View className="flex-1 items-center justify-center bg-black/80">
                {/* Radial Burst Background Effect (Simplified as rotating gradient circles) */}
                <MotiView
                    from={{ opacity: 0, scale: 0, rotate: '0deg' }}
                    animate={{ opacity: 0.5, scale: 1.5, rotate: '180deg' }}
                    transition={{ type: 'timing', duration: 1000 }}
                    style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}
                >
                    <View className="w-[300px] h-[300px] rounded-full bg-white/10" />
                </MotiView>

                {/* Badge Container */}
                <MotiView
                    from={{ scale: 0.7, opacity: 0, rotate: '0deg' }}
                    animate={{ scale: 1, opacity: 1, rotate: '360deg' }}
                    transition={{
                        type: 'spring',
                        damping: 15,
                        stiffness: 100,
                    }}
                    className="items-center justify-center"
                >
                    {/* Badge Icon */}
                    <View
                        className="w-32 h-32 rounded-full items-center justify-center mb-6 shadow-lg shadow-black/50 border-4 border-white"
                        style={{ backgroundColor: achievement.bg_color || achievement.color }}
                    >
                        <Text className="text-[60px]">{achievement.icon}</Text>
                    </View>
                </MotiView>

                {/* Text Container */}
                <View className="items-center z-10">
                    <MotiText
                        from={{ opacity: 0, translateY: 20, scale: 0.9 }}
                        animate={{ opacity: 1, translateY: 0, scale: 1 }}
                        transition={{ delay: 500, type: 'spring' }}
                        className="text-white text-[24px] font-bold mb-2 text-center"
                    >
                        Achievement Unlocked!
                    </MotiText>

                    <MotiText
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 800, type: 'timing', duration: 500 }}
                        className="text-white text-[32px] font-extrabold mb-2 text-center text-shadow-lg"
                        style={{ color: achievement.color }}
                    >
                        {achievement.title}
                    </MotiText>

                    <MotiText
                        from={{ opacity: 0 }}
                        animate={{ opacity: 0.8 }}
                        transition={{ delay: 1000, duration: 500 }}
                        className="text-white/90 text-[16px] text-center max-w-[80%] font-medium"
                    >
                        {achievement.description}
                    </MotiText>
                </View>

                {/* Confetti (Simple dots for now, ideally use a library like react-native-confetti-cannon) */}
                {/* We'll simulate a few floating particles */}
                {[...Array(10)].map((_, i) => (
                    <MotiView
                        key={i}
                        from={{ opacity: 1, translateY: 0, translateX: 0 }}
                        animate={{ opacity: 0, translateY: -200 - Math.random() * 200, translateX: (Math.random() - 0.5) * 200 }}
                        transition={{ delay: 200, duration: 2000 + Math.random() * 1000, loop: true }}
                        style={{
                            position: 'absolute',
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: ['#FFD700', '#FF69B4', '#00BFFF', '#32CD32'][Math.floor(Math.random() * 4)],
                            top: height / 2,
                            left: width / 2,
                        }}
                    />
                ))}
            </View>
        </Modal>
    );
}
