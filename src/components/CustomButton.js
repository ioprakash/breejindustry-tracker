import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';

export const CustomButton = ({
    title,
    onPress,
    loading = false,
    disabled = false,
    variant = 'primary',
    style,
    icon,
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const isDisabled = disabled || loading;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4,
        }).start();
    };

    if (variant === 'primary') {
        return (
            <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
                <TouchableOpacity
                    style={[styles.button, isDisabled && styles.buttonDisabled]}
                    onPress={onPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    disabled={isDisabled}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={theme.gradients.primary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradient}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.buttonText}>
                                {icon ? `${icon}  ${title}` : title}
                            </Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        );
    }

    if (variant === 'danger') {
        return (
            <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
                <TouchableOpacity
                    style={[styles.button, styles.buttonDanger, isDisabled && styles.buttonDisabled]}
                    onPress={onPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    disabled={isDisabled}
                    activeOpacity={0.9}
                >
                    {loading ? (
                        <ActivityIndicator color={theme.colors.danger} size="small" />
                    ) : (
                        <Text style={[styles.buttonText, styles.buttonTextDanger]}>
                            {icon ? `${icon}  ${title}` : title}
                        </Text>
                    )}
                </TouchableOpacity>
            </Animated.View>
        );
    }

    return (
        <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
            <TouchableOpacity
                style={[styles.button, styles.buttonSecondary, isDisabled && styles.buttonDisabled]}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isDisabled}
                activeOpacity={0.9}
            >
                {loading ? (
                    <ActivityIndicator color={theme.colors.textSecondary} size="small" />
                ) : (
                    <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
                        {icon ? `${icon}  ${title}` : title}
                    </Text>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: theme.borderRadius.md,
        overflow: 'hidden',
        ...theme.shadows.md,
    },
    gradient: {
        paddingVertical: 16,
        paddingHorizontal: theme.spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonSecondary: {
        backgroundColor: theme.colors.card,
        borderWidth: 1.5,
        borderColor: theme.colors.border,
        paddingVertical: 16,
        paddingHorizontal: theme.spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonDanger: {
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        borderWidth: 1.5,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        paddingVertical: 16,
        paddingHorizontal: theme.spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
        letterSpacing: 0.5,
    },
    buttonTextSecondary: {
        color: theme.colors.textSecondary,
    },
    buttonTextDanger: {
        color: theme.colors.danger,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
});
