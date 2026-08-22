import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../styles/theme';
import { compressImage } from '../utils/imageCompressor';

export const PhotoPicker = ({ photo, onPhotoSelected, label = 'Attach Photo (Optional)' }) => {
    const requestPermissions = async () => {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

        return cameraPermission.status === 'granted' && mediaPermission.status === 'granted';
    };

    const handleTakePhoto = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) {
            Alert.alert('Permission Required', 'Camera and media library permissions are required');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            try {
                const compressed = await compressImage(result.assets[0].uri);
                onPhotoSelected(compressed);
            } catch (error) {
                Alert.alert('Error', 'Failed to process image');
            }
        }
    };

    const handleChoosePhoto = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) {
            Alert.alert('Permission Required', 'Media library permission is required');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            try {
                const compressed = await compressImage(result.assets[0].uri);
                onPhotoSelected(compressed);
            } catch (error) {
                Alert.alert('Error', 'Failed to process image');
            }
        }
    };

    const showOptions = () => {
        Alert.alert(
            'Select Photo',
            'Choose image source',
            [
                { text: '📷 Take Photo', onPress: handleTakePhoto },
                { text: '🖼️ Choose from Gallery', onPress: handleChoosePhoto },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity
                style={[styles.photoArea, photo && styles.photoAreaFilled]}
                onPress={showOptions}
                activeOpacity={0.85}
            >
                {photo ? (
                    <View style={styles.previewContainer}>
                        <Image source={{ uri: photo }} style={styles.photo} />
                        <View style={styles.changeOverlay}>
                            <Text style={styles.changeOverlayText}>🔄 Change Photo</Text>
                        </View>
                    </View>
                ) : (
                    <View style={styles.placeholderContainer}>
                        <View style={styles.iconCircle}>
                            <Text style={styles.icon}>📷</Text>
                        </View>
                        <Text style={styles.primaryText}>Tap to Capture or Upload</Text>
                        <Text style={styles.secondaryText}>Camera / Gallery (Auto Compressed)</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.md,
    },
    label: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.textSecondary,
        marginBottom: 8,
    },
    photoArea: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.cardLight,
        minHeight: 140,
        overflow: 'hidden',
    },
    photoAreaFilled: {
        borderStyle: 'solid',
        borderColor: theme.colors.primary,
        padding: 0,
        backgroundColor: '#000',
    },
    placeholderContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: theme.colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.sm,
    },
    icon: {
        fontSize: 24,
    },
    primaryText: {
        color: theme.colors.text,
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.bold,
        marginBottom: 2,
    },
    secondaryText: {
        color: theme.colors.textMuted,
        fontSize: theme.fontSize.xs,
    },
    previewContainer: {
        width: '100%',
        position: 'relative',
    },
    photo: {
        width: '100%',
        height: 180,
        borderRadius: theme.borderRadius.lg,
    },
    changeOverlay: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.borderRadius.full,
    },
    changeOverlayText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
    },
});
