import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../styles/theme';
import { compressImage } from '../utils/imageCompressor';

export const PhotoPicker = ({ photo, onPhotoSelected }) => {
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
            'Choose an option',
            [
                { text: 'Take Photo', onPress: handleTakePhoto },
                { text: 'Choose from Gallery', onPress: handleChoosePhoto },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Diesel Receipt Photo</Text>
            <TouchableOpacity
                style={[styles.photoArea, photo && styles.photoAreaFilled]}
                onPress={showOptions}
            >
                {photo ? (
                    <Image source={{ uri: photo }} style={styles.photo} />
                ) : (
                    <>
                        <Text style={styles.icon}>📸</Text>
                        <Text style={styles.text}>Tap to take or select photo</Text>
                    </>
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
        fontWeight: theme.fontWeight.medium,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    photoArea: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.cardLight,
        minHeight: 150,
    },
    photoAreaFilled: {
        borderStyle: 'solid',
        borderColor: theme.colors.success,
        padding: 0,
    },
    icon: {
        fontSize: 48,
        marginBottom: theme.spacing.sm,
    },
    text: {
        color: theme.colors.textSecondary,
        fontSize: theme.fontSize.sm,
    },
    photo: {
        width: '100%',
        height: 200,
        borderRadius: theme.borderRadius.md,
    },
});
