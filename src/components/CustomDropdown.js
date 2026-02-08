import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    FlatList,
    TouchableWithoutFeedback,
} from 'react-native';
import { theme } from '../styles/theme';

export const CustomDropdown = ({ label, options, selectedValue, onValueChange, placeholder, required }) => {
    const [modalVisible, setModalVisible] = useState(false);

    const handleSelect = (value) => {
        onValueChange(value);
        setModalVisible(false);
    };

    const selectedOption = options.find(opt => opt.value === selectedValue);

    return (
        <View style={styles.container}>
            {label && (
                <Text style={styles.label}>
                    {label}
                    {required && <Text style={styles.required}> *</Text>}
                </Text>
            )}

            <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
            >
                <Text style={[
                    styles.selectedText,
                    !selectedValue && styles.placeholderText
                ]}>
                    {selectedOption ? selectedOption.label : (placeholder || 'Select an option')}
                </Text>
                <View style={styles.arrowIcon}>
                    <Text style={styles.arrowText}>▼</Text>
                </View>
            </TouchableOpacity>

            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{label || 'Select'}</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Text style={styles.closeButton}>✕</Text>
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={options}
                                keyExtractor={(item) => item.value}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.optionItem,
                                            selectedValue === item.value && styles.selectedOptionItem
                                        ]}
                                        onPress={() => handleSelect(item.value)}
                                    >
                                        <Text style={[
                                            styles.optionText,
                                            selectedValue === item.value && styles.selectedOptionText
                                        ]}>
                                            {item.label}
                                        </Text>
                                        {selectedValue === item.value && (
                                            <Text style={styles.checkIcon}>✓</Text>
                                        )}
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
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
    dropdownButton: {
        backgroundColor: theme.colors.cardLight,
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.sm,
        padding: theme.spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectedText: {
        fontSize: theme.fontSize.md,
        color: theme.colors.text,
    },
    placeholderText: {
        color: theme.colors.textMuted,
    },
    arrowIcon: {
        marginLeft: theme.spacing.sm,
    },
    arrowText: {
        color: theme.colors.textSecondary,
        fontSize: theme.fontSize.xs,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        padding: theme.spacing.xl,
    },
    modalContent: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.md,
        maxHeight: '80%',
        overflow: 'hidden',
        ...theme.shadows.large,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    modalTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
    },
    closeButton: {
        fontSize: theme.fontSize.lg,
        color: theme.colors.textSecondary,
        padding: theme.spacing.xs,
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    selectedOptionItem: {
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
    },
    optionText: {
        fontSize: theme.fontSize.md,
        color: theme.colors.text,
    },
    selectedOptionText: {
        color: theme.colors.primary,
        fontWeight: theme.fontWeight.semibold,
    },
    checkIcon: {
        color: theme.colors.primary,
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
    },
});
