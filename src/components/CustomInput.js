import React, { useState } from 'react';
import { TextInput, StyleSheet, View, Text, Animated } from 'react-native';
import { theme } from '../styles/theme';

export const CustomInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    required = false,
    multiline = false,
    editable = true,
    error = false,
    icon,
    secureTextEntry = false,
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={styles.container}>
            {label && (
                <Text style={styles.label}>
                    {icon && <Text style={styles.labelIcon}>{icon} </Text>}
                    {label}
                    {required && <Text style={styles.required}> *</Text>}
                </Text>
            )}
            <View style={[
                styles.inputWrapper,
                isFocused && styles.inputWrapperFocused,
                error && styles.inputWrapperError,
                !editable && styles.inputWrapperDisabled,
            ]}>
                <TextInput
                    style={[
                        styles.input,
                        multiline && styles.multiline,
                        !editable && styles.inputDisabled,
                    ]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={theme.colors.textMuted}
                    keyboardType={keyboardType}
                    multiline={multiline}
                    editable={editable}
                    secureTextEntry={secureTextEntry}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.md,
    },
    label: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.textSecondary,
        marginBottom: 6,
        letterSpacing: 0.3,
    },
    labelIcon: {
        fontSize: theme.fontSize.sm,
    },
    required: {
        color: theme.colors.danger,
        fontWeight: theme.fontWeight.bold,
    },
    inputWrapper: {
        backgroundColor: theme.colors.card,
        borderWidth: 1.5,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        overflow: 'hidden',
    },
    inputWrapperFocused: {
        borderColor: theme.colors.primary,
        backgroundColor: '#fff',
        ...theme.shadows.sm,
    },
    inputWrapperError: {
        borderColor: theme.colors.danger,
    },
    inputWrapperDisabled: {
        backgroundColor: theme.colors.cardLight,
        opacity: 0.7,
    },
    input: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 14,
        fontSize: theme.fontSize.md,
        color: theme.colors.text,
    },
    multiline: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    inputDisabled: {
        color: theme.colors.textSecondary,
    },
});
