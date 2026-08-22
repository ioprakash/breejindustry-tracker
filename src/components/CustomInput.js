import React, { useState } from 'react';
import { TextInput, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
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
    rightElement,
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={styles.container}>
            {label && (
                <View style={styles.labelRow}>
                    <Text style={styles.label}>
                        {icon && <Text style={styles.labelIcon}>{icon} </Text>}
                        {label}
                    </Text>
                    {required && <Text style={styles.required}>* Required</Text>}
                </View>
            )}
            <View style={[
                styles.inputWrapper,
                isFocused && styles.inputWrapperFocused,
                error && styles.inputWrapperError,
                !editable && styles.inputWrapperDisabled,
                multiline && styles.inputWrapperMultiline,
            ]}>
                <TextInput
                    style={[
                        styles.input,
                        multiline && styles.multiline,
                        !editable && styles.inputDisabled,
                    ]}
                    value={value !== null && value !== undefined ? String(value) : ''}
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
                {rightElement && (
                    <View style={styles.rightElementContainer}>
                        {rightElement}
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.md + 2,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    label: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.textSecondary,
        letterSpacing: 0.2,
    },
    labelIcon: {
        fontSize: 13,
    },
    required: {
        fontSize: 10,
        color: theme.colors.danger,
        fontWeight: theme.fontWeight.bold,
        textTransform: 'uppercase',
    },
    inputWrapper: {
        backgroundColor: theme.colors.card,
        borderWidth: 1.5,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
        ...theme.shadows.sm,
    },
    inputWrapperFocused: {
        borderColor: theme.colors.primary,
        backgroundColor: '#ffffff',
        borderWidth: 1.8,
    },
    inputWrapperError: {
        borderColor: theme.colors.danger,
    },
    inputWrapperDisabled: {
        backgroundColor: theme.colors.cardLight,
        opacity: 0.75,
    },
    inputWrapperMultiline: {
        alignItems: 'flex-start',
    },
    input: {
        flex: 1,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 13,
        fontSize: theme.fontSize.md,
        color: theme.colors.text,
        fontWeight: theme.fontWeight.medium,
    },
    multiline: {
        minHeight: 90,
        textAlignVertical: 'top',
        paddingTop: 12,
    },
    inputDisabled: {
        color: theme.colors.textSecondary,
    },
    rightElementContainer: {
        paddingRight: theme.spacing.md,
    },
});
