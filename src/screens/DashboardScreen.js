import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    RefreshControl,
    Linking,
    TextInput,
    Alert,
    ActivityIndicator,
    Share,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';
import {
    getJCBEntries,
    getTipperEntries,
    getDieselEntries,
    getExpenseEntries,
    deleteEntry,
} from '../services/api';
import { getData } from '../services/storage';
import { formatDate, formatNumber, getTodayDate } from '../utils/calculations';

const { width } = Dimensions.get('window');

export const DashboardScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('jcb');
    const [jcbEntries, setJcbEntries] = useState([]);
    const [tipperEntries, setTipperEntries] = useState([]);
    const [dieselEntries, setDieselEntries] = useState([]);
    const [expenseEntries, setExpenseEntries] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [deletingKey, setDeletingKey] = useState(null);

    // Advanced Filter & Search States
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | 'yesterday' | '7days' | '30days'
    const [paymentFilter, setPaymentFilter] = useState('all'); // 'all' | 'due' | 'settled'
    const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest' | 'amount'
    const [showFinancialSummary, setShowFinancialSummary] = useState(true);

    const checkUserRole = async () => {
        const role = await getData('@user_role');
        setIsAdmin(role === 'admin');
    };

    const loadData = async () => {
        try {
            const [jcb, tipper, diesel, expense] = await Promise.all([
                getJCBEntries(),
                getTipperEntries(),
                getDieselEntries(),
                getExpenseEntries(),
            ]);
            setJcbEntries(jcb || []);
            setTipperEntries(tipper || []);
            setDieselEntries(diesel || []);
            setExpenseEntries(expense || []);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkUserRole();
        loadData();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    // Helper to test if a date matches the chosen filter
    const matchesDateFilter = (entryDateStr) => {
        if (dateFilter === 'all' || !entryDateStr) return true;

        const entryDate = new Date(entryDateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const entryDay = new Date(entryDate);
        entryDay.setHours(0, 0, 0, 0);

        if (dateFilter === 'today') {
            return entryDay.getTime() === today.getTime();
        }

        if (dateFilter === 'yesterday') {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return entryDay.getTime() === yesterday.getTime();
        }

        if (dateFilter === '7days') {
            const diffDays = (today.getTime() - entryDay.getTime()) / (1000 * 3600 * 24);
            return diffDays >= 0 && diffDays <= 7;
        }

        if (dateFilter === '30days') {
            const diffDays = (today.getTime() - entryDay.getTime()) / (1000 * 3600 * 24);
            return diffDays >= 0 && diffDays <= 30;
        }

        return true;
    };

    // Global Financial Overview Calculations
    const financialOverview = useMemo(() => {
        const jcbFiltered = jcbEntries.filter(e => matchesDateFilter(e.date));
        const tipperFiltered = tipperEntries.filter(e => matchesDateFilter(e.date));
        const dieselFiltered = dieselEntries.filter(e => matchesDateFilter(e.date));
        const expenseFiltered = expenseEntries.filter(e => matchesDateFilter(e.date));

        const totalBilled = jcbFiltered.reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);
        const totalReceived = jcbFiltered.reduce((sum, item) => sum + (parseFloat(item.receivedAmount) || 0), 0);
        const totalDue = jcbFiltered.reduce((sum, item) => sum + (parseFloat(item.dueAmount) || 0), 0);

        const totalFuelCost = dieselFiltered.reduce((sum, item) => sum + (parseFloat(item.cost || item.dieselCost) || 0), 0);
        const totalFuelLtr = dieselFiltered.reduce((sum, item) => sum + (parseFloat(item.dieselLtr || item['diesel(ltr)']) || 0), 0);

        const totalExpenses = expenseFiltered.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        const totalTipperTrips = tipperFiltered.length;
        const totalCFT = tipperFiltered.reduce((sum, item) => sum + (parseFloat(item.cftTrip) || 0), 0);

        const netOperatingProfit = totalReceived - totalFuelCost - totalExpenses;

        return {
            totalBilled,
            totalReceived,
            totalDue,
            totalFuelCost,
            totalFuelLtr,
            totalExpenses,
            totalTipperTrips,
            totalCFT,
            netOperatingProfit,
            jcbCount: jcbFiltered.length,
            tipperCount: tipperFiltered.length,
            dieselCount: dieselFiltered.length,
            expenseCount: expenseFiltered.length,
        };
    }, [jcbEntries, tipperEntries, dieselEntries, expenseEntries, dateFilter]);

    // Deletion Handler with confirmation
    const handleDeleteRecord = (sheetName, entry, itemTitle) => {
        Alert.alert(
            '🗑️ Delete Record',
            `Are you sure you want to permanently delete this ${itemTitle} entry?\n\nDate: ${entry.date || 'N/A'}\nCreated By: ${entry.enteredBy || 'Staff'}`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setDeletingKey(entry.actualEntryTime);
                        try {
                            const res = await deleteEntry(sheetName, entry.actualEntryTime);
                            if (res.success) {
                                Alert.alert('Success', 'Record deleted successfully from Google Sheets.');
                                loadData();
                            } else {
                                Alert.alert('Error', res.error || 'Failed to delete record.');
                            }
                        } catch (err) {
                            Alert.alert('Error', 'Connection failure while deleting.');
                        } finally {
                            setDeletingKey(null);
                        }
                    },
                },
            ]
        );
    };

    // Share / Copy Executive Report
    const handleShareReport = async () => {
        try {
            const filterLabel = {
                all: 'All Time',
                today: 'Today',
                yesterday: 'Yesterday',
                '7days': 'Last 7 Days',
                '30days': 'Last 30 Days',
            }[dateFilter];

            const message = `📊 *Brij Industry Tracker - Summary Report*\n` +
                `📅 Period: ${filterLabel}\n` +
                `───────────────────\n` +
                `🚜 *JCB Billed:* ₹${formatNumber(financialOverview.totalBilled)}\n` +
                `💵 *JCB Collected:* ₹${formatNumber(financialOverview.totalReceived)}\n` +
                `⚠️ *Total Dues:* ₹${formatNumber(financialOverview.totalDue)}\n` +
                `🚚 *Tipper Trips:* ${financialOverview.totalTipperTrips} (${financialOverview.totalCFT} CFT)\n` +
                `⛽ *Diesel Cost:* ₹${formatNumber(financialOverview.totalFuelCost)} (${financialOverview.totalFuelLtr.toFixed(1)} Ltr)\n` +
                `💎 *Daily Expenses:* ₹${formatNumber(financialOverview.totalExpenses)}\n` +
                `───────────────────\n` +
                `📈 *Net Operations Balance:* ₹${formatNumber(financialOverview.netOperatingProfit)}\n` +
                `🕒 Generated: ${new Date().toLocaleString()}`;

            await Share.share({ message });
        } catch (error) {
            console.error('Error sharing report:', error);
        }
    };

    // Filter & Sort Logic for Active Tab Items
    const filteredItems = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        let source = [];
        if (activeTab === 'jcb') source = [...jcbEntries];
        else if (activeTab === 'tipper') source = [...tipperEntries];
        else if (activeTab === 'diesel') source = [...dieselEntries];
        else if (activeTab === 'expense') source = [...expenseEntries];

        // 1. Date Filter
        let result = source.filter(item => matchesDateFilter(item.date));

        // 2. Search Filter
        if (query) {
            result = result.filter(item => {
                const combined = [
                    item.gadiNo,
                    item.vehicleNo,
                    item.driverName,
                    item.customerName,
                    item.customerNumber,
                    item.material,
                    item.loadingPlace,
                    item.unloadingPlace,
                    item.petrolPumpName,
                    item.expensesDescription,
                    item.description,
                    item.remarks,
                    item.remark,
                    item.enteredBy,
                    item.expenseMode,
                    item.workDetail,
                ].filter(Boolean).join(' ').toLowerCase();

                return combined.includes(query);
            });
        }

        // 3. JCB Payment Status Filter
        if (activeTab === 'jcb' && paymentFilter !== 'all') {
            if (paymentFilter === 'due') {
                result = result.filter(item => (parseFloat(item.dueAmount) || 0) > 0);
            } else if (paymentFilter === 'settled') {
                result = result.filter(item => (parseFloat(item.dueAmount) || 0) <= 0);
            }
        }

        // 4. Sort
        result.sort((a, b) => {
            if (sortOrder === 'newest') {
                return (b.actualEntryTime || b.date || '').localeCompare(a.actualEntryTime || a.date || '');
            }
            if (sortOrder === 'oldest') {
                return (a.actualEntryTime || a.date || '').localeCompare(b.actualEntryTime || b.date || '');
            }
            if (sortOrder === 'amount') {
                const amountA = parseFloat(a.totalAmount || a.cost || a.dieselCost || a.amount || a.cftTrip || 0);
                const amountB = parseFloat(b.totalAmount || b.cost || b.dieselCost || b.amount || b.cftTrip || 0);
                return amountB - amountA;
            }
            return 0;
        });

        return result;
    }, [activeTab, jcbEntries, tipperEntries, dieselEntries, expenseEntries, searchQuery, dateFilter, paymentFilter, sortOrder]);

    const InfoRow = ({ label, value, bold, color }) => (
        <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, bold && styles.infoLabelBold]}>{label}</Text>
            <Text style={[styles.infoValue, bold && styles.infoValueBold, color && { color }]} numberOfLines={1}>
                {value}
            </Text>
        </View>
    );

    // Render JCB Card
    const JCBItem = ({ item }) => {
        const isDeleting = deletingKey === item.actualEntryTime;
        const dueAmount = parseFloat(item.dueAmount) || 0;

        return (
            <View style={styles.card}>
                <View style={[styles.cardAccent, { backgroundColor: theme.colors.primary }]} />
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardHeaderLeft}>
                            <Text style={styles.cardTitle}>🚜 Gadi {item.gadiNo}</Text>
                            <Text style={styles.cardSubtitle}>{item.driverName || 'No Driver'} {item.runMode ? `• ${item.runMode}` : ''}</Text>
                        </View>
                        <View style={styles.dateBadge}>
                            <Text style={styles.dateBadgeText}>{formatDate(item.date)}</Text>
                        </View>
                    </View>

                    <View style={styles.cardBody}>
                        {item.customerName ? <InfoRow label="Customer" value={item.customerName} /> : null}
                        {item.customerNumber ? (
                            <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.customerNumber}`)}>
                                <InfoRow label="Customer Phone" value={`📞 ${item.customerNumber}`} color={theme.colors.primary} bold />
                            </TouchableOpacity>
                        ) : null}
                        <InfoRow label="Work" value={item.workDetail || 'N/A'} />
                        <InfoRow label="Tip Count / Hours" value={item.totalHour || item.tipCount || '0'} />
                        <InfoRow label="Rate" value={`₹${formatNumber(item.rate)}`} />
                        <View style={styles.divider} />
                        <InfoRow label="Total Billed" value={`₹${formatNumber(item.totalAmount)}`} bold />
                        <InfoRow label="Received" value={`₹${formatNumber(item.receivedAmount || 0)}`} bold color={theme.colors.success} />
                        <InfoRow
                            label="Due Balance"
                            value={`₹${formatNumber(dueAmount)}`}
                            bold
                            color={dueAmount > 0 ? theme.colors.danger : theme.colors.textMuted}
                        />

                        {item.enteredBy ? (
                            <Text style={styles.recordedByText}>Recorded by: {item.enteredBy}</Text>
                        ) : null}

                        {/* Location & Photo Indicators */}
                        <View style={styles.metaActionRow}>
                            {item.locationLink ? (
                                <TouchableOpacity
                                    style={styles.metaBtn}
                                    onPress={() => Linking.openURL(item.locationLink)}
                                >
                                    <Text style={styles.metaBtnText}>📍 Live Location</Text>
                                </TouchableOpacity>
                            ) : null}

                            {item.photo ? (
                                <TouchableOpacity
                                    style={styles.metaBtn}
                                    onPress={() => Linking.openURL(item.photo)}
                                >
                                    <Text style={styles.metaBtnText}>📸 View Photo</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>

                        {/* Admin Action Row */}
                        <View style={styles.controlRow}>
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => navigation.navigate('JCBForm', { initialData: item, isEdit: true })}
                            >
                                <Text style={styles.editButtonText}>✏️ Edit Entry</Text>
                            </TouchableOpacity>

                            {isAdmin && (
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDeleteRecord('JCB_Logs', item, 'JCB')}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <ActivityIndicator size="small" color={theme.colors.danger} />
                                    ) : (
                                        <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    // Render Tipper Card
    const TipperItem = ({ item }) => {
        const isDeleting = deletingKey === item.actualEntryTime;

        return (
            <View style={styles.card}>
                <View style={[styles.cardAccent, { backgroundColor: theme.colors.secondary }]} />
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardHeaderLeft}>
                            <Text style={styles.cardTitle}>🚚 Gadi {item.gadiNo}</Text>
                            <Text style={styles.cardSubtitle}>{item.driverName || 'No Driver'}</Text>
                        </View>
                        <View style={[styles.dateBadge, { backgroundColor: theme.colors.secondarySoft }]}>
                            <Text style={[styles.dateBadgeText, { color: theme.colors.secondary }]}>{formatDate(item.date)}</Text>
                        </View>
                    </View>

                    <View style={styles.cardBody}>
                        {item.customerName ? <InfoRow label="Customer" value={item.customerName} /> : null}
                        {item.customerNumber ? (
                            <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.customerNumber}`)}>
                                <InfoRow label="Phone" value={`📞 ${item.customerNumber}`} color={theme.colors.primary} bold />
                            </TouchableOpacity>
                        ) : null}
                        <InfoRow label="Material" value={item.material} bold />
                        <InfoRow label="Loading" value={item.loadingPlace || 'N/A'} />
                        <InfoRow label="Unloading" value={item.unloadingPlace || 'N/A'} />
                        <InfoRow label="CFT / Trip" value={item.cftTrip || 'N/A'} bold />
                        {item.remarks ? <InfoRow label="Remarks" value={item.remarks} /> : null}

                        {item.enteredBy ? (
                            <Text style={styles.recordedByText}>Recorded by: {item.enteredBy}</Text>
                        ) : null}

                        {/* Location & Photo Indicators */}
                        <View style={styles.metaActionRow}>
                            {item.locationLink ? (
                                <TouchableOpacity
                                    style={styles.metaBtn}
                                    onPress={() => Linking.openURL(item.locationLink)}
                                >
                                    <Text style={styles.metaBtnText}>📍 Trip Location</Text>
                                </TouchableOpacity>
                            ) : null}

                            {item.photo ? (
                                <TouchableOpacity
                                    style={styles.metaBtn}
                                    onPress={() => Linking.openURL(item.photo)}
                                >
                                    <Text style={styles.metaBtnText}>📸 View Photo</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>

                        {/* Control Row */}
                        <View style={styles.controlRow}>
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => navigation.navigate('TipperForm', { initialData: item, isEdit: true })}
                            >
                                <Text style={styles.editButtonText}>✏️ Edit Trip</Text>
                            </TouchableOpacity>

                            {isAdmin && (
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDeleteRecord('Tipper_Logs', item, 'Tipper')}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <ActivityIndicator size="small" color={theme.colors.danger} />
                                    ) : (
                                        <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    // Render Diesel Card
    const DieselItem = ({ item }) => {
        const isDeleting = deletingKey === item.actualEntryTime;

        return (
            <View style={styles.card}>
                <View style={[styles.cardAccent, { backgroundColor: theme.colors.warning }]} />
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardHeaderLeft}>
                            <Text style={styles.cardTitle}>⛽ {item.vehicleNo || item.gadiNo || 'Vehicle'}</Text>
                            <Text style={styles.cardSubtitle}>{item.vehicleType || 'Machine'} fuel log</Text>
                        </View>
                        <View style={[styles.dateBadge, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                            <Text style={[styles.dateBadgeText, { color: theme.colors.warning }]}>{formatDate(item.date)}</Text>
                        </View>
                    </View>

                    <View style={styles.cardBody}>
                        <InfoRow label="Diesel Quantity" value={`${item.dieselLtr || item['diesel(ltr)'] || '0'} Litres`} bold />
                        <InfoRow label="Total Fuel Cost" value={`₹${formatNumber(item.cost || item.dieselCost || 0)}`} bold color={theme.colors.danger} />
                        {item.petrolPumpName ? <InfoRow label="Petrol Pump" value={item.petrolPumpName} /> : null}
                        {item.meterReading ? <InfoRow label="Meter Reading" value={item.meterReading} /> : null}
                        {item.paidBy ? <InfoRow label="Paid By" value={item.paidBy} /> : null}
                        {item.remarks ? <InfoRow label="Remarks" value={item.remarks} /> : null}

                        {item.enteredBy ? (
                            <Text style={styles.recordedByText}>Recorded by: {item.enteredBy}</Text>
                        ) : null}

                        {/* Location & Photo Indicators */}
                        <View style={styles.metaActionRow}>
                            {item.locationLink ? (
                                <TouchableOpacity
                                    style={styles.metaBtn}
                                    onPress={() => Linking.openURL(item.locationLink)}
                                >
                                    <Text style={styles.metaBtnText}>📍 Pump Location</Text>
                                </TouchableOpacity>
                            ) : null}

                            {item.photo ? (
                                <TouchableOpacity
                                    style={styles.metaBtn}
                                    onPress={() => Linking.openURL(item.photo)}
                                >
                                    <Text style={styles.metaBtnText}>📸 Receipt Photo</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>

                        {/* Control Row */}
                        <View style={styles.controlRow}>
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => navigation.navigate('DieselEntry', { initialData: item, isEdit: true })}
                            >
                                <Text style={styles.editButtonText}>✏️ Edit Diesel</Text>
                            </TouchableOpacity>

                            {isAdmin && (
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDeleteRecord('Diesel_Logs', item, 'Diesel')}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <ActivityIndicator size="small" color={theme.colors.danger} />
                                    ) : (
                                        <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    // Render Expense Card
    const ExpenseItem = ({ item }) => {
        const isDeleting = deletingKey === item.actualEntryTime;

        return (
            <View style={styles.card}>
                <View style={[styles.cardAccent, { backgroundColor: '#8b5cf6' }]} />
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardHeaderLeft}>
                            <Text style={styles.cardTitle}>💎 {item.expenseMode || 'Expense'}</Text>
                            <Text style={styles.cardSubtitle}>{item.expensesDescription || item.description || 'Daily Expense'}</Text>
                        </View>
                        <View style={[styles.dateBadge, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                            <Text style={[styles.dateBadgeText, { color: '#8b5cf6' }]}>{formatDate(item.date)}</Text>
                        </View>
                    </View>

                    <View style={styles.cardBody}>
                        <InfoRow label="Description" value={item.expensesDescription || item.description || 'N/A'} />
                        {item.remark ? <InfoRow label="Remarks" value={item.remark} /> : null}
                        <View style={styles.divider} />
                        <InfoRow label="Expense Amount" value={`₹${formatNumber(item.amount)}`} bold color={theme.colors.danger} />

                        {item.enteredBy ? (
                            <Text style={styles.recordedByText}>Recorded by: {item.enteredBy}</Text>
                        ) : null}

                        {/* Control Row */}
                        <View style={styles.controlRow}>
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => navigation.navigate('ExpenseForm', { initialData: item, isEdit: true })}
                            >
                                <Text style={styles.editButtonText}>✏️ Edit Expense</Text>
                            </TouchableOpacity>

                            {isAdmin && (
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDeleteRecord('Daily_Expenses', item, 'Expense')}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <ActivityIndicator size="small" color={theme.colors.danger} />
                                    ) : (
                                        <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with Executive Control */}
            <LinearGradient
                colors={theme.gradients.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.headerTitle}>📊 Admin Dashboard</Text>
                        <Text style={styles.headerSubtitle}>Complete business oversight & live management</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.shareReportBtn}
                        onPress={handleShareReport}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.shareReportText}>📤 Share Summary</Text>
                    </TouchableOpacity>
                </View>

                {/* Executive Finance Summary Card */}
                <View style={styles.summaryContainer}>
                    <TouchableOpacity
                        style={styles.summaryToggle}
                        onPress={() => setShowFinancialSummary(!showFinancialSummary)}
                    >
                        <Text style={styles.summaryToggleTitle}>
                            💼 Business Performance Overview ({dateFilter.toUpperCase()})
                        </Text>
                        <Text style={styles.summaryToggleIcon}>
                            {showFinancialSummary ? '▲ Hide' : '▼ View Stats'}
                        </Text>
                    </TouchableOpacity>

                    {showFinancialSummary && (
                        <View style={styles.kpiGrid}>
                            <View style={styles.kpiCard}>
                                <Text style={styles.kpiLabel}>Total Billed</Text>
                                <Text style={styles.kpiValue}>₹{formatNumber(financialOverview.totalBilled)}</Text>
                            </View>
                            <View style={styles.kpiCard}>
                                <Text style={styles.kpiLabel}>Cash In (Recv)</Text>
                                <Text style={[styles.kpiValue, { color: theme.colors.success }]}>
                                    ₹{formatNumber(financialOverview.totalReceived)}
                                </Text>
                            </View>
                            <View style={styles.kpiCard}>
                                <Text style={styles.kpiLabel}>Pending Dues</Text>
                                <Text style={[styles.kpiValue, { color: theme.colors.danger }]}>
                                    ₹{formatNumber(financialOverview.totalDue)}
                                </Text>
                            </View>
                            <View style={styles.kpiCard}>
                                <Text style={styles.kpiLabel}>Fuel + Expenses</Text>
                                <Text style={[styles.kpiValue, { color: '#f59e0b' }]}>
                                    ₹{formatNumber(financialOverview.totalFuelCost + financialOverview.totalExpenses)}
                                </Text>
                            </View>
                            <View style={[styles.kpiCard, styles.kpiCardWide]}>
                                <Text style={styles.kpiLabel}>Net Operational Balance</Text>
                                <Text
                                    style={[
                                        styles.kpiValueLarge,
                                        { color: financialOverview.netOperatingProfit >= 0 ? '#10b981' : '#ef4444' },
                                    ]}
                                >
                                    ₹{formatNumber(financialOverview.netOperatingProfit)}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
            </LinearGradient>

            {/* Quick Action Shortcuts for Admin */}
            {isAdmin && (
                <View style={styles.quickShortcutsBar}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shortcutsScroll}>
                        <TouchableOpacity style={styles.shortcutChip} onPress={() => navigation.navigate('JCBForm')}>
                            <Text style={styles.shortcutChipText}>➕ Add JCB</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.shortcutChip} onPress={() => navigation.navigate('TipperForm')}>
                            <Text style={styles.shortcutChipText}>➕ Add Tipper</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.shortcutChip} onPress={() => navigation.navigate('DieselEntry')}>
                            <Text style={styles.shortcutChipText}>⛽ Add Diesel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.shortcutChip} onPress={() => navigation.navigate('ExpenseForm')}>
                            <Text style={styles.shortcutChipText}>💎 Add Expense</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.shortcutChip} onPress={() => navigation.navigate('AdminAttendance')}>
                            <Text style={styles.shortcutChipText}>✅ Attendance</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.shortcutChip} onPress={() => navigation.navigate('Ledger')}>
                            <Text style={styles.shortcutChipText}>📒 Ledger</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.shortcutChip} onPress={() => navigation.navigate('ManageEmployees')}>
                            <Text style={styles.shortcutChipText}>👥 Staff</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            )}

            {/* Search and Filters Header */}
            <View style={styles.filterSection}>
                {/* Search Bar */}
                <View style={styles.searchBar}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search vehicle, driver, customer, material..."
                        placeholderTextColor={theme.colors.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        clearButtonMode="while-editing"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
                            <Text style={styles.clearSearchText}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Date Filter Pills */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateFilterScroll}>
                    {[
                        { id: 'all', label: 'All Time' },
                        { id: 'today', label: 'Today' },
                        { id: 'yesterday', label: 'Yesterday' },
                        { id: '7days', label: '7 Days' },
                        { id: '30days', label: '30 Days' },
                    ].map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.filterPill, dateFilter === item.id && styles.filterPillActive]}
                            onPress={() => setDateFilter(item.id)}
                        >
                            <Text style={[styles.filterPillText, dateFilter === item.id && styles.filterPillTextActive]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    ))}

                    {/* Sorting Button */}
                    <TouchableOpacity
                        style={styles.sortPill}
                        onPress={() => {
                            if (sortOrder === 'newest') setSortOrder('oldest');
                            else if (sortOrder === 'oldest') setSortOrder('amount');
                            else setSortOrder('newest');
                        }}
                    >
                        <Text style={styles.sortPillText}>
                            Sort: {sortOrder === 'newest' ? '📅 Newest' : sortOrder === 'oldest' ? '📅 Oldest' : '💰 Highest'}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* Optional JCB Payment Status Filter */}
                {activeTab === 'jcb' && (
                    <View style={styles.statusFilterRow}>
                        <Text style={styles.statusFilterLabel}>Payment Status:</Text>
                        <TouchableOpacity
                            style={[styles.miniFilterPill, paymentFilter === 'all' && styles.miniFilterActive]}
                            onPress={() => setPaymentFilter('all')}
                        >
                            <Text style={[styles.miniFilterText, paymentFilter === 'all' && styles.miniFilterTextActive]}>
                                All
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.miniFilterPill, paymentFilter === 'due' && styles.miniFilterActiveDanger]}
                            onPress={() => setPaymentFilter('due')}
                        >
                            <Text style={[styles.miniFilterText, paymentFilter === 'due' && styles.miniFilterTextActive]}>
                                ⚠️ Due Only
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.miniFilterPill, paymentFilter === 'settled' && styles.miniFilterActiveSuccess]}
                            onPress={() => setPaymentFilter('settled')}
                        >
                            <Text style={[styles.miniFilterText, paymentFilter === 'settled' && styles.miniFilterTextActive]}>
                                ✅ Paid
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Navigation Tabs */}
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

            {/* Content List */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Search / Filter Result Counter */}
                <View style={styles.resultsInfoRow}>
                    <Text style={styles.resultsCountText}>
                        Showing {filteredItems.length} filtered {activeTab.toUpperCase()} records
                    </Text>
                    {(searchQuery || dateFilter !== 'all' || paymentFilter !== 'all') && (
                        <TouchableOpacity
                            onPress={() => {
                                setSearchQuery('');
                                setDateFilter('all');
                                setPaymentFilter('all');
                            }}
                        >
                            <Text style={styles.resetFiltersText}>Reset Filters</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {loading ? (
                    <View style={styles.emptyContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={styles.emptyText}>Loading records from Google Sheets...</Text>
                    </View>
                ) : filteredItems.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📋</Text>
                        <Text style={styles.emptyTitle}>No matching records found</Text>
                        <Text style={styles.emptyText}>Try changing your search terms or date filter</Text>
                    </View>
                ) : activeTab === 'jcb' ? (
                    filteredItems.map((item, index) => <JCBItem key={item.actualEntryTime || index} item={item} />)
                ) : activeTab === 'tipper' ? (
                    filteredItems.map((item, index) => <TipperItem key={item.actualEntryTime || index} item={item} />)
                ) : activeTab === 'diesel' ? (
                    filteredItems.map((item, index) => <DieselItem key={item.actualEntryTime || index} item={item} />)
                ) : (
                    filteredItems.map((item, index) => <ExpenseItem key={item.actualEntryTime || index} item={item} />)
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
        paddingBottom: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.md,
    },
    headerTitle: {
        fontSize: theme.fontSize.xxl,
        fontWeight: theme.fontWeight.bold,
        color: '#fff',
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: theme.fontSize.sm,
        color: 'rgba(255, 255, 255, 0.85)',
    },
    shareReportBtn: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: theme.borderRadius.full,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    shareReportText: {
        color: '#fff',
        fontSize: theme.fontSize.xs,
        fontWeight: theme.fontWeight.bold,
    },
    summaryContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginTop: 4,
    },
    summaryToggle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 6,
    },
    summaryToggleTitle: {
        color: '#fff',
        fontSize: theme.fontSize.xs,
        fontWeight: theme.fontWeight.bold,
        letterSpacing: 0.5,
    },
    summaryToggleIcon: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: theme.fontSize.xs,
        fontWeight: theme.fontWeight.semibold,
    },
    kpiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.sm,
    },
    kpiCard: {
        width: (width - theme.spacing.lg * 2 - theme.spacing.md * 2 - theme.spacing.sm) / 2,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.sm + 2,
        ...theme.shadows.sm,
    },
    kpiCardWide: {
        width: '100%',
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.sm + 4,
    },
    kpiLabel: {
        fontSize: 10,
        color: theme.colors.textSecondary,
        fontWeight: theme.fontWeight.semibold,
        textTransform: 'uppercase',
    },
    kpiValue: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
        marginTop: 2,
    },
    kpiValueLarge: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.extrabold,
    },
    quickShortcutsBar: {
        backgroundColor: theme.colors.card,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
        paddingVertical: theme.spacing.sm,
    },
    shortcutsScroll: {
        paddingHorizontal: theme.spacing.md,
        gap: theme.spacing.sm,
    },
    shortcutChip: {
        backgroundColor: theme.colors.primarySoft,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.borderRadius.full,
        borderWidth: 1,
        borderColor: 'rgba(30, 90, 150, 0.2)',
    },
    shortcutChipText: {
        color: theme.colors.primary,
        fontSize: theme.fontSize.xs,
        fontWeight: theme.fontWeight.bold,
    },
    filterSection: {
        backgroundColor: theme.colors.card,
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.sm,
        paddingBottom: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        height: 40,
        marginBottom: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    searchIcon: {
        fontSize: 16,
        marginRight: theme.spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: theme.fontSize.sm,
        color: theme.colors.text,
    },
    clearSearchBtn: {
        padding: 4,
    },
    clearSearchText: {
        color: theme.colors.textMuted,
        fontSize: 14,
    },
    dateFilterScroll: {
        gap: theme.spacing.sm,
        paddingVertical: 2,
        alignItems: 'center',
    },
    filterPill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.colors.cardLight,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    filterPillActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    filterPillText: {
        fontSize: 12,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.textSecondary,
    },
    filterPillTextActive: {
        color: '#fff',
    },
    sortPill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.borderRadius.full,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginLeft: 6,
    },
    sortPillText: {
        fontSize: 12,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
    },
    statusFilterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing.sm,
        gap: theme.spacing.sm,
    },
    statusFilterLabel: {
        fontSize: 11,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.textMuted,
    },
    miniFilterPill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: theme.colors.cardLight,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    miniFilterActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    miniFilterActiveDanger: {
        backgroundColor: theme.colors.danger,
        borderColor: theme.colors.danger,
    },
    miniFilterActiveSuccess: {
        backgroundColor: theme.colors.success,
        borderColor: theme.colors.success,
    },
    miniFilterText: {
        fontSize: 11,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.textSecondary,
    },
    miniFilterTextActive: {
        color: '#fff',
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        backgroundColor: theme.colors.card,
        gap: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
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
        fontSize: 13,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.textSecondary,
    },
    tabTextActive: {
        color: '#fff',
        fontWeight: theme.fontWeight.bold,
    },
    resultsInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
        paddingHorizontal: 4,
    },
    resultsCountText: {
        fontSize: 12,
        color: theme.colors.textMuted,
        fontWeight: theme.fontWeight.semibold,
    },
    resetFiltersText: {
        fontSize: 12,
        color: theme.colors.primary,
        fontWeight: theme.fontWeight.bold,
    },
    scrollContent: {
        padding: theme.spacing.md,
        paddingBottom: theme.spacing.xxl + 40,
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
    cardHeaderLeft: {
        flex: 1,
    },
    cardTitle: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
    },
    cardSubtitle: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textSecondary,
        marginTop: 2,
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
    divider: {
        height: 1,
        backgroundColor: theme.colors.borderLight,
        marginVertical: theme.spacing.md,
    },
    recordedByText: {
        fontSize: 10,
        color: theme.colors.textMuted,
        fontStyle: 'italic',
        marginTop: 6,
    },
    metaActionRow: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.sm,
    },
    metaBtn: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    metaBtnText: {
        fontSize: 11,
        color: theme.colors.primary,
        fontWeight: theme.fontWeight.bold,
    },
    controlRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: theme.spacing.md,
        paddingTop: theme.spacing.sm,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderLight,
        gap: theme.spacing.sm,
    },
    editButton: {
        flex: 1,
        backgroundColor: theme.colors.cardLight,
        paddingVertical: 8,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    editButtonText: {
        fontSize: 12,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.primary,
    },
    deleteButton: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: theme.borderRadius.md,
        backgroundColor: '#fee2e2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteButtonText: {
        fontSize: 12,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.danger,
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
    emptyTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
        marginBottom: 4,
    },
    emptyText: {
        textAlign: 'center',
        color: theme.colors.textMuted,
        fontSize: theme.fontSize.sm,
        marginTop: 4,
    },
});
