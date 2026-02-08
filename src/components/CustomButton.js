import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';

export const CustomButton = ({
    title,
    onPress,
    loading = false,
    disabled = false,
    variant = 'primary',
    style,
}) => {
    const isDisabled = disabled || loading;

    if (variant === 'primary') {
        return (
            <TouchableOpacity
                style={[styles.button, isDisabled && styles.buttonDisabled, style]}
                onPress={onPress}
                disabled={isDisabled}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={[theme.colors.primary, theme.colors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>{title}</Text>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            style={[styles.button, styles.buttonSecondary, isDisabled && styles.buttonDisabled, style]}
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={theme.colors.text} />
            ) : (
                <Text style={[styles.buttonText, styles.buttonTextSecondary]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: theme.borderRadius.md,
        overflow: 'hidden',
        ...theme.shadows.medium,
    },
    gradient: {
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonSecondary: {
        backgroundColor: theme.colors.cardLight,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    buttonText: {
        color: '#fff',
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.semibold,
    },
    buttonTextSecondary: {
        color: theme.colors.text,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
});
