import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import Constants from 'expo-constants';
import { Alert, Platform, Linking } from 'react-native';

const CURRENT_VERSION = '1.7.2';

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

// Silent Install: Download APK directly to device and open installer
export const downloadAndInstallUpdate = async (downloadUrl, onProgress) => {
    if (Platform.OS !== 'android') return false;

    try {
        const fileName = downloadUrl.split('/').pop() || 'update.apk';
        const fileUri = FileSystem.documentDirectory + fileName;

        // Start download with progress tracking
        const downloadResumable = FileSystem.createDownloadResumable(
            downloadUrl,
            fileUri,
            {},
            (downloadProgress) => {
                const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
                if (onProgress) {
                    onProgress(progress);
                }
            }
        );

        const result = await downloadResumable.downloadAsync();
        if (!result || !result.uri) {
            throw new Error('Download failed - no file URI');
        }

        // Get content URI for the downloaded file
        const contentUri = await FileSystem.getContentUriAsync(result.uri);

        // Open the APK installer using intent launcher
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: contentUri,
            flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
            type: 'application/vnd.android.package-archive',
        });

        return true;
    } catch (error) {
        console.error('Silent install failed:', error);
        Alert.alert(
            'Download Failed',
            'Silent install failed. Try using Browser Download instead.',
            [{ text: 'OK' }]
        );
        return false;
    }
};

// Browser Download: Open the download URL in the browser
export const openInBrowser = async (downloadUrl) => {
    try {
        await Linking.openURL(downloadUrl);
        return true;
    } catch (error) {
        console.error('Browser download failed:', error);
        Alert.alert(
            'Download Failed',
            'Could not open the download link. Please download manually from GitHub.',
            [{ text: 'OK' }]
        );
        return false;
    }
};
