import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import Constants from 'expo-constants';
import { Alert, Platform, Linking } from 'react-native';

// Hardcoded version truth for this binary
const CURRENT_VERSION = '1.7.9';

export const checkForUpdates = async (apiUrl) => {
    try {
        // Add cache buster to URL to avoid getting old version info
        const response = await fetch(`${apiUrl}?action=getLatestVersion&cb=${Date.now()}`);
        const result = await response.json();

        if (result.success && isNewerVersion(result.version, CURRENT_VERSION)) {
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

// Compare version strings (e.g., "1.7.6" vs "1.7.5")
const isNewerVersion = (latest, current) => {
    try {
        const latestParts = latest.split('.').map(num => parseInt(num, 10));
        const currentParts = current.split('.').map(num => parseInt(num, 10));

        for (let i = 0; i < 3; i++) {
            const l = latestParts[i] || 0;
            const c = currentParts[i] || 0;
            if (l > c) return true;
            if (l < c) return false;
        }
    } catch (e) {
        return latest !== current; // Fallback
    }
    return false;
};

// Silent Install: Download APK directly to device and open installer
export const downloadAndInstallUpdate = async (downloadUrl, onProgress) => {
    if (Platform.OS !== 'android') return false;

    try {
        const fileName = downloadUrl.split('/').pop() || 'update.apk';
        const fileUri = FileSystem.documentDirectory + fileName;

        // Add cache buster to download URL if it's a raw github link
        const finalUrl = downloadUrl.includes('raw.githubusercontent.com')
            ? `${downloadUrl}?cb=${Date.now()}`
            : downloadUrl;

        // Start download with progress tracking
        const downloadResumable = FileSystem.createDownloadResumable(
            finalUrl,
            fileUri,
            {},
            (downloadProgress) => {
                const total = downloadProgress.totalBytesExpectedToWrite;
                const progress = total > 0
                    ? downloadProgress.totalBytesWritten / total
                    : 0;
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
        const finalUrl = downloadUrl.includes('raw.githubusercontent.com')
            ? `${downloadUrl}?cb=${Date.now()}`
            : downloadUrl;

        await Linking.openURL(finalUrl);
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
