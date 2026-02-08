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
import { submitJCBEntry } from '../services/api';
import { calculateJCBTotal, calculateDueAmount, getTodayDate } from '../utils/calculations';

const RUN_MODE_OPTIONS = [
    { label: 'Hour', value: 'Hour' },
    { label: 'Tip', value: 'Tip' },
    { label: 'Number', value: 'Number' },
    { label: 'Other', value: 'Other' },
];

export const JCBFormScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        gadiNo: '',
        date: getTodayDate(),
        driverName: '',
        startMtrDay: '',
        stopMtrDay: '',
        workDetail: '',
        runMode: '',
        otherRunMode: '',
        startMtr: '',
        stopMtr: '',
        tipCount: '',
        rate: '',
        totalAmount: '0',
        receivedAmount: '',
        dueAmount: '0',
    });

    const updateField = (field, value) => {
        const newData = { ...formData, [field]: value };

        // Auto-calculate total amount based on run mode
        if (newData.runMode === 'Hour') {
            if (field === 'startMtr' || field === 'stopMtr' || field === 'rate') {
                const hours = (parseFloat(newData.stopMtr) || 0) - (parseFloat(newData.startMtr) || 0);
                const total = hours * (parseFloat(newData.rate) || 0);
                newData.totalAmount = Math.max(0, total).toString();
                newData.dueAmount = calculateDueAmount(newData.totalAmount, newData.receivedAmount).toString();
            }
        } else if (newData.runMode === 'Tip' || newData.runMode === 'Number' || !newData.runMode) {
            if (field === 'tipCount' || field === 'rate') {
                const total = calculateJCBTotal(newData.tipCount, newData.rate);
                newData.totalAmount = total.toString();
                newData.dueAmount = calculateDueAmount(total, newData.receivedAmount).toString();
            }
        }

        // Auto-calculate due amount
        if (field === 'receivedAmount') {
            newData.dueAmount = calculateDueAmount(newData.totalAmount, value).toString();
        }

        setFormData(newData);
    };

    const validateForm = () => {
        const requiredFields = ['gadiNo', 'date', 'driverName', 'rate', 'runMode'];

        // Add mode-specific required fields
        if (formData.runMode === 'Hour') {
            requiredFields.push('startMtr', 'stopMtr');
        } else if (formData.runMode === 'Tip') {
            requiredFields.push('tipCount');
        }

        for (const field of requiredFields) {
            if (!formData[field] || (typeof formData[field] === 'string' && !formData[field].trim())) {
                Alert.alert('Validation Error', `Please fill ${field} field`);
                return false;
            }
        }
        if (formData.runMode === 'Other' && !formData.otherRunMode.trim()) {
            Alert.alert('Validation Error', 'Please specify the other run mode');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const dataToSubmit = {
                ...formData,
                runMode: formData.runMode === 'Other' ? formData.otherRunMode : formData.runMode
            };
            delete dataToSubmit.otherRunMode;

            const result = await submitJCBEntry(dataToSubmit);

            if (result.queued) {
                Alert.alert(
                    'Saved Offline',
                    'Entry saved and will be synced when online',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            } else if (result.success) {
                Alert.alert(
                    'Success',
                    'JCB entry submitted successfully',
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
                        <Text style={styles.title}>🚜 JCB Entry Form</Text>
                        <Text style={styles.subtitle}>Log JCB work details and payments</Text>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.form}>
                        <CustomInput
                            label="Gadi No"
                            value={formData.gadiNo}
                            onChangeText={(val) => updateField('gadiNo', val)}
                            placeholder="Enter Gadi number"
                            required
                        />

                        <CustomInput
                            label="Date"
                            value={formData.date}
                            onChangeText={(val) => updateField('date', val)}
                            placeholder="YYYY-MM-DD"
                            required
                        />

                        <CustomInput
                            label="Driver Name"
                            value={formData.driverName}
                            onChangeText={(val) => updateField('driverName', val)}
                            placeholder="Enter driver name"
                            required
                        />

                        <View style={styles.row}>
                            <View style={styles.halfWidth}>
                                <CustomInput
                                    label="Start Mtr Day"
                                    value={formData.startMtrDay}
                                    onChangeText={(val) => updateField('startMtrDay', val)}
                                    placeholder="0"
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={styles.halfWidth}>
                                <CustomInput
                                    label="Stop Mtr Day"
                                    value={formData.stopMtrDay}
                                    onChangeText={(val) => updateField('stopMtrDay', val)}
                                    placeholder="0"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <CustomInput
                            label="Work Detail"
                            value={formData.workDetail}
                            onChangeText={(val) => updateField('workDetail', val)}
                            placeholder="Describe work"
                            multiline
                        />

                        <CustomDropdown
                            label="Run Mode"
                            options={RUN_MODE_OPTIONS}
                            selectedValue={formData.runMode}
                            onValueChange={(val) => updateField('runMode', val)}
                            placeholder="Select run mode"
                            required
                        />

                        {formData.runMode === 'Other' && (
                            <CustomInput
                                label="Specify Other Mode"
                                value={formData.otherRunMode}
                                onChangeText={(val) => updateField('otherRunMode', val)}
                                placeholder="Enter custom run mode"
                                required
                            />
                        )}

                        {formData.runMode === 'Hour' && (
                            <View style={styles.row}>
                                <View style={styles.halfWidth}>
                                    <CustomInput
                                        label="Start Mtr"
                                        value={formData.startMtr}
                                        onChangeText={(val) => updateField('startMtr', val)}
                                        placeholder="0"
                                        keyboardType="numeric"
                                        required
                                    />
                                </View>
                                <View style={styles.halfWidth}>
                                    <CustomInput
                                        label="Stop Mtr"
                                        value={formData.stopMtr}
                                        onChangeText={(val) => updateField('stopMtr', val)}
                                        placeholder="0"
                                        keyboardType="numeric"
                                        required
                                    />
                                </View>
                            </View>
                        )}

                        <View style={styles.row}>
                            {(formData.runMode === 'Tip' || formData.runMode === 'Number' || !formData.runMode) && (
                                <View style={styles.halfWidth}>
                                    <CustomInput
                                        label={formData.runMode === 'Number' ? "Count" : "Tip Count"}
                                        value={formData.tipCount}
                                        onChangeText={(val) => updateField('tipCount', val)}
                                        placeholder="0"
                                        keyboardType="numeric"
                                        required
                                    />
                                </View>
                            )}
                            <View style={styles.halfWidth}>
                                <CustomInput
                                    label="Rate"
                                    value={formData.rate}
                                    onChangeText={(val) => updateField('rate', val)}
                                    placeholder="0"
                                    keyboardType="numeric"
                                    required
                                />
                            </View>
                        </View>

                        <CustomInput
                            label="Total Amount"
                            value={formData.totalAmount}
                            editable={false}
                            keyboardType="numeric"
                        />

                        <CustomInput
                            label="Received Amount"
                            value={formData.receivedAmount}
                            onChangeText={(val) => updateField('receivedAmount', val)}
                            placeholder="0"
                            keyboardType="numeric"
                        />

                        <CustomInput
                            label="Due Amount"
                            value={formData.dueAmount}
                            editable={false}
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <CustomButton
                            title="Cancel"
                            variant="secondary"
                            onPress={() => {
                                if (formData.gadiNo || formData.driverName || formData.rate !== '') {
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
    sectionTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.sm,
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
