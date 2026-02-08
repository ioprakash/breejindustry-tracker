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
import { theme } from '../styles/theme';
import { submitDieselEntry } from '../services/api';
import { getTodayDate } from '../utils/calculations';

export const DieselEntryScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        gadiNo: '',
        date: getTodayDate(),
        dieselLtr: '',
        dieselCost: '',
        dieselMtr: '',
        dieselPaidBy: '',
        remarks: '',
    });

    const updateField = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const validateForm = () => {
        const required = ['gadiNo', 'date', 'dieselLtr', 'dieselCost'];
        for (const field of required) {
            if (!formData[field].trim()) {
                Alert.alert('Validation Error', `Please fill ${field.replace('diesel', 'Diesel ')} field`);
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const result = await submitDieselEntry(formData);

            if (result.queued) {
                Alert.alert(
                    'Saved Offline',
                    'Diesel entry saved and will be synced when online',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            } else if (result.success) {
                Alert.alert(
                    'Success',
                    'Diesel entry submitted successfully',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to submit entry');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoid}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>⛽ Diesel Entry Form</Text>
                        <Text style={styles.subtitle}>Log diesel usage for vehicles</Text>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.form}>
                        <CustomInput
                            label="Vehicle / Gadi No"
                            value={formData.gadiNo}
                            onChangeText={(val) => updateField('gadiNo', val)}
                            placeholder="Enter vehicle number"
                            required
                        />

                        <CustomInput
                            label="Date"
                            value={formData.date}
                            onChangeText={(val) => updateField('date', val)}
                            placeholder="YYYY-MM-DD"
                            required
                        />

                        <View style={styles.row}>
                            <View style={styles.halfWidth}>
                                <CustomInput
                                    label="Diesel (Ltr)"
                                    value={formData.dieselLtr}
                                    onChangeText={(val) => updateField('dieselLtr', val)}
                                    placeholder="0"
                                    keyboardType="numeric"
                                    required
                                />
                            </View>
                            <View style={styles.halfWidth}>
                                <CustomInput
                                    label="Diesel Cost"
                                    value={formData.dieselCost}
                                    onChangeText={(val) => updateField('dieselCost', val)}
                                    placeholder="0"
                                    keyboardType="numeric"
                                    required
                                />
                            </View>
                        </View>

                        <CustomInput
                            label="Meter Reading"
                            value={formData.dieselMtr}
                            onChangeText={(val) => updateField('dieselMtr', val)}
                            placeholder="0"
                            keyboardType="numeric"
                        />

                        <CustomInput
                            label="Paid By"
                            value={formData.dieselPaidBy}
                            onChangeText={(val) => updateField('dieselPaidBy', val)}
                            placeholder="Name of payer"
                        />

                        <CustomInput
                            label="Remarks"
                            value={formData.remarks}
                            onChangeText={(val) => updateField('remarks', val)}
                            placeholder="Additional notes"
                            multiline
                        />
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <CustomButton
                            title="Cancel"
                            variant="secondary"
                            onPress={() => {
                                if (formData.gadiNo || formData.dieselLtr || formData.dieselCost) {
                                    Alert.alert(
                                        'Discard Entry?',
                                        'Are you sure you want to discard this entry?',
                                        [
                                            { text: 'No', style: 'cancel' },
                                            { text: 'Yes', onPress: () => navigation.goBack() }
                                        ]
                                    );
                                } else {
                                    navigation.goBack();
                                }
                            }}
                            style={styles.buttonHalf}
                        />
                        <CustomButton
                            title={loading ? 'Submitting...' : 'Submit Entry'}
                            onPress={handleSubmit}
                            loading={loading}
                            style={styles.buttonHalf}
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
    keyboardAvoid: {
        flex: 1,
    },
    scrollContent: {
        padding: theme.spacing.lg,
    },
    header: {
        marginBottom: theme.spacing.xl,
    },
    title: {
        fontSize: theme.fontSize.xxl,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    subtitle: {
        fontSize: theme.fontSize.md,
        color: theme.colors.textSecondary,
    },
    form: {
        marginBottom: theme.spacing.xl,
    },
    row: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    halfWidth: {
        flex: 1,
    },
    actions: {
        flexDirection: 'row',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.xl,
    },
    buttonHalf: {
        flex: 1,
    },
});
