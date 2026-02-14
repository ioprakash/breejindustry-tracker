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
    getData,
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

// Helper to add logged in user info
const attachUserInfo = async (data) => {
    const userName = await getData('@user_name');
    return { ...data, enteredBy: userName };
};

// Submit JCB Entry
export const submitJCBEntry = async (data, skipQueue = false) => {
    try {
        const finalData = await attachUserInfo(data);

        if (!isOnline() && !skipQueue) {
            await addToSyncQueue('jcb', finalData);
            return { success: true, queued: true };
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'addJCB', data: finalData }),
        });

        const result = await response.json();
        if (result.success) {
            await saveData('@last_jcb_entry', { ...finalData, actualEntryTime: result.actualEntryTime });
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
        const finalData = await attachUserInfo(data);

        if (!isOnline() && !skipQueue) {
            await addToSyncQueue('tipper', finalData);
            return { success: true, queued: true };
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'addTipper', data: finalData }),
        });

        const result = await response.json();
        if (result.success) {
            await saveData('@last_tipper_entry', { ...finalData, actualEntryTime: result.actualEntryTime });
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
        const finalData = await attachUserInfo(data);
        if (!isOnline() && !skipQueue) {
            await addToSyncQueue('diesel', finalData);
            return { success: true, queued: true };
        }
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'addDiesel', data: finalData }),
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
        const finalData = await attachUserInfo(data);
        if (!isOnline() && !skipQueue) {
            await addToSyncQueue('expense', finalData);
            return { success: true, queued: true };
        }
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'addExpense', data: finalData }),
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
        const userName = await getData('@user_name');
        const userRole = await getData('@user_role');

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'updateEntry',
                data: {
                    sheetName,
                    originalEntryTime: originalTimestamp,
                    userName,
                    userRole,
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

// Get Entries with Filters
const fetchWithAuth = async (action) => {
    try {
        const userName = await getData('@user_name');
        const role = await getData('@user_role');
        const url = `${API_URL}?action=${action}&userName=${encodeURIComponent(userName)}&role=${role}`;
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${action}:`, error);
        return { success: false };
    }
}

export const getJCBEntries = async () => {
    const result = await fetchWithAuth('getJCB');
    if (result.success) {
        await cacheJCBData(result.data);
        return result.data;
    }
    return await getCachedJCBData() || [];
};

export const getTipperEntries = async () => {
    const result = await fetchWithAuth('getTipper');
    if (result.success) {
        await cacheTipperData(result.data);
        return result.data;
    }
    return await getCachedTipperData() || [];
};

export const getDieselEntries = async () => {
    const result = await fetchWithAuth('getDiesel');
    if (result.success) {
        await cacheDieselData(result.data);
        return result.data;
    }
    return await getCachedDieselData() || [];
};

export const getExpenseEntries = async () => {
    const result = await fetchWithAuth('getExpense');
    if (result.success) {
        await cacheExpenseData(result.data);
        return result.data;
    }
    return await getCachedExpenseData() || [];
};

export const getQuickStats = async () => {
    const result = await fetchWithAuth('getStats');
    if (result.success) {
        await cacheStats(result.data);
        return result.data;
    }
    return await getCachedStats() || { jcbCount: 0, tipperCount: 0, totalDue: 0 };
};

// Process Sync Queue
export const processSyncQueue = async () => {
    const queue = await getSyncQueue();
    if (queue.length === 0) return;
    for (const item of queue) {
        try {
            if (item.type === 'jcb') await submitJCBEntry(item.data, true);
            else if (item.type === 'tipper') await submitTipperEntry(item.data, true);
            else if (item.type === 'diesel') await submitDieselEntry(item.data, true);
            else if (item.type === 'expense') await submitExpenseEntry(item.data, true);
        } catch (error) {
            console.error('Failed to sync item:', error);
        }
    }
    await clearSyncQueue();
};
