import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Local Network Update URL (Mobile and PC must be on same Wi-Fi)
const UPDATE_CHECK_URL = 'http://192.168.10.254:8080/version.json';
const LAST_CHECK_KEY = '@last_update_check';
const CHECK_INTERVAL = 1 * 60 * 1000; // 1 minute for local testing
// Get current app version from app.json
export const CURRENT_VERSION = '1.0.0';

// Check if update is available
export const checkForUpdates = async () => {
    try {
        // Check if we should check for updates (once per day)
        const lastCheck = await AsyncStorage.getItem(LAST_CHECK_KEY);
        const now = Date.now();

        if (lastCheck && (now - parseInt(lastCheck)) < CHECK_INTERVAL) {
            return; // Already checked recently
        }

        // Fetch latest version from server
        const response = await fetch(UPDATE_CHECK_URL, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache',
            },
        });

        if (!response.ok) {
            console.log('Update check failed:', response.status);
            return;
        }

        const data = await response.json();
        const latestVersion = data.version;
        const downloadUrl = data.downloadUrl;
        const updateMessage = data.message || 'A new version is available!';

        // Save last check time
        await AsyncStorage.setItem(LAST_CHECK_KEY, now.toString());

        // Compare versions
        if (isNewerVersion(latestVersion, CURRENT_VERSION)) {
            showUpdateAlert(latestVersion, downloadUrl, updateMessage);
        }
    } catch (error) {
        console.log('Error checking for updates:', error);
        // Silently fail - don't bother the user
    }
};

// Compare version strings (e.g., "1.2.0" vs "1.0.0")
const isNewerVersion = (latest, current) => {
    const latestParts = latest.split('.').map(Number);
    const currentParts = current.split('.').map(Number);

    for (let i = 0; i < 3; i++) {
        if (latestParts[i] > currentParts[i]) return true;
        if (latestParts[i] < currentParts[i]) return false;
    }
    return false;
};

// Show update alert to user
const showUpdateAlert = (version, downloadUrl, message) => {
    Alert.alert(
        '🎉 Update Available',
        `${message}\n\nNew Version: ${version}\nCurrent Version: ${CURRENT_VERSION}`,
        [
            {
                text: 'Later',
                style: 'cancel',
            },
            {
                text: 'Download',
                onPress: () => {
                    // Open download URL in browser
                    if (downloadUrl) {
                        const { Linking } = require('react-native');
                        Linking.openURL(downloadUrl).catch(err =>
                            console.error('Failed to open URL:', err)
                        );
                    }
                },
            },
        ]
    );
};

// Force check for updates (can be called from settings)
export const forceCheckForUpdates = async () => {
    await AsyncStorage.removeItem(LAST_CHECK_KEY);
    await checkForUpdates();
};
