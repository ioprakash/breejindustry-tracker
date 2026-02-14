export const theme = {
    colors: {
        // Primary Colors - Matching Brij Logo Deep Blue
        primary: '#1e5a96',
        primaryDark: '#0d3b6b',
        primaryLight: '#42a5f5',
        primarySoft: 'rgba(30, 90, 150, 0.08)',

        // Secondary Colors - Vibrant Orange from "Brij" text
        secondary: '#ff7b00',
        secondaryDark: '#e06900',
        secondaryLight: '#ffa040',
        secondarySoft: 'rgba(255, 123, 0, 0.08)',

        // Accent Colors - Fresh Green from logo graph
        accent: '#4caf50',
        accentDark: '#388e3c',
        accentLight: '#81c784',

        // Functional Colors
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',

        // Background - Modern light theme
        background: '#f0f4f8',
        backgroundDark: '#e2e8f0',
        card: '#ffffff',
        cardLight: '#f8fafc',
        cardHover: '#fafbfc',

        // Text - Professional hierarchy
        text: '#0f172a',
        textSecondary: '#475569',
        textMuted: '#94a3b8',
        textLight: '#cbd5e1',

        // Utility
        border: '#e2e8f0',
        borderLight: '#f1f5f9',
        borderFocus: '#1e5a96',
        overlay: 'rgba(15, 23, 42, 0.6)',
        shadowColor: 'rgba(0, 0, 0, 0.08)',
    },

    gradients: {
        primary: ['#1e5a96', '#0d3b6b'],
        secondary: ['#ff7b00', '#e06900'],
        accent: ['#10b981', '#059669'],
        warning: ['#f59e0b', '#d97706'],
        header: ['#0d3b6b', '#1e5a96', '#2563eb'],
        card: ['#ffffff', '#f8fafc'],
    },

    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 20,
        xl: 28,
        xxl: 40,
    },

    borderRadius: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        full: 999,
    },

    fontSize: {
        xs: 11,
        sm: 13,
        md: 15,
        lg: 17,
        xl: 22,
        xxl: 28,
        xxxl: 34,
    },

    fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
    },

    shadows: {
        sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 3,
            elevation: 1,
        },
        md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
        },
        lg: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 6,
        },
        xl: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.16,
            shadowRadius: 24,
            elevation: 10,
        },
    },
};
