import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import Constants from 'expo-constants';
import { Alert, Platform } from 'react-native';

// This URL should point to your latest APK download link
// For now, we'll assume the API returns this
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
        const filename = 'brij_tracker_update.apk';
        const fileUri = `${FileSystem.cacheDirectory}${filename}`;

        const downloadResumable = FileSystem.createDownloadResumable(
            downloadUrl,
            fileUri,
            {},
            (downloadProgress) => {
                const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
                if (onProgress) onProgress(progress);
            }
        );

        const { uri } = await downloadResumable.downloadAsync();

        // Use FileSystem to get a content URI that can be used with IntentLauncher
        const contentUri = await FileSystem.getContentUriAsync(uri);

        await IntentLauncher.startActivityAsync('android.intent.action.INSTALL_PACKAGE', {
            data: contentUri,
            flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
            type: 'application/vnd.android.package-archive',
        });

        return true;
    } catch (error) {
        console.error('Download/Install failed:', error);
        Alert.alert('Update Failed', 'Could not download or install the update. Please try again later.');
        return false;
    }
};
