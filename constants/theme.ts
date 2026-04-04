export const THEME = {
    light: {
        bg: "#F1F5F9",
        surface: "#FFFFFF",
        surfaceSelected: "#F8FAFC",
        headerBg: "#FFFFFF",
        text: "#1e293b",
        textMuted: "#64748b",
        textLight: "#94a3b8",
        border: "#cbd5e1",
        borderStrong: "#94a3b8",
        iconContainer: "#F3E8FF",
        primary: "#6D28D9",
        destructiveBg: "#FEE2E2",
    },
    dark: {
        bg: "#111827",
        surface: "#1F2937",
        surfaceSelected: "#374151",
        headerBg: "#1F2937",
        text: "#F9FAFB",
        textMuted: "#9CA3AF",
        textLight: "#6B7280",
        border: "#374151",
        borderStrong: "#111827",
        iconContainer: "#312E81",
        primary: "#A78BFA",
        destructiveBg: "#450a0a",
    }
} as const;

export type ThemeType = {
    bg: string;
    surface: string;
    surfaceSelected: string;
    headerBg: string;
    text: string;
    textMuted: string;
    textLight: string;
    border: string;
    borderStrong: string;
    iconContainer: string;
    primary: string;
    destructiveBg: string;
};
