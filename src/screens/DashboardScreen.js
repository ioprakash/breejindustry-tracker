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

    // Filter & Search States
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | 'yesterday' | '7days' | '30days'
    const [paymentFilter, setPaymentFilter] = useState('all'); // 'all' | 'due' | 'settled'
    const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest' | 'amount'
    const [showFinancialSummary, setShowFinancialSummary] = useState(false); // Collapsed by default for maximum screen space

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

    // Filter and Sort Items for the Active Tab
    const filteredItems = useMemo(() => {
        let items = [];
        if (activeTab === 'jcb') items = [...jcbEntries];
        else if (activeTab === 'tipper') items = [...tipperEntries];
        else if (activeTab === 'diesel') items = [...dieselEntries];
        else if (activeTab === 'expense') items = [...expenseEntries];

        // 1. Date Filter
        items = items.filter(item => matchesDateFilter(item.date));

        // 2. Payment Status Filter (JCB only)
        if (activeTab === 'jcb' && paymentFilter !== 'all') {
            if (paymentFilter === 'due') {
                items = items.filter(item => (parseFloat(item.dueAmount) || 0) > 0);
            } else if (paymentFilter === 'settled') {
                items = items.filter(item => (parseFloat(item.dueAmount) || 0) <= 0);
            }
        }

        // 3. Search Query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            items = items.filter(item => {
                const searchFields = [
                    item.gadiNo,
                    item.vehicleNo,
                    item.driverName,
                    item.customerName,
                    item.customerPartyName,
                    item.customerNumber,
                    item.phone,
                    item.material,
                    item.loadingPlace,
                    item.unloadingPlace,
                    item.petrolPumpName,
                    item.paidBy,
                    item.expenseMode,
                    item.expensesDescription,
                    item.workDetail,
                    item.remarks,
                    item.remark,
                    item.enteredBy,
                ].filter(Boolean);

                return searchFields.some(val => String(val).toLowerCase().includes(query));
            });
        }

        // 4. Sort Order
        items.sort((a, b) => {
            if (sortOrder === 'newest') {
                const dateA = new Date(a.date || 0).getTime();
                const dateB = new Date(b.date || 0).getTime();
                if (dateB !== dateA) return dateB - dateA;
                return (b.actualEntryTime || '').localeCompare(a.actualEntryTime || '');
            }
            if (sortOrder === 'oldest') {
                const dateA = new Date(a.date || 0).getTime();
                const dateB = new Date(b.date || 0).getTime();
                if (dateA !== dateB) return dateA - dateB;
                return (a.actualEntryTime || '').localeCompare(b.actualEntryTime || '');
            }
            if (sortOrder === 'amount') {
                const amountA = parseFloat(a.totalAmount || a.cost || a.amount || 0);
                const amountB = parseFloat(b.totalAmount || b.cost || b.amount || 0);
                return amountB - amountA;
            }
            return 0;
        });

        return items;
    }, [activeTab, jcbEntries, tipperEntries, dieselEntries, expenseEntries, dateFilter, paymentFilter, searchQuery, sortOrder]);

    // Handle Delete Record with Confirmation
    const handleDeleteRecord = (sheetName, item, entityTitle) => {
        if (!isAdmin) {
            Alert.alert('Permission Denied', 'Only admin can delete records.');
            return;
        }

        const identifier = item.gadiNo || item.vehicleNo || item.expensesDescription || 'this record';
        const timestamp = item.actualEntryTime;

        if (!timestamp) {
            Alert.alert('Error', 'This record cannot be uniquely identified for deletion.');
            return;
        }

        Alert.alert(
            'Confirm Delete',
            `Are you sure you want to permanently delete ${entityTitle} (${identifier}) from ${sheetName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setDeletingKey(timestamp);
                        try {
                            const res = await deleteEntry(sheetName, timestamp);
                            if (res.success) {
                                Alert.alert('Deleted', 'Record successfully removed.');
                                loadData();
                            } else {
                                Alert.alert('Error', res.error || 'Failed to delete record.');
                            }
                        } catch (err) {
                            Alert.alert('Error', 'Could not delete record from server.');
                        } finally {
                            setDeletingKey(null);
                        }
                    },
                },
            ]
        );
    };

    // Share Formatted Business Summary Report
    const handleShareReport = async () => {
        try {
            const report = `📊 *Brij Industry Tracker - Business Summary*\n` +
                `📅 Period: ${dateFilter.toUpperCase()} (${getTodayDate()})\n\n` +
                `💰 *Financial Overview:*\n` +
                `• Total Billed: ₹${formatNumber(financialOverview.totalBilled)}\n` +
                `• Total Cash Received: ₹${formatNumber(financialOverview.totalReceived)}\n` +
                `• Outstanding Due: ₹${formatNumber(financialOverview.totalDue)}\n` +
                `• Fuel Cost (${financialOverview.totalFuelLtr} Ltr): ₹${formatNumber(financialOverview.totalFuelCost)}\n` +
                `• Daily Expenses: ₹${formatNumber(financialOverview.totalExpenses)}\n` +
                `• *Net Operating Balance: ₹${formatNumber(financialOverview.netOperatingProfit)}*\n\n` +
                `🚜 *Operations:*\n` +
                `• JCB Entries: ${financialOverview.jcbCount}\n` +
                `• Tipper Trips: ${financialOverview.totalTipperTrips} (${financialOverview.totalCFT} CFT)\n` +
                `• Fuel Entries: ${financialOverview.dieselCount}\n` +
                `• Expense Logs: ${financialOverview.expenseCount}\n\n` +
                `_Generated via Brij Industry Tracker Admin Dashboard_`;

            await Share.share({
                message: report,
                title: 'Brij Business Performance Summary',
            });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const InfoRow = ({ label, value, color, bold = false }) => (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}:</Text>
            <Text style={[
                styles.infoValue,
                color && { color },
                bold && { fontWeight: theme.fontWeight.bold },
            ]}>
                {value || 'N/A'}
            </Text>
        </View>
    );

    // Render JCB Card
    const JCBItem = ({ item }) => {
        const isDeleting = deletingKey === item.actualEntryTime;
        const dueVal = parseFloat(item.dueAmount) || 0;

        return (
            <View style={styles.card}>
                <View style={[styles.cardAccent, { backgroundColor: dueVal > 0 ? theme.colors.danger : theme.colors.primary }]} />
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardHeaderLeft}>
                            <Text style={styles.cardTitle}>🚜 {item.gadiNo || 'JCB'}</Text>
                            <Text style={styles.cardSubtitle}>{item.driverName || 'Driver'} • {item.runMode || 'Hour'}</Text>
                        </View>
                        <View style={[styles.dateBadge, { backgroundColor: 'rgba(29, 78, 216, 0.12)' }]}>
                            <Text style={styles.dateBadgeText}>{formatDate(item.date)}</Text>
                        </View>
                    </View>

                    <View style={styles.cardBody}>
                        {item.customerPartyName || item.customerName ? (
                            <InfoRow label="Customer" value={item.customerPartyName || item.customerName} />
                        ) : null}
                        {item.phone || item.customerNumber ? (
                            <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.phone || item.customerNumber}`)}>
                                <InfoRow label="Phone" value={`📞 ${item.phone || item.customerNumber}`} color={theme.colors.primary} bold />
                            </TouchableOpacity>
                        ) : null}
                        {item.workDetail ? <InfoRow label="Work Detail" value={item.workDetail} /> : null}

                        {item.runMode === 'Hour' && (
                            <>
                                <InfoRow label="Meter Range" value={`${item.startMtr || 0} → ${item.stopMtr || 0}`} />
                                <InfoRow label="Total Work Run" value={`${item.totalWorkRun || item.totalHourCount || 0} Hours`} bold />
                            </>
                        )}

                        {item.runMode !== 'Hour' && (
                            <InfoRow label="Tip/Units" value={`${item.totalHourCount || item.tipCount || 0}`} bold />
                        )}

                        <InfoRow label="Rate" value={`₹${formatNumber(item.rate || 0)}`} />
                        <InfoRow label="Total Amount" value={`₹${formatNumber(item.totalAmount || 0)}`} bold />
                        <InfoRow label="Received" value={`₹${formatNumber(item.receivedAmount || 0)}`} color={theme.colors.success} bold />
                        <InfoRow
                            label="Due Amount"
                            value={`₹${formatNumber(item.dueAmount || 0)}`}
                            color={dueVal > 0 ? theme.colors.danger : theme.colors.textMuted}
                            bold
                        />
                        {item.paymentReceivedBy ? <InfoRow label="Recv By" value={item.paymentReceivedBy} /> : null}

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
                                    <Text style={styles.metaBtnText}>📍 Location</Text>
                                </TouchableOpacity>
                            ) : null}

                            {item.photo ? (
                                <TouchableOpacity
                                    style={styles.metaBtn}
                                    onPress={() => Linking.openURL(item.photo)}
                                >
                                    <Text style={styles.metaBtnText}>📸 Photo</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>

                        {/* Control Row */}
                        <View style={styles.controlRow}>
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => navigation.navigate('JCBForm', { initialData: item, isEdit: true })}
                            >
                                <Text style={styles.editButtonText}>✏️ Edit</Text>
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
                            <Text style={styles.cardTitle}>🚚 {item.gadiNo || 'Tipper'}</Text>
                            <Text style={styles.cardSubtitle}>{item.driverName || 'Driver'}</Text>
                        </View>
                        <View style={[styles.dateBadge, { backgroundColor: 'rgba(249, 115, 22, 0.15)' }]}>
                            <Text style={[styles.dateBadgeText, { color: theme.colors.secondaryDark }]}>{formatDate(item.date)}</Text>
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
                                    <Text style={styles.metaBtnText}>📍 Location</Text>
                                </TouchableOpacity>
                            ) : null}

                            {item.photo ? (
                                <TouchableOpacity
                                    style={styles.metaBtn}
                                    onPress={() => Linking.openURL(item.photo)}
                                >
                                    <Text style={styles.metaBtnText}>📸 Photo</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>

                        {/* Control Row */}
                        <View style={styles.controlRow}>
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => navigation.navigate('TipperForm', { initialData: item, isEdit: true })}
                            >
                                <Text style={styles.editButtonText}>✏️ Edit</Text>
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
                            <Text style={styles.cardSubtitle}>{item.vehicleType || 'Machine'} Fuel</Text>
                        </View>
                        <View style={[styles.dateBadge, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                            <Text style={[styles.dateBadgeText, { color: theme.colors.warning }]}>{formatDate(item.date)}</Text>
                        </View>
                    </View>

                    <View style={styles.cardBody}>
                        <InfoRow label="Quantity" value={`${item.dieselLtr || item['diesel(ltr)'] || '0'} Litres`} bold />
                        <InfoRow label="Cost" value={`₹${formatNumber(item.cost || item.dieselCost || 0)}`} bold color={theme.colors.danger} />
                        {item.petrolPumpName ? <InfoRow label="Petrol Pump" value={item.petrolPumpName} /> : null}
                        {item.meterReading ? <InfoRow label="Meter" value={item.meterReading} /> : null}
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
                                    <Text style={styles.metaBtnText}>📍 Location</Text>
                                </TouchableOpacity>
                            ) : null}

                            {item.photo ? (
                                <TouchableOpacity
                                    style={styles.metaBtn}
                                    onPress={() => Linking.openURL(item.photo)}
                                >
                                    <Text style={styles.metaBtnText}>📸 Photo</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>

                        {/* Control Row */}
                        <View style={styles.controlRow}>
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => navigation.navigate('DieselEntry', { initialData: item, isEdit: true })}
                            >
                                <Text style={styles.editButtonText}>✏️ Edit</Text>
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
                <View style={[styles.cardAccent, { backgroundColor: theme.colors.purple }]} />
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardHeaderLeft}>
                            <Text style={styles.cardTitle}>💎 {item.expensesDescription || 'Expense'}</Text>
                            <Text style={styles.cardSubtitle}>{item.expenseMode || 'Operational'}</Text>
                        </View>
                        <View style={[styles.dateBadge, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                            <Text style={[styles.dateBadgeText, { color: theme.colors.purple }]}>{formatDate(item.date)}</Text>
                        </View>
                    </View>

                    <View style={styles.cardBody}>
                        <InfoRow label="Amount" value={`₹${formatNumber(item.amount || 0)}`} bold color={theme.colors.danger} />
                        {item.expenseMode ? <InfoRow label="Mode" value={item.expenseMode} /> : null}
                        {item.remark ? <InfoRow label="Remark" value={item.remark} /> : null}
                        {item.time ? <InfoRow label="Time" value={item.time} /> : null}

                        {item.enteredBy ? (
                            <Text style={styles.recordedByText}>Recorded by: {item.enteredBy}</Text>
                        ) : null}

                        {/* Control Row */}
                        <View style={styles.controlRow}>
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => navigation.navigate('ExpenseForm', { initialData: item, isEdit: true })}
                            >
                                <Text style={styles.editButtonText}>✏️ Edit</Text>
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
            <ScrollView
                stickyHeaderIndices={[3]} // Makes the tabs bar stick to top on scroll while hiding large headers!
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* 1. Header Banner & Collapsible Finance Overview (Scrolls away to free up screen) */}
                <LinearGradient
                    colors={theme.gradients.header}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <View style={styles.headerTop}>
                        <View style={styles.headerTextGroup}>
                            <Text style={styles.headerTitle}>📊 Business Dashboard</Text>
                            <Text style={styles.headerSubtitle}>Live records & financial tracking</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.shareReportBtn}
                            onPress={handleShareReport}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.shareReportText}>📤 Share</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Collapsible Finance Overview Card */}
                    <View style={styles.summaryContainer}>
                        <TouchableOpacity
                            style={styles.summaryToggle}
                            onPress={() => setShowFinancialSummary(!showFinancialSummary)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.summaryToggleTitle}>
                                💼 Executive Overview ({dateFilter.toUpperCase()})
                            </Text>
                            <Text style={styles.summaryToggleIcon}>
                                {showFinancialSummary ? '▲ Hide Stats' : '▼ View Financials'}
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

                {/* 2. Quick Action Shortcuts (Scrolls away) */}
                {isAdmin && (
                    <View style={styles.quickShortcutsBar}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shortcutsScroll}>
                            <TouchableOpacity style={styles.shortcutChip} onPress={() => navigation.navigate('JCBForm')}>
                                <Text style={styles.shortcutChipText}>🚜 +JCB</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.shortcutChip} onPress={() => navigation.navigate('TipperForm')}>
                                <Text style={styles.shortcutChipText}>🚚 +Tipper</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.shortcutChip} onPress={() => navigation.navigate('DieselEntry')}>
                                <Text style={styles.shortcutChipText}>⛽ +Diesel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.shortcutChip} onPress={() => navigation.navigate('ExpenseForm')}>
                                <Text style={styles.shortcutChipText}>💎 +Expense</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.shortcutChip} onPress={() => navigation.navigate('AdminAttendance')}>
                                <Text style={styles.shortcutChipText}>✅ Attendance</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.shortcutChip} onPress={() => navigation.navigate('Ledger')}>
                                <Text style={styles.shortcutChipText}>📒 Ledger</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                )}

                {/* 3. Search and Date Filters (Scrolls away to provide full screen space) */}
                <View style={styles.filterSection}>
                    {/* Search Bar */}
                    <View style={styles.searchBar}>
                        <Text style={styles.searchIcon}>🔍</Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search vehicle, driver, customer..."
                            placeholderTextColor={theme.colors.textMuted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
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
                                {sortOrder === 'newest' ? '📅 Newest' : sortOrder === 'oldest' ? '📅 Oldest' : '💰 Amount'}
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>

                    {/* JCB Payment Status Filter */}
                    {activeTab === 'jcb' && (
                        <View style={styles.statusFilterRow}>
                            <Text style={styles.statusFilterLabel}>Status:</Text>
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

                {/* 4. Sticky Navigation Tabs (Docks at top when scrolling down) */}
                <View style={styles.stickyTabsWrapper}>
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
                </View>

                {/* 5. Big Area Content List */}
                <View style={styles.dataAreaContainer}>
                    {/* Filter result status row */}
                    <View style={styles.resultsInfoRow}>
                        <Text style={styles.resultsCountText}>
                            Showing {filteredItems.length} {activeTab.toUpperCase()} records
                        </Text>
                        {(searchQuery || dateFilter !== 'all' || paymentFilter !== 'all') && (
                            <TouchableOpacity
                                onPress={() => {
                                    setSearchQuery('');
                                    setDateFilter('all');
                                    setPaymentFilter('all');
                                }}
                            >
                                <Text style={styles.resetFiltersText}>Reset Filters ✕</Text>
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
                </View>
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
        paddingBottom: theme.spacing.xxl + 40,
    },
    header: {
        paddingTop: theme.spacing.lg,
        paddingBottom: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    headerTextGroup: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: theme.fontWeight.extrabold,
        color: '#fff',
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.85)',
    },
    shareReportBtn: {
        backgroundColor: 'rgba(255, 255, 255, 0.22)',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: theme.borderRadius.full,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.35)',
    },
    shareReportText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: theme.fontWeight.bold,
    },
    summaryContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderRadius: theme.borderRadius.md,
        padding: 10,
        marginTop: 4,
    },
    summaryToggle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryToggleTitle: {
        color: '#fff',
        fontSize: 12,
        fontWeight: theme.fontWeight.bold,
        letterSpacing: 0.3,
    },
    summaryToggleIcon: {
        color: '#ffea79',
        fontSize: 12,
        fontWeight: theme.fontWeight.bold,
    },
    kpiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 10,
    },
    kpiCard: {
        width: (width - 64) / 2,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: theme.borderRadius.sm,
        padding: 10,
    },
    kpiCardWide: {
        width: '100%',
        backgroundColor: '#0f2b59',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    kpiLabel: {
        fontSize: 10,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    kpiValue: {
        fontSize: 15,
        fontWeight: theme.fontWeight.extrabold,
        color: theme.colors.text,
    },
    kpiValueLarge: {
        fontSize: 18,
        fontWeight: theme.fontWeight.extrabold,
    },
    quickShortcutsBar: {
        backgroundColor: theme.colors.card,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        paddingVertical: 8,
    },
    shortcutsScroll: {
        paddingHorizontal: theme.spacing.lg,
        gap: 8,
    },
    shortcutChip: {
        backgroundColor: theme.colors.primarySoft,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.borderRadius.full,
        borderWidth: 1,
        borderColor: 'rgba(29, 78, 216, 0.2)',
    },
    shortcutChipText: {
        fontSize: 12,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.primary,
    },
    filterSection: {
        backgroundColor: theme.colors.card,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardLight,
        borderRadius: theme.borderRadius.full,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        height: 38,
        marginBottom: 8,
    },
    searchIcon: {
        fontSize: 14,
        marginRight: 6,
    },
    searchInput: {
        flex: 1,
        fontSize: 13,
        color: theme.colors.text,
        paddingVertical: 0,
    },
    clearSearchBtn: {
        padding: 4,
    },
    clearSearchText: {
        fontSize: 12,
        color: theme.colors.textMuted,
        fontWeight: 'bold',
    },
    dateFilterScroll: {
        gap: 6,
        alignItems: 'center',
        paddingVertical: 2,
    },
    filterPill: {
        paddingHorizontal: 12,
        paddingVertical: 5,
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
        fontSize: 11,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.textSecondary,
    },
    filterPillTextActive: {
        color: '#fff',
        fontWeight: theme.fontWeight.bold,
    },
    sortPill: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: theme.borderRadius.full,
        backgroundColor: 'rgba(245, 158, 11, 0.12)',
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    sortPillText: {
        fontSize: 11,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.warning,
    },
    statusFilterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
    },
    statusFilterLabel: {
        fontSize: 11,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.textSecondary,
    },
    miniFilterPill: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: theme.borderRadius.sm,
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
        fontSize: 10,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.textSecondary,
    },
    miniFilterTextActive: {
        color: '#fff',
        fontWeight: theme.fontWeight.bold,
    },
    stickyTabsWrapper: {
        backgroundColor: '#0b1e38',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.15)',
        ...theme.shadows.md,
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.sm,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: '#f97316',
    },
    tabText: {
        fontSize: 12,
        fontWeight: theme.fontWeight.semibold,
        color: 'rgba(255, 255, 255, 0.65)',
    },
    tabTextActive: {
        color: '#ffffff',
        fontWeight: theme.fontWeight.extrabold,
    },
    dataAreaContainer: {
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.md,
    },
    resultsInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    resultsCountText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontWeight: theme.fontWeight.semibold,
    },
    resetFiltersText: {
        fontSize: 12,
        color: theme.colors.danger,
        fontWeight: theme.fontWeight.bold,
    },
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.lg,
        marginBottom: theme.spacing.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.border,
        flexDirection: 'row',
        ...theme.shadows.sm,
    },
    cardAccent: {
        width: 5,
    },
    cardContent: {
        flex: 1,
        padding: theme.spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
        paddingBottom: 8,
        marginBottom: 8,
    },
    cardHeaderLeft: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: theme.fontWeight.extrabold,
        color: theme.colors.text,
    },
    cardSubtitle: {
        fontSize: 11,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    dateBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: theme.borderRadius.full,
    },
    dateBadgeText: {
        fontSize: 10,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.primary,
    },
    cardBody: {
        gap: 4,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 2,
    },
    infoLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontWeight: theme.fontWeight.medium,
    },
    infoValue: {
        fontSize: 12,
        color: theme.colors.text,
        fontWeight: theme.fontWeight.semibold,
        textAlign: 'right',
        flexShrink: 1,
    },
    recordedByText: {
        fontSize: 10,
        color: theme.colors.textMuted,
        fontStyle: 'italic',
        marginTop: 4,
    },
    metaActionRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderLight,
    },
    metaBtn: {
        backgroundColor: theme.colors.primarySoft,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.sm,
    },
    metaBtnText: {
        fontSize: 11,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.primary,
    },
    controlRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 10,
    },
    editButton: {
        flex: 1,
        backgroundColor: theme.colors.primarySoft,
        paddingVertical: 8,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(29, 78, 216, 0.25)',
    },
    editButtonText: {
        fontSize: 12,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.primary,
    },
    deleteButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.25)',
    },
    deleteButtonText: {
        fontSize: 12,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.danger,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyIcon: {
        fontSize: 42,
        marginBottom: 10,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
        marginBottom: 4,
    },
    emptyText: {
        fontSize: 12,
        color: theme.colors.textMuted,
        textAlign: 'center',
    },
});
