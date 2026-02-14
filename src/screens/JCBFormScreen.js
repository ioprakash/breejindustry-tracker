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
import { PhotoPicker } from '../components/PhotoPicker';
import { LocationPicker } from '../components/LocationPicker';
import { theme } from '../styles/theme';
import { submitJCBEntry, updateEntry } from '../services/api';
import { calculateJCBTotal, calculateDueAmount, getTodayDate } from '../utils/calculations';

const RUN_MODE_OPTIONS = [
    { label: 'Hour', value: 'Hour' },
    { label: 'Tip', value: 'Tip' },
    { label: 'Number', value: 'Number' },
    { label: 'Other', value: 'Other' },
];

const SectionHeader = ({ icon, title }) => (
    <View style={styles.sectionHeader}>
        <View style={styles.sectionAccent} />
        <Text style={styles.sectionIcon}>{icon}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
    </View>
);

export const JCBFormScreen = ({ navigation, route }) => {
    const { initialData, isEdit } = route.params || {};
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(initialData ? {
        ...initialData,
        receivedAmount: initialData.paidAmount?.toString() || '', // Map field name if different
        rate: initialData.rate?.toString() || '',
        totalAmount: initialData.totalAmount?.toString() || '',
        locationLink: initialData.locationLink || '',
        remarks: initialData.remarks || '',
    } : {
        date: getTodayDate(),
        gadiNo: '',
        driverName: '',
        customerName: '',
        customerNumber: '',
        runMode: 'Hour',
        workDetail: '',
        startMtr: '',
        stopMtr: '',
        totalHour: '',
        startMtrDay: '',
        stopMtrDay: '',
        rate: '',
        totalAmount: '',
        receivedAmount: '',
        remarks: '',
        locationLink: '',
        photo: null,
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

            if (isEdit) {
                // For edit, we need the original timestamp to find the row
                const result = await updateEntry('JCB_Logs', initialData.actualEntryTime, dataToSubmit);
                if (result.success) {
                    Alert.alert('Success', 'Entry updated successfully', [{ text: 'OK', onPress: () => navigation.goBack() }]);
                } else {
                    Alert.alert('Error', result.error || 'Failed to update entry');
                }
                return;
            }

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
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>{isEdit ? '✏️ Edit JCB Entry' : '🚜 JCB Entry Form'}</Text>
                        <Text style={styles.subtitle}>{isEdit ? 'Update details for this record' : 'Log JCB work details and payments'}</Text>
                    </View>

                    {/* Vehicle Info Section */}
                    <SectionHeader icon="🚗" title="Vehicle Information" />
                    <View style={styles.sectionCard}>
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
                    </View>

                    {/* Customer Info Section */}
                    <SectionHeader icon="👤" title="Customer Information" />
                    <View style={styles.sectionCard}>
                        <CustomInput
                            label="Customer Name"
                            value={formData.customerName}
                            onChangeText={(val) => updateField('customerName', val)}
                            placeholder="Enter customer name"
                        />
                        <CustomInput
                            label="Customer Number"
                            value={formData.customerNumber}
                            onChangeText={(val) => updateField('customerNumber', val)}
                            placeholder="Enter phone number"
                            keyboardType="phone-pad"
                        />
                    </View>

                    {/* Work Details Section */}
                    <SectionHeader icon="⚙️" title="Work Details" />
                    <View style={styles.sectionCard}>
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
                    </View>

                    {/* Payment Section */}
                    <SectionHeader icon="💰" title="Payment Details" />
                    <View style={styles.sectionCard}>
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

                    {/* Attachments & Location */}
                    <SectionHeader icon="📎" title="Attachments & Location" />
                    <View style={styles.sectionCard}>
                        <LocationPicker
                            existingLocation={formData.locationLink}
                            onLocationSelected={(url, address) => {
                                setFormData(prev => ({ ...prev, locationLink: url, address: address }));
                            }}
                        />

                        <View style={{ marginTop: 10 }}>
                            <PhotoPicker
                                photo={null} // JCB doesnt save photos yet but we have the picker
                                onPhotoSelected={(uri) => { }}
                                label="Work Site Photo (Optional)"
                            />
                        </View>
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
                            title={loading ? 'Processing...' : (isEdit ? 'Update Entry' : 'Submit Entry')}
                            icon="✓"
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
        paddingBottom: theme.spacing.xxl + 20,
    },
    header: {
        marginBottom: theme.spacing.lg,
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
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing.lg,
        marginBottom: theme.spacing.md,
    },
    sectionAccent: {
        width: 4,
        height: 22,
        borderRadius: 2,
        backgroundColor: theme.colors.primary,
        marginRight: theme.spacing.sm,
    },
    sectionIcon: {
        fontSize: 18,
        marginRight: 6,
    },
    sectionTitle: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
        letterSpacing: 0.3,
    },
    sectionCard: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        ...theme.shadows.sm,
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
        marginTop: theme.spacing.xl,
        marginBottom: theme.spacing.xl,
    },
    buttonHalf: {
        flex: 1,
    },
});
