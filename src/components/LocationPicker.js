import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Share,
    Linking,
} from 'react-native';
import * as Location from 'expo-location';
import { theme } from '../styles/theme';

export const LocationPicker = ({ onLocationSelected, existingLocation }) => {
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState(existingLocation || null);

    const getLocation = async () => {
        setLoading(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location permission is required to fetch current position.');
                setLoading(false);
                return;
            }

            const currentPosition = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const { latitude, longitude } = currentPosition.coords;
            const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

            // Fetch address
            let address = '';
            try {
                const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
                if (reverseGeocode && reverseGeocode.length > 0) {
                    const place = reverseGeocode[0];
                    address = `${place.name || ''}, ${place.city || ''}, ${place.region || ''}, ${place.country || ''}`.replace(/^, |, $/g, '').replace(/, ,/g, ',');
                }
            } catch (err) {
                console.warn('Reverse geocode failed:', err);
            }

            setLocation(mapsUrl);
            onLocationSelected(mapsUrl, address);
        } catch (error) {
            console.error('Error getting location:', error);
            Alert.alert('Error', 'Could not fetch location. Please ensure GPS is on.');
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        if (!location) return;
        try {
            await Share.share({
                message: `Current Job Location: ${location}`,
                url: location,
                title: 'Share Location'
            });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const openInMaps = () => {
        if (location) {
            Linking.openURL(location);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.label}>📍 Live GPS Location</Text>
                {location && (
                    <TouchableOpacity onPress={handleShare}>
                        <Text style={styles.shareText}>📤 Share Link</Text>
                    </TouchableOpacity>
                )}
            </View>

            {location ? (
                <View style={styles.resultContainer}>
                    <TouchableOpacity onPress={openInMaps} style={styles.linkContainer}>
                        <Text style={styles.linkText} numberOfLines={1}>📍 {location}</Text>
                        <Text style={styles.hint}>Tap to preview location in Google Maps ↗</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.reGetBtn}
                        onPress={getLocation}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color={theme.colors.primary} />
                        ) : (
                            <Text style={styles.reGetText}>🔄 Refresh</Text>
                        )}
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity
                    style={styles.button}
                    onPress={getLocation}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <View style={styles.loadingRow}>
                            <ActivityIndicator color={theme.colors.primary} size="small" />
                            <Text style={styles.loadingText}>Acquiring High-Precision GPS...</Text>
                        </View>
                    ) : (
                        <View style={styles.btnRow}>
                            <Text style={styles.btnIcon}>📍</Text>
                            <Text style={styles.buttonText}>Fetch Current GPS Location</Text>
                        </View>
                    )}
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.textSecondary,
    },
    shareText: {
        fontSize: 12,
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: theme.colors.primarySoft,
        borderWidth: 1.5,
        borderColor: 'rgba(29, 78, 216, 0.25)',
        paddingVertical: 14,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    btnIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    buttonText: {
        color: theme.colors.primary,
        fontWeight: theme.fontWeight.bold,
        fontSize: theme.fontSize.sm,
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    loadingText: {
        color: theme.colors.primary,
        fontSize: theme.fontSize.xs,
        fontWeight: theme.fontWeight.medium,
    },
    resultContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.cardLight,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.sm + 2,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: 8,
    },
    linkContainer: {
        flex: 1,
    },
    linkText: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.primary,
        fontWeight: theme.fontWeight.bold,
    },
    hint: {
        fontSize: 10,
        color: theme.colors.textMuted,
        marginTop: 2,
    },
    reGetBtn: {
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    reGetText: {
        fontSize: 11,
        color: theme.colors.textSecondary,
        fontWeight: theme.fontWeight.bold,
    },
});
