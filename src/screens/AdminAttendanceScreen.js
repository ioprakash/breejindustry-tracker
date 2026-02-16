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
    Linking
} from 'react-native';
import { theme } from '../styles/theme';
import { getAttendanceEntries, approveAttendance } from '../services/api';

export const AdminAttendanceScreen = () => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const loadEntries = async () => {
        setLoading(true);
        try {
            const result = await getAttendanceEntries();
            if (result.success) {
                setEntries(result.data);
            }
        } catch (error) {
            console.error('Error loading attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEntries();
    }, []);

    const handleApprove = async (entry) => {
        setActionLoading(entry.actualEntryTime);
        try {
            const result = await approveAttendance(entry.actualEntryTime);
            if (result.success) {
                Alert.alert('Success', 'Attendance approved');
                loadEntries();
            } else {
                Alert.alert('Error', result.error || 'Failed to approve');
            }
        } catch (error) {
            Alert.alert('Error', 'Connection failure');
        } finally {
            setActionLoading(null);
        }
    };

    const openMap = (url) => {
        if (!url) return;
        Linking.openURL(url);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>✅ Attendance Approval</Text>
                    <Text style={styles.subtitle}>Review and approve employee attendance</Text>
                </View>
                <TouchableOpacity onPress={loadEntries} style={styles.refreshBtn}>
                    <Text style={styles.refreshIcon}>🔄</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
                    {entries.length === 0 ? (
                        <Text style={styles.empty}>No attendance records found</Text>
                    ) : (
                        entries.map((item, index) => (
                            <View key={index} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <View>
                                        <Text style={styles.empName}>{item.employeeName}</Text>
                                        <Text style={styles.dateTime}>{item.date} • {item.time}</Text>
                                    </View>
                                    <View style={[styles.typeBadge, item.type === 'In' ? styles.inBadge : styles.outBadge]}>
                                        <Text style={styles.typeText}>{item.type}</Text>
                                    </View>
                                </View>

                                {item.locationLink && (
                                    <TouchableOpacity
                                        style={styles.locationLink}
                                        onPress={() => openMap(item.locationLink)}
                                    >
                                        <Text style={styles.locationText}>📍 View Location on Map</Text>
                                    </TouchableOpacity>
                                )}

                                <View style={styles.cardFooter}>
                                    <View style={[styles.statusTag, item.status === 'Approved' ? styles.statusApproved : styles.statusPending]}>
                                        <Text style={styles.statusText}>{item.status || 'Pending'}</Text>
                                    </View>

                                    {(item.status !== 'Approved') && (
                                        <TouchableOpacity
                                            style={styles.approveBtn}
                                            onPress={() => handleApprove(item)}
                                            disabled={actionLoading === item.actualEntryTime}
                                        >
                                            {actionLoading === item.actualEntryTime ? (
                                                <ActivityIndicator size="small" color="#fff" />
                                            ) : (
                                                <Text style={styles.approveBtnText}>Approve</Text>
                                            )}
                                        </TouchableOpacity>
                                    )}
                                    {item.status === 'Approved' && item.approvedBy && (
                                        <Text style={styles.approvedByText}>By: {item.approvedBy}</Text>
                                    )}
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.card,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
        ...theme.shadows.sm,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    subtitle: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    refreshBtn: {
        padding: 5,
    },
    refreshIcon: {
        fontSize: 24,
    },
    list: {
        padding: theme.spacing.lg,
        gap: theme.spacing.lg,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        ...theme.shadows.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.md,
    },
    empName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    dateTime: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    typeBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
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
    locationLink: {
        backgroundColor: '#f3f4f6',
        padding: 10,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.md,
    },
    locationText: {
        color: theme.colors.primary,
        fontSize: 13,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingTop: theme.spacing.md,
    },
    statusTag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusPending: {
        backgroundColor: '#fef3c7',
    },
    statusApproved: {
        backgroundColor: '#d1fae5',
    },
    statusText: {
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    approveBtn: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: theme.borderRadius.md,
        minWidth: 90,
        alignItems: 'center',
    },
    approveBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 13,
    },
    approvedByText: {
        fontSize: 10,
        color: theme.colors.textMuted,
        fontStyle: 'italic',
    },
    empty: {
        textAlign: 'center',
        marginTop: 50,
        color: theme.colors.textMuted,
        fontSize: 16,
    }
});
