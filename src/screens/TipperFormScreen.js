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
import { submitTipperEntry } from '../services/api';
import { getTodayDate } from '../utils/calculations';

export const TipperFormScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        gadiNo: '',
        driverName: '',
        date: getTodayDate(),
        material: '',
        loadingPlace: '',
        unloadingPlace: '',
        cftTrip: '',
    });

    const updateField = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const validateForm = () => {
        const required = ['gadiNo', 'driverName', 'date', 'material'];
        for (const field of required) {
            if (!formData[field].trim()) {
                Alert.alert('Validation Error', 'Please fill all required fields');
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const result = await submitTipperEntry(formData);

            if (result.queued) {
                Alert.alert(
                    'Saved Offline',
                    'Entry saved and will be synced when online',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            } else if (result.success) {
                Alert.alert(
                    'Success',
                    'Tipper entry submitted successfully',
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
                        <Text style={styles.title}>🚚 Tipper Entry Form</Text>
                        <Text style={styles.subtitle}>Record Tipper trips and materials</Text>
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
                            label="Driver Name"
                            value={formData.driverName}
                            onChangeText={(val) => updateField('driverName', val)}
                            placeholder="Enter driver name"
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
                            label="Material"
                            value={formData.material}
                            onChangeText={(val) => updateField('material', val)}
                            placeholder="Type of material"
                            required
                        />

                        <CustomInput
                            label="Loading Place"
                            value={formData.loadingPlace}
                            onChangeText={(val) => updateField('loadingPlace', val)}
                            placeholder="Where loaded"
                        />

                        <CustomInput
                            label="Unloading Place"
                            value={formData.unloadingPlace}
                            onChangeText={(val) => updateField('unloadingPlace', val)}
                            placeholder="Where unloaded"
                        />

                        <CustomInput
                            label="CFT/Trip"
                            value={formData.cftTrip}
                            onChangeText={(val) => updateField('cftTrip', val)}
                            placeholder="0"
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <CustomButton
                            title="Cancel"
                            variant="secondary"
                            onPress={() => navigation.goBack()}
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
