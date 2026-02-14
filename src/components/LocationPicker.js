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

            setLocation(mapsUrl);
            onLocationSelected(mapsUrl);
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
                message: `My Current Location: ${location}`,
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
                <Text style={styles.label}>📍 Live Location</Text>
                {location && (
                    <TouchableOpacity onPress={handleShare}>
                        <Text style={styles.shareText}>📤 Share Link</Text>
                    </TouchableOpacity>
                )}
            </View>

            {location ? (
                <View style={styles.resultContainer}>
                    <TouchableOpacity onPress={openInMaps} style={styles.linkContainer}>
                        <Text style={styles.linkText} numberOfLines={1}>{location}</Text>
                        <Text style={styles.hint}>(Tap to preview in Maps)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.reGetBtn}
                        onPress={getLocation}
                        disabled={loading}
                    >
                        <Text style={styles.reGetText}>🔄 Refresh</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity
                    style={styles.getBtn}
                    onPress={getLocation}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.getBtnText}>Get Current Location</Text>
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
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.textSecondary,
    },
    shareText: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    getBtn: {
        backgroundColor: theme.colors.primary,
        height: 48,
        borderRadius: theme.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        ...theme.shadows.sm,
    },
    getBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: theme.fontSize.sm,
    },
    resultContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    linkContainer: {
        flex: 1,
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        padding: 10,
    },
    linkText: {
        fontSize: 12,
        color: theme.colors.primary,
        textDecorationLine: 'underline',
    },
    hint: {
        fontSize: 10,
        color: theme.colors.textMuted,
        marginTop: 2,
    },
    reGetBtn: {
        padding: 10,
        backgroundColor: theme.colors.borderLight,
        borderRadius: theme.borderRadius.md,
    },
    reGetText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: theme.colors.textSecondary,
    },
});
