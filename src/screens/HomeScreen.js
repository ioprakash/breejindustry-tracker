import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    RefreshControl,
    Image,
    Dimensions,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import { theme } from '../styles/theme';
import { StatCard } from '../components/StatCard';
import { getQuickStats, processSyncQueue } from '../services/api';
import { formatNumber } from '../utils/calculations';
import { getData, saveData } from '../services/storage';

const { width } = Dimensions.get('window');

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning ☀️';
    if (hour < 17) return 'Good Afternoon 🌤️';
    return 'Good Evening 🌙';
};

export const HomeScreen = ({ navigation }) => {
    const [stats, setStats] = useState({ jcbCount: 0, tipperCount: 0, todayJcb: 0, todayTipper: 0, totalDue: 0 });
    const [refreshing, setRefreshing] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userName, setUserName] = useState('');
    const [lastEntries, setLastEntries] = useState({ jcb: null, tipper: null });
    const isMounted = React.useRef(true);

    const checkRole = async () => {
        const role = await getData('@user_role');
        const name = await getData('@user_name');

        if (!isMounted.current) return;

        setIsAdmin(role === 'admin');
        setUserName(name || '');

        // Load last entries for editing
        const lastJcb = await getData('@last_jcb_entry');
        const lastTipper = await getData('@last_tipper_entry');
        if (isMounted.current) {
            setLastEntries({ jcb: lastJcb, tipper: lastTipper });
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            'Confirm Logout',
            'Are you sure you want to log out from Brij Industry Tracker?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: async () => {
                        isMounted.current = false;
                        await saveData('@user_role', null);
                        await saveData('@user_name', null);
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        });
                    },
                },
            ]
        );
    };

    const loadStats = async () => {
        try {
            await processSyncQueue();
            const data = await getQuickStats();
            if (isMounted.current && data) {
                setStats({
                    jcbCount: data.jcbCount || 0,
                    tipperCount: data.tipperCount || 0,
                    todayJcb: data.todayJcb || 0,
                    todayTipper: data.todayTipper || 0,
                    totalDue: data.totalDue || 0,
                });
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    useEffect(() => {
        isMounted.current = true;
        checkRole();
        loadStats();
        return () => {
            isMounted.current = false;
        };
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadStats();
        setRefreshing(false);
    };

    const MenuCard = ({ title, subtitle, icon, onPress, colors, isHalf }) => (
        <TouchableOpacity
            style={[styles.menuCard, isHalf && styles.menuCardHalf]}
            onPress={onPress}
            activeOpacity={0.88}
        >
            <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.menuGradient}
            >
                <View style={styles.menuDecorCircle} />
                <View style={styles.iconBadge}>
                    <Text style={styles.menuIcon}>{icon}</Text>
                </View>
                <Text style={styles.menuTitle}>{title}</Text>
                <Text style={styles.menuSubtitle}>{subtitle}</Text>
                <View style={styles.menuArrow}>
                    <Text style={styles.menuArrowText}>→</Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Executive Gradient Header */}
                <LinearGradient
                    colors={theme.gradients.header}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    <View style={styles.headerDecor1} />
                    <View style={styles.headerDecor2} />

                    <View style={styles.topNavRow}>
                        <View style={styles.roleBadge}>
                            <Text style={styles.roleBadgeText}>
                                {isAdmin ? '👑 ADMIN ACCESS' : '👷 STAFF MEMBER'}
                            </Text>
                        </View>

                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
                            <Text style={styles.logoutText}>🚪 Logout</Text>
                        </TouchableOpacity>
                    </View>

                    <Image
                        source={require('../../assets/brij-logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.tagline}>Heavy Equipment & Vehicle Fleet Operations</Text>
                </LinearGradient>

                {/* Welcome Card with Glass Glow */}
                <View style={styles.welcomeCard}>
                    <View style={styles.welcomeLeft}>
                        <Text style={styles.welcomeGreeting}>{getGreeting()}</Text>
                        <Text style={styles.userNameText}>{userName || 'Team Member'}</Text>
                        <Text style={styles.welcomeText}>Manage daily trips, machine hours & fuel logs</Text>
                    </View>
                    <View style={styles.welcomeIconContainer}>
                        <Text style={styles.welcomeEmoji}>{isAdmin ? '💼' : '🚜'}</Text>
                    </View>
                </View>

                {/* Operations & Forms Section */}
                <View style={styles.sectionHeaderRow}>
                    <View style={styles.sectionIndicator} />
                    <Text style={styles.sectionTitle}>Operations & Logging</Text>
                </View>

                <View style={styles.menuGrid}>
                    <MenuCard
                        title="Attendance"
                        subtitle="Clock In / Out"
                        icon="🕒"
                        colors={['#10b981', '#047857']}
                        onPress={() => navigation.navigate('Attendance')}
                        isHalf
                    />
                    <MenuCard
                        title="JCB Entry"
                        subtitle="Hours & Tips"
                        icon="🚜"
                        colors={['#1d4ed8', '#1e40af']}
                        onPress={() => navigation.navigate('JCBForm')}
                        isHalf
                    />
                    <MenuCard
                        title="Tipper Entry"
                        subtitle="Trip & Material"
                        icon="🚚"
                        colors={['#f97316', '#c2410c']}
                        onPress={() => navigation.navigate('TipperForm')}
                        isHalf
                    />
                    <MenuCard
                        title="Diesel Log"
                        subtitle="Fuel & Pump"
                        icon="⛽"
                        colors={['#f59e0b', '#d97706']}
                        onPress={() => navigation.navigate('DieselEntry')}
                        isHalf
                    />
                </View>

                {/* Admin Management Section */}
                {isAdmin && (
                    <>
                        <View style={styles.sectionHeaderRow}>
                            <View style={[styles.sectionIndicator, { backgroundColor: '#8b5cf6' }]} />
                            <Text style={styles.sectionTitle}>Business Management</Text>
                        </View>
                        <View style={styles.menuGrid}>
                            <MenuCard
                                title="Dashboard"
                                subtitle="All Entries & Live Search"
                                icon="📊"
                                colors={['#0284c7', '#0369a1']}
                                onPress={() => navigation.navigate('Dashboard')}
                                isHalf
                            />
                            <MenuCard
                                title="Expenses"
                                subtitle="Log Daily Costs"
                                icon="💎"
                                colors={['#8b5cf6', '#6d28d9']}
                                onPress={() => navigation.navigate('ExpenseForm')}
                                isHalf
                            />
                            <MenuCard
                                title="Approve Att."
                                subtitle="Staff Attendance Review"
                                icon="✅"
                                colors={['#059669', '#065f46']}
                                onPress={() => navigation.navigate('AdminAttendance')}
                                isHalf
                            />
                            <MenuCard
                                title="Party Ledger"
                                subtitle="Credit & Debit Statements"
                                icon="📒"
                                colors={['#6366f1', '#4338ca']}
                                onPress={() => navigation.navigate('Ledger')}
                                isHalf
                            />
                            <MenuCard
                                title="Employees"
                                subtitle="Manage System Passwords"
                                icon="👥"
                                colors={['#e11d48', '#be123c']}
                                onPress={() => navigation.navigate('ManageEmployees')}
                                isHalf
                            />
                        </View>
                    </>
                )}

                {/* Quick Performance Stats */}
                <View style={styles.sectionHeaderRow}>
                    <View style={[styles.sectionIndicator, { backgroundColor: theme.colors.primary }]} />
                    <Text style={styles.sectionTitle}>{isAdmin ? 'Live System Overview' : 'Your Activity Summary'}</Text>
                </View>

                <View style={styles.statsGrid}>
                    <StatCard
                        icon="🚜"
                        value={isAdmin ? stats.jcbCount : stats.todayJcb}
                        label={isAdmin ? "Total JCB Logged" : "Today's JCB Jobs"}
                        colors={['#1d4ed8', '#1e3a8a']}
                        subtitle={!isAdmin ? `Lifetime: ${stats.jcbCount} entries` : null}
                    />
                    <StatCard
                        icon="🚚"
                        value={isAdmin ? stats.tipperCount : stats.todayTipper}
                        label={isAdmin ? "Total Tipper Trips" : "Today's Tipper Trips"}
                        colors={['#f97316', '#9a3412']}
                        subtitle={!isAdmin ? `Lifetime: ${stats.tipperCount} trips` : null}
                    />
                    {isAdmin && (
                        <StatCard
                            icon="💰"
                            value={`₹${formatNumber(stats.totalDue || 0)}`}
                            label="Total Outstanding Due"
                            colors={['#ef4444', '#991b1b']}
                        />
                    )}
                </View>

                {/* Quick Re-edit Last Entry (For Employees) */}
                {!isAdmin && (lastEntries.jcb || lastEntries.tipper) && (
                    <View style={styles.reEditSection}>
                        <View style={styles.sectionHeaderRow}>
                            <View style={[styles.sectionIndicator, { backgroundColor: theme.colors.warning }]} />
                            <Text style={styles.sectionTitle}>Re-edit Recent Submission</Text>
                        </View>
                        <View style={styles.reEditRow}>
                            {lastEntries.jcb && (
                                <TouchableOpacity
                                    style={styles.reEditBtn}
                                    onPress={() => navigation.navigate('JCBForm', { initialData: lastEntries.jcb, isEdit: true })}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.reEditText}>🚜 Edit Last JCB ({lastEntries.jcb.gadiNo})</Text>
                                </TouchableOpacity>
                            )}
                            {lastEntries.tipper && (
                                <TouchableOpacity
                                    style={styles.reEditBtn}
                                    onPress={() => navigation.navigate('TipperForm', { initialData: lastEntries.tipper, isEdit: true })}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.reEditText}>🚚 Edit Last Tipper ({lastEntries.tipper.gadiNo})</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}

                {/* Footer Brand Tag */}
                <View style={styles.footerContainer}>
                    <Text style={styles.versionText}>
                        Brij Industry Tracker Enterprise • v{Constants.expoConfig?.version || '1.8.4'}
                    </Text>
                    <Text style={styles.footerSubText}>Cloud Sync • Google Sheets Database Protected</Text>
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
        paddingBottom: theme.spacing.xxl + 30,
    },
    headerGradient: {
        paddingTop: theme.spacing.xl,
        paddingBottom: theme.spacing.xxl + 14,
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
        borderBottomLeftRadius: theme.borderRadius.xl,
        borderBottomRightRadius: theme.borderRadius.xl,
    },
    headerDecor1: {
        position: 'absolute',
        top: -40,
        right: -30,
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(255,255,255,0.07)',
    },
    headerDecor2: {
        position: 'absolute',
        bottom: -20,
        left: -20,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    topNavRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.sm,
    },
    roleBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: theme.borderRadius.full,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.25)',
    },
    roleBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: theme.fontWeight.extrabold,
        letterSpacing: 0.5,
    },
    logoutButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: theme.borderRadius.full,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    logoutText: {
        color: '#fff',
        fontSize: theme.fontSize.xs,
        fontWeight: theme.fontWeight.bold,
    },
    logo: {
        width: 240,
        height: 110,
        marginBottom: 2,
    },
    tagline: {
        fontSize: theme.fontSize.sm,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: theme.fontWeight.medium,
        letterSpacing: 0.3,
    },
    welcomeCard: {
        marginHorizontal: theme.spacing.lg,
        marginTop: -26,
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.colors.card,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        ...theme.shadows.lg,
    },
    welcomeLeft: {
        flex: 1,
    },
    welcomeGreeting: {
        fontSize: theme.fontSize.xs,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    userNameText: {
        fontSize: theme.fontSize.xl,
        fontWeight: theme.fontWeight.extrabold,
        color: theme.colors.text,
        marginBottom: 4,
    },
    welcomeText: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textSecondary,
        lineHeight: 18,
    },
    welcomeIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: theme.spacing.md,
    },
    welcomeEmoji: {
        fontSize: 28,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: theme.spacing.lg,
        marginTop: theme.spacing.xl,
        marginBottom: theme.spacing.md,
    },
    sectionIndicator: {
        width: 4,
        height: 18,
        borderRadius: 2,
        backgroundColor: theme.colors.primary,
        marginRight: 8,
    },
    sectionTitle: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
        letterSpacing: 0.2,
    },
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: theme.spacing.lg,
        gap: theme.spacing.md,
    },
    menuCard: {
        borderRadius: theme.borderRadius.lg,
        overflow: 'hidden',
        ...theme.shadows.md,
    },
    menuCardHalf: {
        width: (width - theme.spacing.lg * 2 - theme.spacing.md) / 2,
    },
    menuGradient: {
        padding: theme.spacing.lg,
        minHeight: 135,
        justifyContent: 'flex-end',
        position: 'relative',
        overflow: 'hidden',
    },
    menuDecorCircle: {
        position: 'absolute',
        right: -15,
        top: -15,
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    iconBadge: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.22)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.sm,
    },
    menuIcon: {
        fontSize: 22,
    },
    menuTitle: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.extrabold,
        color: '#fff',
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.85)',
        letterSpacing: 0.2,
    },
    menuArrow: {
        position: 'absolute',
        right: 12,
        bottom: 12,
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuArrowText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: theme.fontWeight.bold,
    },
    statsGrid: {
        paddingHorizontal: theme.spacing.lg,
        gap: theme.spacing.md,
    },
    reEditSection: {
        marginTop: 6,
    },
    reEditRow: {
        paddingHorizontal: theme.spacing.lg,
        gap: theme.spacing.sm,
    },
    reEditBtn: {
        backgroundColor: theme.colors.card,
        borderWidth: 1.5,
        borderColor: theme.colors.border,
        paddingVertical: 12,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        ...theme.shadows.sm,
    },
    reEditText: {
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.textSecondary,
        fontSize: theme.fontSize.sm,
    },
    footerContainer: {
        alignItems: 'center',
        marginTop: theme.spacing.xxl,
        paddingHorizontal: theme.spacing.lg,
    },
    versionText: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
        fontSize: theme.fontSize.xs,
        fontWeight: theme.fontWeight.semibold,
        letterSpacing: 0.3,
    },
    footerSubText: {
        textAlign: 'center',
        color: theme.colors.textMuted,
        fontSize: 10,
        marginTop: 2,
    },
});
