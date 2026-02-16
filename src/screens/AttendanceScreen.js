import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    Alert,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LocationPicker } from '../components/LocationPicker';
import { CustomButton } from '../components/CustomButton';
import { theme } from '../styles/theme';
import { submitAttendance, getAttendanceEntries } from '../services/api';
import { getTodayDate } from '../utils/calculations';

export const AttendanceScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [history, setHistory] = useState([]);
    const [formData, setFormData] = useState({
        date: getTodayDate(),
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        locationLink: '',
        address: ''
    });

    const loadHistory = async () => {
        setFetching(true);
        try {
            const result = await getAttendanceEntries();
            if (result.success) {
                setHistory(result.data);
            }
        } catch (error) {
            console.error('Error loading attendance history:', error);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const handleAttendance = async (type) => {
        if (!formData.locationLink) {
            Alert.alert('Location Required', 'Please pick your location before marking attendance.');
            return;
        }

        setLoading(true);
        try {
            const data = {
                ...formData,
                type: type, // 'In' or 'Out'
                time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                date: getTodayDate()
            };

            const result = await submitAttendance(data);
            if (result.success) {
                Alert.alert('Success', `Attendance ${type} requested for approval.`, [
                    { text: 'OK', onPress: () => loadHistory() }
                ]);
            } else {
                Alert.alert('Error', result.error || 'Failed to submit attendance');
            }
        } catch (error) {
            Alert.alert('Error', 'Connection failed');
        } finally {
            setLoading(false);
        }
    };

    const StatusBadge = ({ status }) => {
        let bgColor = '#fef3c7'; // pending (yellow)
        let textColor = '#92400e';

        if (status === 'Approved') {
            bgColor = '#d1fae5'; // green
            textColor = '#065f46';
        } else if (status === 'Rejected') {
            bgColor = '#fee2e2'; // red
            textColor = '#991b1b';
        }

        return (
            <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
                <Text style={[styles.statusText, { color: textColor }]}>{status || 'Pending'}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>👋 Daily Attendance</Text>
                    <Text style={styles.subtitle}>Mark your daily In/Out status with location</Text>
                </View>

                {/* Main Card */}
                <View style={styles.card}>
                    <View style={styles.dateTimeContainer}>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>Date</Text>
                            <Text style={styles.infoValue}>{formData.date}</Text>
                        </View>
                        <View style={[styles.infoBox, { borderLeftWidth: 1, borderLeftColor: theme.colors.borderLight }]}>
                            <Text style={styles.infoLabel}>Current Time</Text>
                            <Text style={styles.infoValue}>{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</Text>
                        </View>
                    </View>

                    <View style={styles.locationContainer}>
                        <Text style={styles.sectionLabel}>📍 Your Location</Text>
                        <LocationPicker
                            existingLocation={formData.locationLink}
                            onLocationSelected={(url, address) => {
                                setFormData(prev => ({ ...prev, locationLink: url, address: address }));
                            }}
                        />
                    </View>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.inBtn]}
                            onPress={() => handleAttendance('In')}
                            disabled={loading}
                        >
                            <Text style={styles.actionIcon}>🚪</Text>
                            <Text style={styles.actionText}>Attendance In</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionBtn, styles.outBtn]}
                            onPress={() => handleAttendance('Out')}
                            disabled={loading}
                        >
                            <Text style={styles.actionIcon}>👣</Text>
                            <Text style={styles.actionText}>Attendance Out</Text>
                        </TouchableOpacity>
                    </View>

                    {loading && <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 20 }} />}
                </View>

                {/* History Section */}
                <View style={styles.historyHeader}>
                    <Text style={styles.sectionTitle}>Recent History</Text>
                    <TouchableOpacity onPress={loadHistory}>
                        <Text style={styles.refreshText}>🔄 Refresh</Text>
                    </TouchableOpacity>
                </View>

                {fetching ? (
                    <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 20 }} />
                ) : (
                    <View style={styles.historyList}>
                        {history.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No attendance records found</Text>
                            </View>
                        ) : (
                            history.map((item, index) => (
                                <View key={index} style={styles.historyItem}>
                                    <View style={styles.historyLeft}>
                                        <View style={[styles.typeBadge, item.type === 'In' ? styles.inBadge : styles.outBadge]}>
                                            <Text style={styles.typeText}>{item.type}</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.histDate}>{item.date}</Text>
                                            <Text style={styles.histTime}>{item.time}</Text>
                                        </View>
                                    </View>
                                    <StatusBadge status={item.status} />
                                </View>
                            ))
                        )}
                    </View>
                )}
            </ScrollView>
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
        marginBottom: 4,
    },
    subtitle: {
        fontSize: theme.fontSize.md,
        color: theme.colors.textSecondary,
    },
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.lg,
        ...theme.shadows.lg,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },
    dateTimeContainer: {
        flexDirection: 'row',
        marginBottom: theme.spacing.lg,
        paddingBottom: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    infoBox: {
        flex: 1,
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 12,
        color: theme.colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    locationContainer: {
        marginBottom: theme.spacing.xl,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.textSecondary,
        marginBottom: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    actionBtn: {
        flex: 1,
        height: 100,
        borderRadius: theme.borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.md,
    },
    inBtn: {
        backgroundColor: '#ecfdf5',
        borderWidth: 1,
        borderColor: '#10b981',
    },
    outBtn: {
        backgroundColor: '#fff7ed',
        borderWidth: 1,
        borderColor: '#f59e0b',
    },
    actionIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    actionText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: theme.spacing.xxl,
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    refreshText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    historyList: {
        gap: theme.spacing.sm,
    },
    historyItem: {
        backgroundColor: theme.colors.card,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },
    historyLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
    },
    typeBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inBadge: {
        backgroundColor: '#d1fae5',
    },
    outBadge: {
        backgroundColor: '#ffedd5',
    },
    typeText: {
        fontWeight: 'bold',
        fontSize: 12,
    },
    histDate: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    histTime: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.full,
    },
    statusText: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: theme.colors.textMuted,
        fontStyle: 'italic',
    }
});
