import {
    addToSyncQueue,
    getSyncQueue,
    clearSyncQueue,
    cacheJCBData,
    getCachedJCBData,
    cacheTipperData,
    getCachedTipperData,
    cacheDieselData,
    getCachedDieselData,
    cacheStats,
    getCachedStats,
} from './storage';

// Replace this with your deployed Google Apps Script URL
const API_URL = 'https://script.google.com/macros/s/AKfycbxubMOm8TjBOzgOzhazJ2-heLKddQpVI9-kK6Tea1zZlRQlIeI1h0Z8VDXUZarh5sOe-Q/exec';

// Check if online
const isOnline = () => {
    // Note: In React Native, you can use @react-native-community/netinfo for better detection
    return true; // Simplified for now
};

// Submit JCB Entry
export const submitJCBEntry = async (data, skipQueue = false) => {
    try {
        if (!isOnline() && !skipQueue) {
            await addToSyncQueue('jcb', data);
            return { success: true, queued: true };
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'addJCB',
                data: data,
            }),
        });

        const result = await response.json();
        return { success: result.success, queued: false };
    } catch (error) {
        console.error('Error submitting JCB entry:', error);
        if (!skipQueue) {
            await addToSyncQueue('jcb', data);
            return { success: true, queued: true };
        }
        throw error;
    }
};

// Submit Tipper Entry
export const submitTipperEntry = async (data, skipQueue = false) => {
    try {
        if (!isOnline() && !skipQueue) {
            await addToSyncQueue('tipper', data);
            return { success: true, queued: true };
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'addTipper',
                data: data,
            }),
        });

        const result = await response.json();
        return { success: result.success, queued: false };
    } catch (error) {
        console.error('Error submitting Tipper entry:', error);
        if (!skipQueue) {
            await addToSyncQueue('tipper', data);
            return { success: true, queued: true };
        }
        throw error;
    }
};

// Submit Diesel Entry
export const submitDieselEntry = async (data, skipQueue = false) => {
    try {
        if (!isOnline() && !skipQueue) {
            await addToSyncQueue('diesel', data);
            return { success: true, queued: true };
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'addDiesel',
                data: data,
            }),
        });

        const result = await response.json();
        return { success: result.success, queued: false };
    } catch (error) {
        console.error('Error submitting Diesel entry:', error);
        if (!skipQueue) {
            await addToSyncQueue('diesel', data);
            return { success: true, queued: true };
        }
        throw error;
    }
};

// Get JCB Entries
export const getJCBEntries = async () => {
    try {
        // Try to get from API
        const response = await fetch(`${API_URL}?action=getJCB`);
        const result = await response.json();

        if (result.success) {
            await cacheJCBData(result.data);
            return result.data;
        }

        // Fallback to cache
        return await getCachedJCBData() || [];
    } catch (error) {
        console.error('Error getting JCB entries:', error);
        // Return cached data on error
        return await getCachedJCBData() || [];
    }
};

// Get Tipper Entries
export const getTipperEntries = async () => {
    try {
        const response = await fetch(`${API_URL}?action=getTipper`);
        const result = await response.json();

        if (result.success) {
            await cacheTipperData(result.data);
            return result.data;
        }

        return await getCachedTipperData() || [];
    } catch (error) {
        console.error('Error getting Tipper entries:', error);
        return await getCachedTipperData() || [];
    }
};

// Get Quick Stats
export const getQuickStats = async () => {
    try {
        const response = await fetch(`${API_URL}?action=getStats`);
        const result = await response.json();

        if (result.success) {
            await cacheStats(result.data);
            return result.data;
        }

        return await getCachedStats() || { jcbCount: 0, tipperCount: 0, totalDue: 0 };
    } catch (error) {
        console.error('Error getting stats:', error);
        return await getCachedStats() || { jcbCount: 0, tipperCount: 0, totalDue: 0 };
    }
};

// Process Sync Queue
export const processSyncQueue = async () => {
    const queue = await getSyncQueue();
    if (queue.length === 0) return;

    console.log(`Processing ${queue.length} queued items...`);
    const failed = [];

    for (const item of queue) {
        try {
            if (item.type === 'jcb') {
                await submitJCBEntry(item.data, true);
            } else if (item.type === 'tipper') {
                await submitTipperEntry(item.data, true);
            } else if (item.type === 'diesel') {
                await submitDieselEntry(item.data, true);
            }
        } catch (error) {
            console.error('Failed to sync item:', error);
            failed.push(item);
        }
    }

    // Save only failed items back to queue
    if (failed.length > 0) {
        await addToSyncQueue('failed', failed);
    } else {
        await clearSyncQueue();
    }
};
