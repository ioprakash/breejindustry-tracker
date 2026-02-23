import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
} from 'react-native';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { theme } from '../styles/theme';
import { submitExpenseEntry } from '../services/api';

export const ExpenseFormScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        expenseMode: 'Cash',
        description: '',
        amount: '',
        remark: '',
    });

    const expenseModes = [
        { label: 'Cash', value: 'Cash', icon: '💵' },
        { label: 'Online Payment', value: 'Online', icon: '📱' },
        { label: 'Cheque', value: 'Cheque', icon: '📄' },
    ];

    const handleSubmit = async () => {
        if (!formData.amount || !formData.description) {
            Alert.alert('Error', 'Please fill in Amount and Description');
            return;
        }

        setLoading(true);
        try {
            const result = await submitExpenseEntry(formData);
            if (result.success) {
                Alert.alert(
                    'Success',
                    result.queued ? 'Expense saved offline and will sync later.' : 'Expense logged successfully!',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            } else {
                Alert.alert('Error', 'Failed to save expense');
            }
        } catch (error) {
            console.error('Submit error:', error);
            Alert.alert('Error', 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.card}>
                        <CustomInput
                            label="Date"
                            value={formData.date}
                            onChangeText={(val) => setFormData({ ...formData, date: val })}
                            placeholder="YYYY-MM-DD"
                            icon="📅"
                            required
                        />

                        {/* Expense Mode - Tick Mark Radio Buttons */}
                        <View style={styles.modeContainer}>
                            <Text style={styles.modeLabel}>
                                💳 Expense Mode <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={styles.modeOptions}>
                                {expenseModes.map((mode) => {
                                    const isSelected = formData.expenseMode === mode.value;
                                    return (
                                        <TouchableOpacity
                                            key={mode.value}
                                            style={[
                                                styles.modeOption,
                                                isSelected && styles.modeOptionSelected,
                                            ]}
                                            onPress={() => setFormData({ ...formData, expenseMode: mode.value })}
                                            activeOpacity={0.7}
                                        >
                                            <View style={[
                                                styles.tickBox,
                                                isSelected && styles.tickBoxSelected,
                                            ]}>
                                                {isSelected && (
                                                    <Text style={styles.tickMark}>✓</Text>
                                                )}
                                            </View>
                                            <Text style={styles.modeIcon}>{mode.icon}</Text>
                                            <Text style={[
                                                styles.modeText,
                                                isSelected && styles.modeTextSelected,
                                            ]}>
                                                {mode.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        <CustomInput
                            label="Description"
                            value={formData.description}
                            onChangeText={(val) => setFormData({ ...formData, description: val })}
                            placeholder="e.g. Spare parts, Tea, Hotel"
                            icon="📝"
                            required
                            multiline
                        />

                        <CustomInput
                            label="Amount"
                            value={formData.amount}
                            onChangeText={(val) => setFormData({ ...formData, amount: val })}
                            placeholder="0.00"
                            keyboardType="numeric"
                            icon="💰"
                            required
                        />

                        <CustomInput
                            label="Remark"
                            value={formData.remark}
                            onChangeText={(val) => setFormData({ ...formData, remark: val })}
                            placeholder="Any extra info..."
                            icon="ℹ️"
                        />

                        <CustomButton
                            title="Save Daily Expense"
                            onPress={handleSubmit}
                            loading={loading}
                            icon="💎"
                            style={styles.submitBtn}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        padding: theme.spacing.lg,
    },
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.xl,
        ...theme.shadows.md,
    },
    submitBtn: {
        marginTop: theme.spacing.xl,
    },
    // Expense Mode Styles
    modeContainer: {
        marginBottom: theme.spacing.md,
    },
    modeLabel: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.medium,
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    required: {
        color: theme.colors.danger,
    },
    modeOptions: {
        gap: theme.spacing.sm,
    },
    modeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: theme.borderRadius.md,
        borderWidth: 2,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.cardLight,
    },
    modeOptionSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: 'rgba(30, 90, 150, 0.06)',
    },
    tickBox: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: theme.colors.textMuted,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    tickBoxSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primary,
    },
    tickMark: {
        color: '#fff',
        fontSize: 14,
        fontWeight: theme.fontWeight.bold,
    },
    modeIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    modeText: {
        fontSize: theme.fontSize.md,
        color: theme.colors.textSecondary,
        fontWeight: theme.fontWeight.medium,
    },
    modeTextSelected: {
        color: theme.colors.text,
        fontWeight: theme.fontWeight.bold,
    },
});
