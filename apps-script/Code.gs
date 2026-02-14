// Google Apps Script Backend for Brij Industry Tracker (v1.6.0 Stable)
// Unified Script for Tracking Income, Diesel, and Expenses

const SPREADSHEET_ID = '1zdVFPZCTOmUR-FdYANyyjOHnGSu-1-ORXuPB705NdRg';
const JCB_SHEET_NAME = 'JCB_Logs';
const TIPPER_SHEET_NAME = 'Tipper_Logs';
const DIESEL_SHEET_NAME = 'Diesel_Logs';
const EXPENSE_SHEET_NAME = 'Daily_Expenses';

const LATEST_VERSION = '1.6.0';
const DOWNLOAD_URL = 'https://github.com/ioprakash/breejindustry-tracker/releases/download/v1.6.0/brij-industry-tracker-v1.6.0.apk';

const ADMIN_PASSWORD = "667";
const STAFF_PASSWORD = "123";

// Standard JSON Response helper
function JSON_RES(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Ensure columns exist and are correct
function checkAndFixHeaders(sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(sheetName);
  
  const headersMap = {
    [JCB_SHEET_NAME]: ['Date', 'Party Name', 'Site Name', 'Start Meter', 'End Meter', 'Total Hour', 'Rate', 'Total Amount', 'Paid Amount', 'Due Amount', 'Remarks', 'Actual Entry Time'],
    [TIPPER_SHEET_NAME]: ['Gadi No', 'Driver Name', 'Date', 'Customer Name', 'Customer Number', 'Material', 'Loading Place', 'Unloading Place', 'CFT/Trip', 'Photo', 'Actual Entry Time'],
    [DIESEL_SHEET_NAME]: ['Vehicle No', 'Date', 'Diesel (Ltr)', 'Cost', 'Petrol Pump Name', 'Meter Reading', 'Paid By', 'Remarks', 'Actual Entry Time'],
    [EXPENSE_SHEET_NAME]: ['Date', 'Expense Mode', 'Expenses Description', 'Amount', 'Remark', 'Time', 'Actual Entry Time']
  };

  const expected = headersMap[sheetName];
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(expected);
    return sheet;
  }
  
  const current = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1).getValues()[0];
  expected.forEach(h => {
    if (current.indexOf(h) === -1) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(h);
    }
  });
  return sheet;
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'getLatestVersion') return JSON_RES({ success: true, version: LATEST_VERSION, downloadUrl: DOWNLOAD_URL });
    
    if (action === 'login') {
      const pass = e.parameter.password;
      if (pass === ADMIN_PASSWORD) return JSON_RES({ success: true, role: 'admin' });
      if (pass === STAFF_PASSWORD) return JSON_RES({ success: true, role: 'staff' });
      return JSON_RES({ success: false, error: 'Auth failed' });
    }
    
    if (['getJCB', 'getTipper', 'getDiesel', 'getExpense'].includes(action)) {
      const maps = { 'getJCB': JCB_SHEET_NAME, 'getTipper': TIPPER_SHEET_NAME, 'getDiesel': DIESEL_SHEET_NAME, 'getExpense': EXPENSE_SHEET_NAME };
      return fetchEntries(maps[action]);
    }

    if (action === 'getStats') return getQuickStats();
    return JSON_RES({ success: false, error: 'Invalid action' });
  } catch (err) { return JSON_RES({ success: false, error: err.toString() }); }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const data = body.data;

    if (action === 'addJCB') return addEntry(JCB_SHEET_NAME, data);
    if (action === 'addTipper') return addEntry(TIPPER_SHEET_NAME, data);
    if (action === 'addDiesel') return addEntry(DIESEL_SHEET_NAME, data);
    if (action === 'addExpense') return addEntry(EXPENSE_SHEET_NAME, data);
    if (action === 'updateEntry') return updateEntry(data);

    return JSON_RES({ success: false, error: 'Invalid POST action' });
  } catch (err) { return JSON_RES({ success: false, error: err.toString() }); }
}

function addEntry(sheetName, data) {
  const sheet = checkAndFixHeaders(sheetName);
  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  let row = [];

  if (sheetName === JCB_SHEET_NAME) {
    row = [data.date, data.partyName, data.siteName, data.startMeter, data.endMeter, data.totalHour, data.rate, data.totalAmount, data.paidAmount, data.dueAmount, data.remarks, now];
  } else if (sheetName === TIPPER_SHEET_NAME) {
    row = [data.gadiNo, data.driverName, data.date, data.customerName, data.customerNumber, data.material, data.loadingPlace, data.unloadingPlace, data.cftTrip, data.photo, now];
  } else if (sheetName === DIESEL_SHEET_NAME) {
    row = [data.vehicleNo || data.gadiNo, data.date, data.dieselLtr, data.dieselCost, data.petrolPumpName, data.meterReading, data.paidBy, data.remarks, now];
  } else if (sheetName === EXPENSE_SHEET_NAME) {
    row = [data.date, data.expenseMode, data.expensesDescription || data.description, data.amount, data.remark, new Date().toISOString(), now];
  }

  sheet.appendRow(row);
  return JSON_RES({ success: true, actualEntryTime: now });
}

function updateEntry(data) {
  const sheet = checkAndFixHeaders(data.sheetName);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const timeIdx = headers.indexOf('Actual Entry Time');

  for (let i = 1; i < values.length; i++) {
    if (values[i][timeIdx] === data.originalEntryTime) {
      let row = [];
      if (data.sheetName === JCB_SHEET_NAME) {
        row = [data.date, data.partyName, data.siteName, data.startMeter, data.endMeter, data.totalHour, data.rate, data.totalAmount, data.paidAmount, data.dueAmount, data.remarks, data.originalEntryTime];
      } else if (data.sheetName === TIPPER_SHEET_NAME) {
        row = [data.gadiNo, data.driverName, data.date, data.customerName, data.customerNumber, data.material, data.loadingPlace, data.unloadingPlace, data.cftTrip, data.photo, data.originalEntryTime];
      }
      sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
      return JSON_RES({ success: true });
    }
  }
  return JSON_RES({ success: false, error: 'Original record not found' });
}

function fetchEntries(sheetName) {
  const sheet = checkAndFixHeaders(sheetName);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return JSON_RES({ success: true, data: [] });
  
  const headers = data[0];
  const entries = data.slice(1).map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[toCamelCase(h)] = row[i]);
    return obj;
  });
  return JSON_RES({ success: true, data: entries.reverse() }); // Newest first
}

function getQuickStats() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let jcbCount = 0, tipperCount = 0, totalDue = 0;
  
  const js = ss.getSheetByName(JCB_SHEET_NAME);
  if (js) { 
    const d = js.getDataRange().getValues(); jcbCount = Math.max(0, d.length - 1);
    const dueIdx = d[0].indexOf('Due Amount');
    for(let i=1; i<d.length; i++) totalDue += parseFloat(d[i][dueIdx]) || 0;
  }
  
  const ts = ss.getSheetByName(TIPPER_SHEET_NAME);
  if (ts) tipperCount = Math.max(0, ts.getDataRange().getValues().length - 1);

  return JSON_RES({ success: true, data: { jcbCount, tipperCount, totalDue } });
}

function toCamelCase(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (w, i) => i === 0 ? w.toLowerCase() : w.toUpperCase()).replace(/\s+/g, '').replace(/[()]/g, '');
}
