import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    Alert,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { theme } from '../styles/theme';
import { getEmployees, addEmployee } from '../services/api';

export const ManageEmployeesScreen = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newEmp, setNewEmp] = useState({ name: '', password: '' });

    const loadEmployees = async () => {
        setFetching(true);
        try {
            const result = await getEmployees();
            if (result.success) {
                setEmployees(result.data);
            }
        } catch (error) {
            console.error('Error loading employees:', error);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        loadEmployees();
    }, []);

    const handleAddEmployee = async () => {
        if (!newEmp.name || !newEmp.password) {
            Alert.alert('Validation Error', 'Please enter both name and password.');
            return;
        }

        setLoading(true);
        try {
            const result = await addEmployee(newEmp.name, newEmp.password);
            if (result.success) {
                Alert.alert('Success', 'Employee added successfully');
                setNewEmp({ name: '', password: '' });
                setShowAddForm(false);
                loadEmployees();
            } else {
                Alert.alert('Error', result.error || 'Failed to add employee');
            }
        } catch (error) {
            Alert.alert('Error', 'Connection failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Text style={styles.title}>👥 Employee Management</Text>
                        <Text style={styles.subtitle}>Add or view system employees and passwords</Text>
                    </View>

                    {/* Add Employee Form */}
                    <TouchableOpacity
                        style={styles.addToggle}
                        onPress={() => setShowAddForm(!showAddForm)}
                    >
                        <Text style={styles.addToggleText}>{showAddForm ? '❌ Cancel' : '➕ Add New Employee'}</Text>
                    </TouchableOpacity>

                    {showAddForm && (
                        <View style={styles.addCard}>
                            <CustomInput
                                label="Employee Name"
                                value={newEmp.name}
                                onChangeText={(val) => setNewEmp(prev => ({ ...prev, name: val }))}
                                placeholder="Enter full name"
                            />
                            <CustomInput
                                label="Access Password"
                                value={newEmp.password}
                                onChangeText={(val) => setNewEmp(prev => ({ ...prev, password: val }))}
                                placeholder="Enter secure password"
                            />
                            <CustomButton
                                title="Save Employee"
                                onPress={handleAddEmployee}
                                loading={loading}
                                style={{ marginTop: 10 }}
                            />
                        </View>
                    )}

                    <Text style={styles.sectionTitle}>Existing Employees</Text>
                    {fetching ? (
                        <ActivityIndicator color={theme.colors.primary} />
                    ) : (
                        <View style={styles.list}>
                            {employees.map((emp, index) => (
                                <View key={index} style={styles.empItem}>
                                    <View style={styles.empInfo}>
                                        <Text style={styles.empName}>{emp.name}</Text>
                                        <Text style={styles.empRole}>Staff Member</Text>
                                    </View>
                                    <View style={styles.pwdContainer}>
                                        <Text style={styles.pwdLabel}>Password:</Text>
                                        <Text style={styles.pwdText}>{emp.password}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
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
        paddingBottom: theme.spacing.xxl,
    },
    header: {
        marginBottom: theme.spacing.xl,
    },
    title: {
        fontSize: theme.fontSize.xxl,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
    },
    subtitle: {
        fontSize: theme.fontSize.md,
        color: theme.colors.textSecondary,
    },
    addToggle: {
        backgroundColor: theme.colors.primarySoft,
        padding: 15,
        borderRadius: theme.borderRadius.lg,
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    addToggleText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    addCard: {
        backgroundColor: theme.colors.card,
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        marginBottom: theme.spacing.xl,
        ...theme.shadows.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    list: {
        gap: theme.spacing.md,
    },
    empItem: {
        backgroundColor: theme.colors.card,
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        ...theme.shadows.sm,
    },
    empInfo: {
        flex: 1,
    },
    empName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    empRole: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    pwdContainer: {
        alignItems: 'flex-end',
    },
    pwdLabel: {
        fontSize: 10,
        color: theme.colors.textMuted,
        textTransform: 'uppercase',
    },
    pwdText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.secondary,
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    }
});
