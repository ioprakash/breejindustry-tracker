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
import { PhotoPicker } from '../components/PhotoPicker';
import { LocationPicker } from '../components/LocationPicker';
import { theme } from '../styles/theme';
import { submitTipperEntry, updateEntry } from '../services/api';
import { getTodayDate } from '../utils/calculations';

const SectionHeader = ({ icon, title }) => (
    <View style={styles.sectionHeader}>
        <View style={styles.sectionAccent} />
        <Text style={styles.sectionIcon}>{icon}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
    </View>
);

export const TipperFormScreen = ({ navigation, route }) => {
    const { initialData, isEdit } = route.params || {};
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(initialData ? {
        ...initialData,
        cftTrip: initialData.cftTrip?.toString() || '',
        locationLink: initialData.locationLink || '',
    } : {
        date: getTodayDate(),
        gadiNo: '',
        driverName: '',
        customerName: '',
        customerNumber: '',
        material: '',
        loadingPlace: '',
        unloadingPlace: '',
        cftTrip: '',
        remarks: '',
        photo: null,
        locationLink: '',
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
            if (isEdit) {
                const result = await updateEntry('Tipper_Logs', initialData.actualEntryTime, formData);
                if (result.success) {
                    Alert.alert('Success', 'Tipper entry updated successfully', [{ text: 'OK', onPress: () => navigation.goBack() }]);
                } else {
                    Alert.alert('Error', result.error || 'Failed to update entry');
                }
                return;
            }

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
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>{isEdit ? '✏️ Edit Tipper Entry' : '🚚 Tipper Entry Form'}</Text>
                        <Text style={styles.subtitle}>{isEdit ? 'Update trip details' : 'Record Tipper trips and materials'}</Text>
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

                    {/* Trip Details Section */}
                    <SectionHeader icon="📦" title="Trip Details" />
                    <View style={styles.sectionCard}>
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

                    {/* Attachments & Location */}
                    <SectionHeader icon="📎" title="Attachments & Location" />
                    <View style={styles.sectionCard}>
                        <LocationPicker
                            existingLocation={formData.locationLink}
                            onLocationSelected={(url) => updateField('locationLink', url)}
                        />
                        <View style={{ marginTop: 10 }}>
                            <PhotoPicker
                                photo={formData.photo}
                                onPhotoSelected={(uri) => updateField('photo', uri)}
                                label="Load Photo (Optional)"
                            />
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <CustomButton
                            title="Cancel"
                            variant="secondary"
                            onPress={() => {
                                if (formData.gadiNo || formData.driverName || formData.material) {
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
        backgroundColor: theme.colors.secondary,
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
