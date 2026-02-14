// Google Apps Script Backend for Brij Industry Tracker (v1.7.5 Stable - With Location Tracking)

const SPREADSHEET_ID = '1zdVFPZCTOmUR-FdYANyyjOHnGSu-1-ORXuPB705NdRg';
const JCB_SHEET_NAME = 'JCB_Logs';
const TIPPER_SHEET_NAME = 'Tipper_Logs';
const DIESEL_SHEET_NAME = 'Diesel_Logs';
const EXPENSE_SHEET_NAME = 'Daily_Expenses';

const LATEST_VERSION = '1.7.7';
const DOWNLOAD_URL = 'https://raw.githubusercontent.com/ioprakash/breejindustry-tracker/refs/heads/main/brij-industry-tracker-v1.7.7.apk';

// Role-based Passwords
const ADMIN_PASSWORD = "667";
const EMPLOYEE_PASSWORDS = {
  "101": "Employee 1",
  "102": "Employee 2",
  "103": "Employee 3",
  "104": "Employee 4",
  "105": "Employee 5"
};

function JSON_RES(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function checkAndFixHeaders(sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(sheetName);
  
  const headersMap = {
    [JCB_SHEET_NAME]: ['Date', 'Gadi No', 'Driver Name', 'Customer/Party Name', 'Phone', 'Run Mode', 'Work Detail', 'Start Mtr', 'Stop Mtr', 'Total Hour/Count', 'Day Start Mtr', 'Day Stop Mtr', 'Rate', 'Total Amount', 'Received Amount', 'Due Amount', 'Location Link', 'Entered By', 'Actual Entry Time'],
    [TIPPER_SHEET_NAME]: ['Date', 'Gadi No', 'Driver Name', 'Customer Name', 'Customer Phone', 'Material', 'Loading Place', 'Unloading Place', 'CFT/Trip', 'Photo', 'Location Link', 'Entered By', 'Actual Entry Time'],
    [DIESEL_SHEET_NAME]: ['Date', 'Vehicle No', 'Diesel (Ltr)', 'Cost', 'Petrol Pump Name', 'Meter Reading', 'Paid By', 'Remarks', 'Location Link', 'Entered By', 'Actual Entry Time'],
    [EXPENSE_SHEET_NAME]: ['Date', 'Expense Mode', 'Expenses Description', 'Amount', 'Remark', 'Time', 'Entered By', 'Actual Entry Time']
  };

  const expected = headersMap[sheetName];
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(expected);
    return sheet;
  }
  
  const current = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0];
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
    const userName = e.parameter.userName;
    const role = e.parameter.role;
    
    if (action === 'getLatestVersion') return JSON_RES({ success: true, version: LATEST_VERSION, downloadUrl: DOWNLOAD_URL });
    
    if (action === 'login') {
      const pass = e.parameter.password;
      if (pass === ADMIN_PASSWORD) return JSON_RES({ success: true, role: 'admin', name: 'Admin' });
      if (EMPLOYEE_PASSWORDS[pass]) return JSON_RES({ success: true, role: 'staff', name: EMPLOYEE_PASSWORDS[pass] });
      return JSON_RES({ success: false, error: 'Invalid password' });
    }
    
    if (['getJCB', 'getTipper', 'getDiesel', 'getExpense'].includes(action)) {
      const maps = { 'getJCB': JCB_SHEET_NAME, 'getTipper': TIPPER_SHEET_NAME, 'getDiesel': DIESEL_SHEET_NAME, 'getExpense': EXPENSE_SHEET_NAME };
      return fetchEntries(maps[action], role, userName);
    }

    if (action === 'getStats') return getQuickStats(role, userName);
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
  const entryBy = data.enteredBy || 'Unknown';
  let row = [];

  if (sheetName === JCB_SHEET_NAME) {
    row = [data.date, data.gadiNo, data.driverName, data.customerName || data.partyName || '', data.customerNumber || '', data.runMode || '', data.workDetail || '', data.startMtr || '', data.stopMtr || '', data.totalHour || data.tipCount || '0', data.startMtrDay || '', data.stopMtrDay || '', data.rate, data.totalAmount, data.receivedAmount || data.paidAmount || '0', data.dueAmount || '0', data.locationLink || '', entryBy, now];
  } else if (sheetName === TIPPER_SHEET_NAME) {
    row = [data.date, data.gadiNo, data.driverName, data.customerName || '', data.customerNumber || '', data.material || '', data.loadingPlace || '', data.unloadingPlace || '', data.cftTrip || '', data.photo || '', data.locationLink || '', entryBy, now];
  } else if (sheetName === DIESEL_SHEET_NAME) {
    row = [data.date, data.gadiNo || data.vehicleNo || '', data.dieselLtr || '0', data.dieselCost || '0', data.petrolPumpName || '', data.dieselMtr || data.meterReading || '', data.dieselPaidBy || data.paidBy || '', data.remarks || '', data.locationLink || '', entryBy, now];
  } else if (sheetName === EXPENSE_SHEET_NAME) {
    row = [data.date, data.expenseMode, data.expensesDescription || data.description || '', data.amount, data.remark || '', new Date().toISOString(), entryBy, now];
  }

  sheet.appendRow(row);
  return JSON_RES({ success: true, actualEntryTime: now });
}

function updateEntry(data) {
  const sheet = checkAndFixHeaders(data.sheetName);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const timeIdx = headers.indexOf('Actual Entry Time');
  const userIdx = headers.indexOf('Entered By');

  for (let i = 1; i < values.length; i++) {
    if (values[i][timeIdx] === data.originalEntryTime) {
      if (data.userRole === 'staff' && values[i][userIdx] !== data.userName) {
          return JSON_RES({ success: false, error: 'Authorization failed' });
      }

      let row = [];
      if (data.sheetName === JCB_SHEET_NAME) {
        row = [data.date, data.gadiNo, data.driverName, data.customerName || data.partyName || '', data.customerNumber || '', data.runMode || '', data.workDetail || '', data.startMtr || '', data.stopMtr || '', data.totalHour || data.tipCount || '0', data.startMtrDay || '', data.stopMtrDay || '', data.rate, data.totalAmount, data.receivedAmount || data.paidAmount || '0', data.dueAmount || '0', data.locationLink || '', data.userName, data.originalEntryTime];
      } else if (data.sheetName === TIPPER_SHEET_NAME) {
        row = [data.date, data.gadiNo, data.driverName, data.customerName || '', data.customerNumber || '', data.material || '', data.loadingPlace || '', data.unloadingPlace || '', data.cftTrip || '', data.photo || '', data.locationLink || '', data.userName, data.originalEntryTime];
      }
      sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
      return JSON_RES({ success: true });
    }
  }
  return JSON_RES({ success: false, error: 'Record not found' });
}

function fetchEntries(sheetName, role, userName) {
  const sheet = checkAndFixHeaders(sheetName);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return JSON_RES({ success: true, data: [] });
  const headers = data[0];
  const userIdx = headers.indexOf('Entered By');
  let entries = data.slice(1).map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[toCamelCase(h)] = row[i]);
    return obj;
  });
  if (role === 'staff' && userIdx !== -1) entries = entries.filter(e => e.enteredBy === userName);
  return JSON_RES({ success: true, data: entries.reverse() });
}

function getQuickStats(role, userName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let jcbCount = 0, tipperCount = 0, totalDue = 0;
  const js = ss.getSheetByName(JCB_SHEET_NAME);
  if (js) { 
    const d = js.getDataRange().getValues(); 
    const headers = d[0];
    const userIdx = headers.indexOf('Entered By');
    const dueIdx = headers.indexOf('Due Amount');
    for(let i=1; i<d.length; i++) {
      if (role === 'admin' || (userIdx !== -1 && d[i][userIdx] === userName)) {
        jcbCount++;
        totalDue += parseFloat(d[i][dueIdx]) || 0;
      }
    }
  }
  const ts = ss.getSheetByName(TIPPER_SHEET_NAME);
  if (ts) {
    const d = ts.getDataRange().getValues();
    const headers = d[0];
    const userIdx = headers.indexOf('Entered By');
    for(let i=1; i<d.length; i++) {
        if (role === 'admin' || (userIdx !== -1 && d[i][userIdx] === userName)) tipperCount++;
    }
  }
  return JSON_RES({ success: true, data: { jcbCount, tipperCount, totalDue } });
}

function toCamelCase(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (w, i) => i === 0 ? w.toLowerCase() : w.toUpperCase()).replace(/\s+/g, '').replace(/[()]/g, '');
}
