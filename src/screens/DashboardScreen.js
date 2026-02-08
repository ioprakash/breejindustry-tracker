import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { theme } from '../styles/theme';
import { getJCBEntries, getTipperEntries } from '../services/api';
import { formatDate, formatNumber } from '../utils/calculations';

export const DashboardScreen = () => {
    const [activeTab, setActiveTab] = useState('jcb'); // 'jcb' or 'tipper'
    const [jcbEntries, setJcbEntries] = useState([]);
    const [tipperEntries, setTipperEntries] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const [jcb, tipper] = await Promise.all([
                getJCBEntries(),
                getTipperEntries(),
            ]);
            setJcbEntries(jcb);
            setTipperEntries(tipper);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const JCBItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>🚜 Gadi {item.gadiNo}</Text>
                <Text style={styles.cardDate}>{formatDate(item.date)}</Text>
            </View>
            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Driver:</Text>
                    <Text style={styles.value}>{item.driverName}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Work Detail:</Text>
                    <Text style={styles.value}>{item.workDetail || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Tip Count:</Text>
                    <Text style={styles.value}>{item.tipCount}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Rate:</Text>
                    <Text style={styles.value}>₹{formatNumber(item.rate)}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                    <Text style={styles.labelBold}>Total Amount:</Text>
                    <Text style={styles.valueBold}>₹{formatNumber(item.totalAmount)}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.labelBold}>Received:</Text>
                    <Text style={styles.valueSuccess}>₹{formatNumber(item.receivedAmount || 0)}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.labelBold}>Due:</Text>
                    <Text style={[styles.valueBold, styles.valueDanger]}>₹{formatNumber(item.dueAmount || 0)}</Text>
                </View>
            </View>
        </View>
    );

    const TipperItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>🚚 Gadi {item.gadiNo}</Text>
                <Text style={styles.cardDate}>{formatDate(item.date)}</Text>
            </View>
            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Driver:</Text>
                    <Text style={styles.value}>{item.driverName}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Material:</Text>
                    <Text style={styles.value}>{item.material}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Loading:</Text>
                    <Text style={styles.value}>{item.loadingPlace || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Unloading:</Text>
                    <Text style={styles.value}>{item.unloadingPlace || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>CFT/Trip:</Text>
                    <Text style={styles.value}>{item.cftTrip || 'N/A'}</Text>
                </View>
                {item.dieselLtr && (
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Diesel:</Text>
                        <Text style={styles.value}>{item.dieselLtr} L @ ₹{item.dieselCost || 0}</Text>
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>📊 Dashboard</Text>
                <Text style={styles.subtitle}>View all entries</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'jcb' && styles.tabActive]}
                    onPress={() => setActiveTab('jcb')}
                >
                    <Text style={[styles.tabText, activeTab === 'jcb' && styles.tabTextActive]}>
                        JCB ({jcbEntries.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'tipper' && styles.tabActive]}
                    onPress={() => setActiveTab('tipper')}
                >
                    <Text style={[styles.tabText, activeTab === 'tipper' && styles.tabTextActive]}>
                        Tipper ({tipperEntries.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {loading ? (
                    <Text style={styles.emptyText}>Loading...</Text>
                ) : activeTab === 'jcb' ? (
                    jcbEntries.length > 0 ? (
                        jcbEntries.map((item, index) => <JCBItem key={index} item={item} />)
                    ) : (
                        <Text style={styles.emptyText}>No JCB entries yet</Text>
                    )
                ) : (
                    tipperEntries.length > 0 ? (
                        tipperEntries.map((item, index) => <TipperItem key={index} item={item} />)
                    ) : (
                        <Text style={styles.emptyText}>No Tipper entries yet</Text>
                    )
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
    header: {
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.card,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
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
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        backgroundColor: theme.colors.card,
        gap: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    tab: {
        flex: 1,
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    tabActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    tabText: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.textSecondary,
    },
    tabTextActive: {
        color: '#fff',
    },
    scrollContent: {
        padding: theme.spacing.lg,
    },
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.lg,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
        backgroundColor: theme.colors.backgroundDark,
        borderTopLeftRadius: theme.borderRadius.lg,
        borderTopRightRadius: theme.borderRadius.lg,
    },
    cardTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
    },
    cardDate: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textMuted,
    },
    cardBody: {
        padding: theme.spacing.lg,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.sm,
    },
    label: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    labelBold: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.text,
        fontWeight: theme.fontWeight.semibold,
    },
    value: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.text,
    },
    valueBold: {
        fontSize: theme.fontSize.md,
        color: theme.colors.text,
        fontWeight: theme.fontWeight.bold,
    },
    valueSuccess: {
        fontSize: theme.fontSize.md,
        color: theme.colors.success,
        fontWeight: theme.fontWeight.bold,
    },
    valueDanger: {
        color: theme.colors.warning,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.borderLight,
        marginVertical: theme.spacing.md,
    },
    emptyText: {
        textAlign: 'center',
        color: theme.colors.textMuted,
        fontSize: theme.fontSize.md,
        marginTop: theme.spacing.xl,
    },
});
