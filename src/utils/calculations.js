// Calculation utilities

export const calculateJCBTotal = (tipCount, rate) => {
    const tips = parseFloat(tipCount) || 0;
    const rateVal = parseFloat(rate) || 0;
    return tips * rateVal;
};

export const calculateDueAmount = (totalAmount, receivedAmount) => {
    const total = parseFloat(totalAmount) || 0;
    const received = parseFloat(receivedAmount) || 0;
    return total - received;
};

export const formatNumber = (num) => {
    if (!num) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

export const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
