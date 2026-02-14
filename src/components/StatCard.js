import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';

export const StatCard = ({ value, label, icon, colors = theme.gradients.primary }) => {
    return (
        <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
        >
            <View style={styles.content}>
                {icon && <Text style={styles.icon}>{icon}</Text>}
                <View style={styles.textContainer}>
                    <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
                    <Text style={styles.label}>{label}</Text>
                </View>
            </View>
            <View style={styles.decorCircle} />
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        overflow: 'hidden',
        position: 'relative',
        ...theme.shadows.md,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        fontSize: 32,
        marginRight: theme.spacing.md,
    },
    textContainer: {
        flex: 1,
    },
    value: {
        fontSize: theme.fontSize.xxl,
        fontWeight: theme.fontWeight.extrabold,
        color: '#fff',
        marginBottom: 2,
    },
    label: {
        fontSize: theme.fontSize.sm,
        color: 'rgba(255, 255, 255, 0.85)',
        fontWeight: theme.fontWeight.medium,
        letterSpacing: 0.3,
    },
    decorCircle: {
        position: 'absolute',
        right: -20,
        top: -20,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
});
