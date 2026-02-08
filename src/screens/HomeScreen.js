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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';
import { StatCard } from '../components/StatCard';
import { getQuickStats, processSyncQueue } from '../services/api';
import { formatNumber } from '../utils/calculations';
import { checkForUpdates } from '../utils/updateChecker';

export const HomeScreen = ({ navigation }) => {
    const [stats, setStats] = useState({ jcbCount: 0, tipperCount: 0, totalDue: 0 });
    const [refreshing, setRefreshing] = useState(false);

    const loadStats = async () => {
        try {
            await processSyncQueue(); // Sync any pending items
            const data = await getQuickStats();
            setStats(data);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    useEffect(() => {
        loadStats();
        checkForUpdates(); // Check for app updates
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadStats();
        setRefreshing(false);
    };

    const MenuCard = ({ title, subtitle, icon, onPress, colors }) => (
        <TouchableOpacity style={styles.menuCard} onPress={onPress} activeOpacity={0.8}>
            <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.menuGradient}
            >
                <Text style={styles.menuIcon}>{icon}</Text>
                <Text style={styles.menuTitle}>{title}</Text>
                <Text style={styles.menuSubtitle}>{subtitle}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Header with Logo */}
                <View style={styles.header}>
                    <Image
                        source={require('../../assets/brij-logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.subtitle}>Vehicle Tracking System</Text>
                </View>

                {/* Welcome Card */}
                <View style={styles.welcomeCard}>
                    <Text style={styles.welcomeTitle}>Welcome Back!</Text>
                    <Text style={styles.welcomeText}>Track your JCB and Tipper operations efficiently</Text>
                </View>

                {/* Menu Cards */}
                <View style={styles.menuGrid}>
                    <MenuCard
                        title="JCB Entry"
                        subtitle="Log JCB work details"
                        icon="🚜"
                        colors={[theme.colors.primary, theme.colors.primaryDark]}
                        onPress={() => navigation.navigate('JCBForm')}
                    />
                    <MenuCard
                        title="Tipper Entry"
                        subtitle="Record Tipper trips"
                        icon="🚚"
                        colors={[theme.colors.secondary, theme.colors.secondaryDark]}
                        onPress={() => navigation.navigate('TipperForm')}
                    />
                    <MenuCard
                        title="Dashboard"
                        subtitle="View all entries"
                        icon="📊"
                        colors={[theme.colors.accent, theme.colors.accentDark]}
                        onPress={() => navigation.navigate('Dashboard')}
                    />
                    <MenuCard
                        title="Log Diesel"
                        subtitle="Record fuel usage"
                        icon="⛽"
                        colors={[theme.colors.warning, '#f59e0b']}
                        onPress={() => navigation.navigate('DieselEntry')}
                    />
                </View>

                {/* Quick Stats */}
                <Text style={styles.sectionTitle}>Quick Stats</Text>
                <View style={styles.statsGrid}>
                    <StatCard
                        value={stats.jcbCount || 0}
                        label="JCB Entries"
                        colors={[theme.colors.primary, theme.colors.primaryDark]}
                    />
                    <StatCard
                        value={stats.tipperCount || 0}
                        label="Tipper Trips"
                        colors={[theme.colors.secondary, '#be185d']}
                    />
                    <StatCard
                        value={`₹${formatNumber(stats.totalDue || 0)}`}
                        label="Total Due"
                        colors={[theme.colors.warning, '#ea580c']}
                    />
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
        padding: theme.spacing.lg,
        paddingBottom: theme.spacing.xxl,
    },
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
        paddingTop: theme.spacing.md,
    },
    logo: {
        width: 280,
        height: 140,
        marginBottom: theme.spacing.sm,
    },
    appName: {
        fontSize: theme.fontSize.xxl,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    subtitle: {
        fontSize: theme.fontSize.md,
        color: theme.colors.textSecondary,
        fontWeight: theme.fontWeight.medium,
    },
    welcomeCard: {
        padding: theme.spacing.xl,
        borderRadius: theme.borderRadius.lg,
        marginBottom: theme.spacing.xl,
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        ...theme.shadows.md,
    },
    welcomeTitle: {
        fontSize: theme.fontSize.xl,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.primary,
        marginBottom: theme.spacing.xs,
    },
    welcomeText: {
        fontSize: theme.fontSize.md,
        color: theme.colors.textSecondary,
        lineHeight: 22,
    },
    menuGrid: {
        gap: theme.spacing.md,
        marginBottom: theme.spacing.xl,
    },
    menuCard: {
        borderRadius: theme.borderRadius.lg,
        overflow: 'hidden',
        ...theme.shadows.md,
    },
    menuGradient: {
        padding: theme.spacing.xl,
    },
    menuIcon: {
        fontSize: 44,
        marginBottom: theme.spacing.md,
    },
    menuTitle: {
        fontSize: theme.fontSize.xl,
        fontWeight: theme.fontWeight.bold,
        color: '#fff',
        marginBottom: theme.spacing.xs,
    },
    menuSubtitle: {
        fontSize: theme.fontSize.sm,
        color: 'rgba(255, 255, 255, 0.95)',
        lineHeight: 20,
    },
    sectionTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    statsGrid: {
        gap: theme.spacing.md,
    },
});
