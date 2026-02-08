import React from 'react';
import { TextInput, StyleSheet, View, Text } from 'react-native';
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
}) => {
    return (
        <View style={styles.container}>
            {label && (
                <Text style={styles.label}>
                    {label}
                    {required && <Text style={styles.required}> *</Text>}
                </Text>
            )}
            <TextInput
                style={[
                    styles.input,
                    multiline && styles.multiline,
                    error && styles.inputError,
                    !editable && styles.inputDisabled,
                ]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={theme.colors.textMuted}
                keyboardType={keyboardType}
                multiline={multiline}
                editable={editable}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.md,
    },
    label: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.medium,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    required: {
        color: theme.colors.danger,
    },
    input: {
        backgroundColor: theme.colors.cardLight,
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.sm,
        padding: theme.spacing.md,
        fontSize: theme.fontSize.md,
        color: theme.colors.text,
    },
    multiline: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    inputError: {
        borderColor: theme.colors.danger,
    },
    inputDisabled: {
        backgroundColor: theme.colors.card,
        opacity: 0.7,
    },
});
