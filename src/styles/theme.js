export const theme = {
    colors: {
        // Primary Colors - Deep Enterprise Navy with vibrant royal accent
        primary: '#1d4ed8',
        primaryDark: '#0f2b59',
        primaryLight: '#3b82f6',
        primarySoft: 'rgba(29, 78, 216, 0.08)',
        primaryGlow: 'rgba(59, 130, 246, 0.25)',

        // Secondary Colors - Vibrant Solar Orange
        secondary: '#f97316',
        secondaryDark: '#c2410c',
        secondaryLight: '#fb923c',
        secondarySoft: 'rgba(249, 115, 22, 0.08)',

        // Accent Colors - Emerald / Mint Green
        accent: '#10b981',
        accentDark: '#047857',
        accentLight: '#34d399',
        accentSoft: 'rgba(16, 185, 129, 0.08)',

        // Functional Colors
        success: '#10b981',
        successSoft: 'rgba(16, 185, 129, 0.12)',
        danger: '#ef4444',
        dangerSoft: 'rgba(239, 68, 68, 0.12)',
        warning: '#f59e0b',
        warningSoft: 'rgba(245, 158, 11, 0.12)',
        info: '#0ea5e9',
        infoSoft: 'rgba(14, 165, 233, 0.12)',
        purple: '#8b5cf6',
        purpleSoft: 'rgba(139, 92, 246, 0.12)',

        // Backgrounds & Surfaces - Modern Clean Slate
        background: '#f8fafc',
        backgroundDark: '#f1f5f9',
        card: '#ffffff',
        cardLight: '#f8fafc',
        cardElevated: '#ffffff',
        cardHover: '#f1f5f9',

        // Text Hierarchy
        text: '#0f172a',
        textSecondary: '#475569',
        textMuted: '#94a3b8',
        textLight: '#cbd5e1',
        textWhite: '#ffffff',

        // Borders & Structure
        border: '#e2e8f0',
        borderLight: '#f1f5f9',
        borderFocus: '#1d4ed8',
        overlay: 'rgba(15, 23, 42, 0.65)',
        shadowColor: 'rgba(15, 23, 42, 0.08)',
    },

    gradients: {
        primary: ['#1d4ed8', '#1e40af'],
        secondary: ['#f97316', '#ea580c'],
        accent: ['#10b981', '#059669'],
        warning: ['#f59e0b', '#d97706'],
        purple: ['#8b5cf6', '#7c3aed'],
        darkNavy: ['#0f172a', '#1e293b'],
        header: ['#0b1e38', '#133e70', '#1d4ed8'],
        card: ['#ffffff', '#f8fafc'],
        glassHeader: ['rgba(15, 43, 89, 0.95)', 'rgba(29, 78, 216, 0.95)'],
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
        xs: 6,
        sm: 10,
        md: 14,
        lg: 18,
        xl: 26,
        full: 9999,
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
            shadowColor: '#0f172a',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 1,
        },
        md: {
            shadowColor: '#0f172a',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
        },
        lg: {
            shadowColor: '#0f172a',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 6,
        },
        xl: {
            shadowColor: '#0f172a',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.16,
            shadowRadius: 28,
            elevation: 10,
        },
    },
};
