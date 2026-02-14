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
} from 'react-native';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { CustomDropdown } from '../components/CustomDropdown';
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
        { label: 'Cash', value: 'Cash' },
        { label: 'Online / UPI', value: 'Online' },
        { label: 'Bank Transfer', value: 'Bank' },
        { label: 'Credit', value: 'Credit' },
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

                        <CustomDropdown
                            label="Expense Mode"
                            value={formData.expenseMode}
                            onSelect={(val) => setFormData({ ...formData, expenseMode: val })}
                            options={expenseModes}
                            icon="💳"
                        />

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
    }
});
