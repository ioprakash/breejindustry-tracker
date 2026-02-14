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
    cacheExpenseData,
    getCachedExpenseData,
    cacheStats,
    getCachedStats,
    saveData,
} from './storage';

const API_URL = 'https://script.google.com/macros/s/AKfycbxubMOm8TjBOzgOzhazJ2-heLKddQpVI9-kK6Tea1zZlRQlIeI1h0Z8VDXUZarh5sOe-Q/exec';

// Check if online
const isOnline = () => {
    return true;
};

// Login User
export const loginUser = async (password) => {
    try {
        const response = await fetch(`${API_URL}?action=login&password=${encodeURIComponent(password)}`);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
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
        if (result.success) {
            // Track last entry for editing
            await saveData('@last_jcb_entry', { ...data, timestamp: result.timestamp });
        }
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
        if (result.success) {
            await saveData('@last_tipper_entry', { ...data, timestamp: result.timestamp });
        }
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

// Submit Expense Entry
export const submitExpenseEntry = async (data, skipQueue = false) => {
    try {
        if (!isOnline() && !skipQueue) {
            await addToSyncQueue('expense', data);
            return { success: true, queued: true };
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'addExpense',
                data: data,
            }),
        });

        const result = await response.json();
        return { success: result.success, queued: false };
    } catch (error) {
        console.error('Error submitting Expense entry:', error);
        if (!skipQueue) {
            await addToSyncQueue('expense', data);
            return { success: true, queued: true };
        }
        throw error;
    }
};

// UNIVERSAL UPDATE
export const updateEntry = async (sheetName, originalTimestamp, updatedData) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'updateEntry',
                data: {
                    sheetName,
                    originalEntryTime: originalTimestamp,
                    ...updatedData
                }
            }),
        });
        return await response.json();
    } catch (error) {
        console.error('Update failed:', error);
        return { success: false, error: 'Connection failure' };
    }
};

// Get JCB Entries
export const getJCBEntries = async () => {
    try {
        const response = await fetch(`${API_URL}?action=getJCB`);
        const result = await response.json();

        if (result.success) {
            await cacheJCBData(result.data);
            return result.data;
        }

        return await getCachedJCBData() || [];
    } catch (error) {
        console.error('Error getting JCB entries:', error);
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

// Get Diesel Entries
export const getDieselEntries = async () => {
    try {
        const response = await fetch(`${API_URL}?action=getDiesel`);
        const result = await response.json();

        if (result.success) {
            await cacheDieselData(result.data);
            return result.data;
        }

        return await getCachedDieselData() || [];
    } catch (error) {
        console.error('Error getting Diesel entries:', error);
        return await getCachedDieselData() || [];
    }
};

// Get Expense Entries
export const getExpenseEntries = async () => {
    try {
        const response = await fetch(`${API_URL}?action=getExpense`);
        const result = await response.json();

        if (result.success) {
            await cacheExpenseData(result.data);
            return result.data;
        }

        return await getCachedExpenseData() || [];
    } catch (error) {
        console.error('Error getting Expense entries:', error);
        return await getCachedExpenseData() || [];
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

    for (const item of queue) {
        try {
            if (item.type === 'jcb') {
                await submitJCBEntry(item.data, true);
            } else if (item.type === 'tipper') {
                await submitTipperEntry(item.data, true);
            } else if (item.type === 'diesel') {
                await submitDieselEntry(item.data, true);
            } else if (item.type === 'expense') {
                await submitExpenseEntry(item.data, true);
            }
        } catch (error) {
            console.error('Failed to sync item:', error);
        }
    }
    await clearSyncQueue();
};
