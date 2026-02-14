import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
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
        const filename = 'brij_tracker_update.apk';
        const fileUri = `${FileSystem.cacheDirectory}${filename}`;

        // Delete old cached APK if exists
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (fileInfo.exists) {
            await FileSystem.deleteAsync(fileUri, { idempotent: true });
        }

        const downloadResumable = FileSystem.createDownloadResumable(
            downloadUrl,
            fileUri,
            {
                headers: {
                    'Accept': 'application/octet-stream',
                },
            },
            (downloadProgress) => {
                if (downloadProgress.totalBytesExpectedToWrite > 0) {
                    const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
                    if (onProgress) onProgress(progress);
                }
            }
        );

        const result = await downloadResumable.downloadAsync();

        if (!result || !result.uri) {
            throw new Error('Download returned no URI');
        }

        // Verify file was actually downloaded and has content
        const downloadedFileInfo = await FileSystem.getInfoAsync(result.uri);
        if (!downloadedFileInfo.exists || downloadedFileInfo.size < 1000000) {
            throw new Error(`Downloaded file is too small or missing (${downloadedFileInfo.size || 0} bytes)`);
        }

        // Get content URI for the APK file
        const contentUri = await FileSystem.getContentUriAsync(result.uri);

        // Launch the installer
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: contentUri,
            flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
            type: 'application/vnd.android.package-archive',
        });

        return true;
    } catch (error) {
        console.error('Download/Install failed:', error);

        // Fallback: Open download URL in browser so user can install manually
        Alert.alert(
            'Update Failed',
            'Automatic install failed. Would you like to download the APK in your browser instead?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Open in Browser',
                    onPress: () => Linking.openURL(downloadUrl),
                },
            ]
        );
        return false;
    }
};
