import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
    SYNC_QUEUE: '@sync_queue',
    JCB_CACHE: '@jcb_cache',
    TIPPER_CACHE: '@tipper_cache',
    DIESEL_CACHE: '@diesel_cache',
    EXPENSE_CACHE: '@expense_cache',
    STATS_CACHE: '@stats_cache',
    USER_ROLE: '@user_role',
    USER_NAME: '@user_name',
};

// Save data to storage
export const saveData = async (key, data) => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving data:', error);
        return false;
    }
};

// Get data from storage
export const getData = async (key) => {
    try {
        const data = await AsyncStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error getting data:', error);
        return null;
    }
};

// Add to sync queue
export const addToSyncQueue = async (type, data) => {
    try {
        const queue = (await getData(STORAGE_KEYS.SYNC_QUEUE)) || [];
        queue.push({
            type,
            data,
            timestamp: new Date().toISOString(),
        });
        await saveData(STORAGE_KEYS.SYNC_QUEUE, queue);
        return true;
    } catch (error) {
        console.error('Error adding to sync queue:', error);
        return false;
    }
};

// Get sync queue
export const getSyncQueue = async () => {
    return (await getData(STORAGE_KEYS.SYNC_QUEUE)) || [];
};

// Clear sync queue
export const clearSyncQueue = async () => {
    await saveData(STORAGE_KEYS.SYNC_QUEUE, []);
};

// Remove item from sync queue
export const removeFromSyncQueue = async (index) => {
    const queue = await getSyncQueue();
    queue.splice(index, 1);
    await saveData(STORAGE_KEYS.SYNC_QUEUE, queue);
};

// Cache helpers
export const cacheJCBData = async (data) => {
    await saveData(STORAGE_KEYS.JCB_CACHE, data);
};

export const getCachedJCBData = async () => {
    return await getData(STORAGE_KEYS.JCB_CACHE);
};

export const cacheTipperData = async (data) => {
    await saveData(STORAGE_KEYS.TIPPER_CACHE, data);
};

export const getCachedTipperData = async () => {
    return await getData(STORAGE_KEYS.TIPPER_CACHE);
};

export const cacheDieselData = async (data) => {
    await saveData(STORAGE_KEYS.DIESEL_CACHE, data);
};

export const getCachedDieselData = async () => {
    return await getData(STORAGE_KEYS.DIESEL_CACHE);
};

export const cacheExpenseData = async (data) => {
    await saveData(STORAGE_KEYS.EXPENSE_CACHE, data);
};

export const getCachedExpenseData = async () => {
    return await getData(STORAGE_KEYS.EXPENSE_CACHE);
};

export const cacheStats = async (data) => {
    await saveData(STORAGE_KEYS.STATS_CACHE, data);
};

export const getCachedStats = async () => {
    return await getData(STORAGE_KEYS.STATS_CACHE);
};

export { STORAGE_KEYS };
