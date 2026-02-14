import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    RefreshControl,
    Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';
import { getJCBEntries, getTipperEntries, getDieselEntries, getExpenseEntries } from '../services/api';
import { formatDate, formatNumber } from '../utils/calculations';

export const DashboardScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('jcb');
    const [jcbEntries, setJcbEntries] = useState([]);
    const [tipperEntries, setTipperEntries] = useState([]);
    const [dieselEntries, setDieselEntries] = useState([]);
    const [expenseEntries, setExpenseEntries] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const [jcb, tipper, diesel, expense] = await Promise.all([
                getJCBEntries(),
                getTipperEntries(),
                getDieselEntries(),
                getExpenseEntries(),
            ]);
            setJcbEntries(jcb);
            setTipperEntries(tipper);
            setDieselEntries(diesel);
            setExpenseEntries(expense);
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

    const InfoRow = ({ label, value, bold, color }) => (
        <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, bold && styles.infoLabelBold]}>{label}</Text>
            <Text style={[styles.infoValue, bold && styles.infoValueBold, color && { color }]} numberOfLines={1}>
                {value}
            </Text>
        </View>
    );

    const JCBItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('JCBForm', { initialData: item, isEdit: true })}
        >
            <View style={[styles.cardAccent, { backgroundColor: theme.colors.primary }]} />
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>🚜 Gadi {item.gadiNo}</Text>
                    <View style={styles.dateBadge}>
                        <Text style={styles.dateBadgeText}>{formatDate(item.date)}</Text>
                    </View>
                </View>
                <View style={styles.cardBody}>
                    <InfoRow label="Driver" value={item.driverName} />
                    {item.customerName ? (
                        <InfoRow label="Customer" value={item.customerName} />
                    ) : null}
                    {item.customerNumber ? (
                        <TouchableOpacity onPress={(e) => { e.stopPropagation(); Linking.openURL(`tel:${item.customerNumber}`); }}>
                            <InfoRow label="Phone" value={`📞 ${item.customerNumber}`} />
                        </TouchableOpacity>
                    ) : null}
                    <InfoRow label="Work" value={item.workDetail || 'N/A'} />
                    <InfoRow label="Tip Count" value={item.tipCount} />
                    <InfoRow label="Rate" value={`₹${formatNumber(item.rate)}`} />
                    <View style={styles.divider} />
                    <InfoRow label="Total" value={`₹${formatNumber(item.totalAmount)}`} bold />
                    <InfoRow label="Received" value={`₹${formatNumber(item.receivedAmount || 0)}`} bold color={theme.colors.success} />
                    <InfoRow label="Due" value={`₹${formatNumber(item.dueAmount || 0)}`} bold color={theme.colors.danger} />
                    <Text style={styles.editPrompt}>Tap to Edit record ✏️</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const TipperItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('TipperForm', { initialData: item, isEdit: true })}
        >
            <View style={[styles.cardAccent, { backgroundColor: theme.colors.secondary }]} />
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>🚚 Gadi {item.gadiNo}</Text>
                    <View style={styles.dateBadge}>
                        <Text style={styles.dateBadgeText}>{formatDate(item.date)}</Text>
                    </View>
                </View>
                <View style={styles.cardBody}>
                    <InfoRow label="Driver" value={item.driverName} />
                    {item.customerName ? (
                        <InfoRow label="Customer" value={item.customerName} />
                    ) : null}
                    {item.customerNumber ? (
                        <TouchableOpacity onPress={(e) => { e.stopPropagation(); Linking.openURL(`tel:${item.customerNumber}`); }}>
                            <InfoRow label="Phone" value={`📞 ${item.customerNumber}`} />
                        </TouchableOpacity>
                    ) : null}
                    <InfoRow label="Material" value={item.material} />
                    <InfoRow label="Loading" value={item.loadingPlace || 'N/A'} />
                    <InfoRow label="Unloading" value={item.unloadingPlace || 'N/A'} />
                    <InfoRow label="CFT/Trip" value={item.cftTrip || 'N/A'} />
                    <Text style={styles.editPrompt}>Tap to Edit record ✏️</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const DieselItem = ({ item }) => (
        <View style={styles.card}>
            <View style={[styles.cardAccent, { backgroundColor: theme.colors.warning || '#f59e0b' }]} />
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>⛽ {item.vehicleNo || item.gadiNo || 'Vehicle'}</Text>
                    <View style={styles.dateBadge}>
                        <Text style={styles.dateBadgeText}>{formatDate(item.date)}</Text>
                    </View>
                </View>
                <View style={styles.cardBody}>
                    <InfoRow label="Diesel" value={`${item.dieselLtr || item['diesel(ltr)'] || '0'} Ltr`} />
                    <InfoRow label="Cost" value={`₹${formatNumber(item.cost || item.dieselCost || 0)}`} />
                    {item.petrolPumpName ? (
                        <InfoRow label="Pump" value={item.petrolPumpName} />
                    ) : null}
                    {item.meterReading ? (
                        <InfoRow label="Meter" value={item.meterReading} />
                    ) : null}
                    {item.paidBy ? (
                        <InfoRow label="Paid By" value={item.paidBy} />
                    ) : null}
                    {item.remarks ? (
                        <InfoRow label="Remarks" value={item.remarks} />
                    ) : null}
                </View>
            </View>
        </View>
    );

    const ExpenseItem = ({ item }) => (
        <View style={styles.card}>
            <View style={[styles.cardAccent, { backgroundColor: '#8b5cf6' }]} />
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>💎 {item.expenseMode || 'Expense'}</Text>
                    <View style={styles.dateBadge}>
                        <Text style={styles.dateBadgeText}>{formatDate(item.date)}</Text>
                    </View>
                </View>
                <View style={styles.cardBody}>
                    <InfoRow label="Description" value={item.expensesDescription || item.description || 'N/A'} />
                    <InfoRow label="Remarks" value={item.remark || 'N/A'} />
                    <View style={styles.divider} />
                    <InfoRow label="Amount" value={`₹${formatNumber(item.amount)}`} bold color={theme.colors.danger} />
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={theme.gradients.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>📊 Dashboard</Text>
                <Text style={styles.headerSubtitle}>View all entries</Text>
            </LinearGradient>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'jcb' && styles.tabActive]}
                    onPress={() => setActiveTab('jcb')}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.tabText, activeTab === 'jcb' && styles.tabTextActive]}>
                        🚜 JCB ({jcbEntries.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'tipper' && styles.tabActive]}
                    onPress={() => setActiveTab('tipper')}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.tabText, activeTab === 'tipper' && styles.tabTextActive]}>
                        🚚 Tipper ({tipperEntries.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'diesel' && styles.tabActive]}
                    onPress={() => setActiveTab('diesel')}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.tabText, activeTab === 'diesel' && styles.tabTextActive]}>
                        ⛽ Diesel ({dieselEntries.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'expense' && styles.tabActive]}
                    onPress={() => setActiveTab('expense')}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.tabText, activeTab === 'expense' && styles.tabTextActive]}>
                        💎 Exp ({expenseEntries.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>⏳</Text>
                        <Text style={styles.emptyText}>Loading entries...</Text>
                    </View>
                ) : activeTab === 'jcb' ? (
                    jcbEntries.length > 0 ? (
                        jcbEntries.map((item, index) => <JCBItem key={index} item={item} />)
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>📋</Text>
                            <Text style={styles.emptyText}>No JCB entries yet</Text>
                        </View>
                    )
                ) : activeTab === 'tipper' ? (
                    tipperEntries.length > 0 ? (
                        tipperEntries.map((item, index) => <TipperItem key={index} item={item} />)
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>📋</Text>
                            <Text style={styles.emptyText}>No Tipper entries yet</Text>
                        </View>
                    )
                ) : activeTab === 'diesel' ? (
                    dieselEntries.length > 0 ? (
                        dieselEntries.map((item, index) => <DieselItem key={index} item={item} />)
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>📋</Text>
                            <Text style={styles.emptyText}>No Diesel entries yet</Text>
                        </View>
                    )
                ) : (
                    expenseEntries.length > 0 ? (
                        expenseEntries.map((item, index) => <ExpenseItem key={index} item={item} />)
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>📋</Text>
                            <Text style={styles.emptyText}>No Expense entries yet</Text>
                        </View>
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
        paddingTop: theme.spacing.xl,
        paddingBottom: theme.spacing.lg,
        paddingHorizontal: theme.spacing.lg,
    },
    headerTitle: {
        fontSize: theme.fontSize.xxl,
        fontWeight: theme.fontWeight.bold,
        color: '#fff',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: theme.fontSize.md,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        backgroundColor: theme.colors.card,
        gap: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.cardLight,
        borderWidth: 1.5,
        borderColor: theme.colors.border,
    },
    tabActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
        ...theme.shadows.sm,
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
        paddingBottom: theme.spacing.xxl,
    },
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.lg,
        marginBottom: theme.spacing.md,
        flexDirection: 'row',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        ...theme.shadows.md,
    },
    cardAccent: {
        width: 5,
    },
    cardContent: {
        flex: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
        backgroundColor: theme.colors.cardLight,
    },
    cardTitle: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
    },
    dateBadge: {
        backgroundColor: theme.colors.primarySoft,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.full,
    },
    dateBadgeText: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.primary,
        fontWeight: theme.fontWeight.semibold,
    },
    cardBody: {
        padding: theme.spacing.lg,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textMuted,
        flex: 1,
    },
    infoLabelBold: {
        color: theme.colors.textSecondary,
        fontWeight: theme.fontWeight.semibold,
    },
    infoValue: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.text,
        flex: 1.5,
        textAlign: 'right',
    },
    infoValueBold: {
        fontWeight: theme.fontWeight.bold,
        fontSize: theme.fontSize.md,
    },
    editPrompt: {
        fontSize: 10,
        color: theme.colors.primary,
        fontStyle: 'italic',
        marginTop: 10,
        alignSelf: 'flex-end',
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.borderLight,
        marginVertical: theme.spacing.md,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.xxl * 2,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: theme.spacing.md,
    },
    emptyText: {
        textAlign: 'center',
        color: theme.colors.textMuted,
        fontSize: theme.fontSize.md,
    },
});
