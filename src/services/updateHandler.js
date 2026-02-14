import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';
import { Alert, Platform, Linking } from 'react-native';

const CURRENT_VERSION = Constants.expoConfig.version;

export const checkForUpdates = async (apiUrl) => {
    try {
        const response = await fetch(`${apiUrl}?action=getLatestVersion`);
        const result = await response.json();

        if (result.success && result.version !== CURRENT_VERSION) {
            return {
                updateAvailable: true,
                latestVersion: result.version,
                downloadUrl: result.downloadUrl,
                releaseNotes: result.notes || 'New features and bug fixes'
            };
        }
        return { updateAvailable: false };
    } catch (error) {
        console.error('Update check failed:', error);
        return { updateAvailable: false };
    }
};

export const downloadAndInstallUpdate = async (downloadUrl, onProgress) => {
    if (Platform.OS !== 'android') return;

    try {
        // Directly open the download URL in the browser
        // This is the most reliable way to download large APK files from GitHub
        const supported = await Linking.canOpenURL(downloadUrl);
        if (supported) {
            await Linking.openURL(downloadUrl);
            return true;
        } else {
            throw new Error('Cannot open URL');
        }
    } catch (error) {
        console.error('Download failed:', error);
        Alert.alert(
            'Update Failed',
            'Could not open the download link. Please download manually from GitHub.',
            [{ text: 'OK' }]
        );
        return false;
    }
};
