import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { Profile } from '@/types/database';

// Conditionally import Zeroconf to avoid crashes in Expo Go
let Zeroconf: any;
try {
    if (Constants.appOwnership !== 'expo') {
        Zeroconf = require('react-native-zeroconf').default;
    }
} catch (e) {
    console.log('Zeroconf not available (likely Expo Go)');
}

const DOMAIN = 'local.';
const TYPE = 'connectcamp';
const PROTOCOL = 'tcp';

export const useNearbyDiscovery = (currentUser: Profile | null) => {
    const [nearbyUsers, setNearbyUsers] = useState<Profile[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const zeroconf = useRef<any>(null);
    const services = useRef<Map<string, any>>(new Map());

    const isExpoGo = Constants.appOwnership === 'expo';

    useEffect(() => {
        if (isExpoGo || !Zeroconf) {
            console.log('Running in Expo Go - Zeroconf disabled');
            return;
        }

        try {
            zeroconf.current = new Zeroconf();

            zeroconf.current.on('start', () => {
                console.log('[Zeroconf] Scan started');
                setIsScanning(true);
            });

            zeroconf.current.on('stop', () => {
                console.log('[Zeroconf] Scan stopped');
                setIsScanning(false);
            });

            zeroconf.current.on('resolved', (service: any) => {
                console.log('[Zeroconf] Service resolved:', service);
                // Ensure service is an object with txt record
                if (typeof service === 'string' || !service || !service.txt) return;

                // Ignore ourselves
                if (currentUser && service.txt.userId === currentUser.id) {
                    console.log('[Zeroconf] Ignoring self');
                    return;
                }

                // Add to map to avoid duplicates
                services.current.set(service.name, service);
                updateNearbyList();
            });

            zeroconf.current.on('remove', (name: string | any) => {
                const serviceName = typeof name === 'string' ? name : name.name;
                console.log('[Zeroconf] Service removed:', serviceName);
                services.current.delete(serviceName);
                updateNearbyList();
            });

            zeroconf.current.on('error', (err: Error) => {
                console.log('[Zeroconf] Error:', err);
            });

            return () => {
                stopDiscovery();
            };
        } catch (e) {
            console.error('Failed to initialize Zeroconf:', e);
        }
    }, [currentUser]);

    const updateNearbyList = () => {
        const users: Profile[] = [];
        services.current.forEach((service) => {
            if (service.txt && service.txt.userId) {
                // Double check: Ignore ourselves
                if (currentUser && service.txt.userId === currentUser.id) return;

                users.push({
                    id: service.txt.userId,
                    username: service.txt.username || "Student",
                    full_name: service.txt.username || "Student", // Fallback
                    avatar_url: service.txt.avatarUrl,
                } as Profile);
            }
        });
        setNearbyUsers(users);
    };

    const startDiscovery = () => {
        if (isExpoGo || !zeroconf.current) {
            console.log('Discovery skipped (Expo Go)');
            return;
        }

        console.log('[Zeroconf] Starting discovery...');

        // 1. Publish our service
        if (currentUser) {
            const serviceName = `CC_${currentUser.id}`;
            console.log('[Zeroconf] Publishing service:', serviceName);

            try {
                zeroconf.current.publishService(
                    TYPE,
                    PROTOCOL,
                    DOMAIN,
                    serviceName,
                    8080, // Port (dummy)
                    {
                        userId: currentUser.id,
                        username: currentUser.username || currentUser.full_name || 'Student',
                        avatarUrl: currentUser.avatar_url || ''
                    }
                );
            } catch (e) {
                console.error('[Zeroconf] Publish error:', e);
            }
        }

        // 2. Scan for others
        try {
            zeroconf.current.scan(TYPE, PROTOCOL, DOMAIN);
        } catch (e) {
            console.error('[Zeroconf] Scan error:', e);
        }
    };

    const stopDiscovery = () => {
        if (isExpoGo || !zeroconf.current) return;

        console.log('[Zeroconf] Stopping discovery...');
        try {
            zeroconf.current.stop();

            if (currentUser) {
                zeroconf.current.unpublishService(`CC_${currentUser.id}`);
            }
        } catch (e) {
            console.error('[Zeroconf] Stop error:', e);
        }

        services.current.clear();
        setNearbyUsers([]);
    };

    return {
        nearbyUsers,
        isScanning,
        startDiscovery,
        stopDiscovery,
        isExpoGo // Export this so UI can show a warning
    };
};
