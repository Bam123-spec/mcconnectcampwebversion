import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME, ThemeType } from '../constants/theme';

type ThemeContextType = {
    darkMode: boolean;
    toggleDarkMode: (value: boolean) => Promise<void>;
    theme: ThemeType;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        loadDarkMode();
    }, []);

    const loadDarkMode = async () => {
        try {
            const val = await AsyncStorage.getItem("settings_dark_mode");
            if (val !== null) setDarkMode(val === "true");
        } catch (e) {
            console.error("Failed to load dark mode preference", e);
        }
    };

    const toggleDarkMode = async (value: boolean) => {
        setDarkMode(value);
        try {
            await AsyncStorage.setItem("settings_dark_mode", String(value));
        } catch (e) {
            console.error("Failed to save dark mode preference", e);
        }
    };

    const theme = THEME[darkMode ? 'dark' : 'light'];

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode, theme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
