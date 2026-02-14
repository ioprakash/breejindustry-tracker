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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import { theme } from '../styles/theme';
import { StatCard } from '../components/StatCard';
import { getQuickStats, processSyncQueue } from '../services/api';
import { formatNumber } from '../utils/calculations';
import { checkForUpdates } from '../utils/updateChecker';

const { width } = Dimensions.get('window');

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning ☀️';
    if (hour < 17) return 'Good Afternoon 🌤️';
    return 'Good Evening 🌙';
};

export const HomeScreen = ({ navigation }) => {
    const [stats, setStats] = useState({ jcbCount: 0, tipperCount: 0, totalDue: 0 });
    const [refreshing, setRefreshing] = useState(false);

    const loadStats = async () => {
        try {
            await processSyncQueue();
            const data = await getQuickStats();
            setStats(data);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    useEffect(() => {
        loadStats();
        checkForUpdates();
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
            activeOpacity={0.85}
        >
            <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.menuGradient}
            >
                <View style={styles.menuDecorCircle} />
                <Text style={styles.menuIcon}>{icon}</Text>
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
                {/* Gradient Header */}
                <LinearGradient
                    colors={theme.gradients.header}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    <View style={styles.headerDecor1} />
                    <View style={styles.headerDecor2} />
                    <Image
                        source={require('../../assets/brij-logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.tagline}>Vehicle Tracking System</Text>
                </LinearGradient>

                {/* Welcome Card */}
                <View style={styles.welcomeCard}>
                    <View style={styles.welcomeLeft}>
                        <Text style={styles.welcomeGreeting}>{getGreeting()}</Text>
                        <Text style={styles.welcomeText}>Track your JCB and Tipper operations efficiently</Text>
                    </View>
                    <View style={styles.welcomeIconContainer}>
                        <Text style={styles.welcomeEmoji}>📋</Text>
                    </View>
                </View>

                {/* Menu Cards - 2 Column Grid */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.menuGrid}>
                    <MenuCard
                        title="JCB Entry"
                        subtitle="Log work"
                        icon="🚜"
                        colors={theme.gradients.primary}
                        onPress={() => navigation.navigate('JCBForm')}
                        isHalf
                    />
                    <MenuCard
                        title="Tipper"
                        subtitle="Record trips"
                        icon="🚚"
                        colors={theme.gradients.secondary}
                        onPress={() => navigation.navigate('TipperForm')}
                        isHalf
                    />
                    <MenuCard
                        title="Dashboard"
                        subtitle="View entries"
                        icon="📊"
                        colors={theme.gradients.accent}
                        onPress={() => navigation.navigate('Dashboard')}
                        isHalf
                    />
                    <MenuCard
                        title="Diesel"
                        subtitle="Log fuel"
                        icon="⛽"
                        colors={theme.gradients.warning}
                        onPress={() => navigation.navigate('DieselEntry')}
                        isHalf
                    />
                </View>

                {/* Quick Stats */}
                <Text style={styles.sectionTitle}>Overview</Text>
                <View style={styles.statsGrid}>
                    <StatCard
                        icon="🚜"
                        value={stats.jcbCount || 0}
                        label="JCB Entries"
                        colors={theme.gradients.primary}
                    />
                    <StatCard
                        icon="🚚"
                        value={stats.tipperCount || 0}
                        label="Tipper Trips"
                        colors={theme.gradients.secondary}
                    />
                    <StatCard
                        icon="💰"
                        value={`₹${formatNumber(stats.totalDue || 0)}`}
                        label="Total Due"
                        colors={['#ef4444', '#dc2626']}
                    />
                </View>

                {/* Version Footer */}
                <Text style={styles.versionText}>
                    Brij Industry Tracker v{Constants.expoConfig?.version || '1.5.0'}
                </Text>
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
        paddingBottom: theme.spacing.xxl + 20,
    },
    headerGradient: {
        paddingTop: theme.spacing.xxl,
        paddingBottom: theme.spacing.xxl + 10,
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
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    headerDecor2: {
        position: 'absolute',
        bottom: -20,
        left: -20,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.04)',
    },
    logo: {
        width: 240,
        height: 120,
        marginBottom: theme.spacing.sm,
    },
    tagline: {
        fontSize: theme.fontSize.md,
        color: 'rgba(255, 255, 255, 0.85)',
        fontWeight: theme.fontWeight.medium,
        letterSpacing: 0.5,
    },
    welcomeCard: {
        marginHorizontal: theme.spacing.lg,
        marginTop: -20,
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        backgroundColor: theme.colors.card,
        flexDirection: 'row',
        alignItems: 'center',
        ...theme.shadows.lg,
    },
    welcomeLeft: {
        flex: 1,
    },
    welcomeGreeting: {
        fontSize: theme.fontSize.xl,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
        marginBottom: 4,
    },
    welcomeText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
        lineHeight: 20,
    },
    welcomeIconContainer: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: theme.colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: theme.spacing.md,
    },
    welcomeEmoji: {
        fontSize: 26,
    },
    sectionTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
        marginHorizontal: theme.spacing.lg,
        marginTop: theme.spacing.xl,
        marginBottom: theme.spacing.md,
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
        minHeight: 130,
        justifyContent: 'flex-end',
        position: 'relative',
        overflow: 'hidden',
    },
    menuDecorCircle: {
        position: 'absolute',
        right: -15,
        top: -15,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
    },
    menuIcon: {
        fontSize: 36,
        marginBottom: theme.spacing.sm,
    },
    menuTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.bold,
        color: '#fff',
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: theme.fontSize.xs,
        color: 'rgba(255, 255, 255, 0.8)',
        letterSpacing: 0.3,
    },
    menuArrow: {
        position: 'absolute',
        right: 14,
        bottom: 14,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuArrowText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: theme.fontWeight.bold,
    },
    statsGrid: {
        paddingHorizontal: theme.spacing.lg,
        gap: theme.spacing.md,
    },
    versionText: {
        textAlign: 'center',
        color: theme.colors.textMuted,
        fontSize: theme.fontSize.xs,
        marginTop: theme.spacing.xl,
        letterSpacing: 0.3,
    },
});
