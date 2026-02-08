import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';

export const StatCard = ({ value, label, colors = [theme.colors.primary, theme.colors.primaryDark] }) => {
    return (
        <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
        >
            <Text style={styles.value}>{value}</Text>
            <Text style={styles.label}>{label}</Text>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.medium,
    },
    value: {
        fontSize: theme.fontSize.xxl,
        fontWeight: theme.fontWeight.bold,
        color: '#fff',
        marginBottom: theme.spacing.xs,
    },
    label: {
        fontSize: theme.fontSize.sm,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: theme.fontWeight.medium,
    },
});
