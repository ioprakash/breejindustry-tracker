// Google Apps Script Backend for Brij Industry Tracker (v1.7.5 Stable - With Location Tracking)

const SPREADSHEET_ID = '1zdVFPZCTOmUR-FdYANyyjOHnGSu-1-ORXuPB705NdRg';
const JCB_SHEET_NAME = 'JCB_Logs';
const TIPPER_SHEET_NAME = 'Tipper_Logs';
const DIESEL_SHEET_NAME = 'Diesel_Logs';
const EXPENSE_SHEET_NAME = 'Daily_Expenses';
const ATTENDANCE_SHEET_NAME = 'Attendance_Logs';
const EMPLOYEES_SHEET_NAME = 'Employees_List';

const LATEST_VERSION = '1.7.9';
const DOWNLOAD_URL = 'https://raw.githubusercontent.com/ioprakash/breejindustry-tracker/refs/heads/main/brij-industry-tracker-v1.7.9.apk';

// Role-based Passwords
const ADMIN_PASSWORD = "667";

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
    [EXPENSE_SHEET_NAME]: ['Date', 'Expense Mode', 'Expenses Description', 'Amount', 'Remark', 'Time', 'Entered By', 'Actual Entry Time'],
    [ATTENDANCE_SHEET_NAME]: ['Date', 'Employee Name', 'Type', 'Time', 'Location Link', 'Status', 'Approved By', 'Actual Entry Time'],
    [EMPLOYEES_SHEET_NAME]: ['Name', 'Password']
  };

  const expected = headersMap[sheetName];
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(expected);
    
    // Initial employees if Employees sheet is new
    if (sheetName === EMPLOYEES_SHEET_NAME) {
      const initialEmployees = [
        ['Pramod', '101'],
        ['Bidayasagar', '102'],
        ['Sandeep', '103'],
        ['Crusher mistry', '104']
      ];
      initialEmployees.forEach(emp => sheet.appendRow(emp));
    }
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
      
      const empSheet = checkAndFixHeaders(EMPLOYEES_SHEET_NAME);
      const employees = empSheet.getDataRange().getValues();
      for (let i = 1; i < employees.length; i++) {
        if (employees[i][1].toString() === pass) {
          return JSON_RES({ success: true, role: 'staff', name: employees[i][0] });
        }
      }
      return JSON_RES({ success: false, error: 'Invalid password' });
    }
    
    if (['getJCB', 'getTipper', 'getDiesel', 'getExpense', 'getAttendance'].includes(action)) {
      const maps = { 
        'getJCB': JCB_SHEET_NAME, 
        'getTipper': TIPPER_SHEET_NAME, 
        'getDiesel': DIESEL_SHEET_NAME, 
        'getExpense': EXPENSE_SHEET_NAME,
        'getAttendance': ATTENDANCE_SHEET_NAME
      };
      return fetchEntries(maps[action], role, userName);
    }

    if (action === 'getEmployees' && role === 'admin') {
      const sheet = checkAndFixHeaders(EMPLOYEES_SHEET_NAME);
      const data = sheet.getDataRange().getValues();
      const employees = data.slice(1).map(r => ({ name: r[0], password: r[1] }));
      return JSON_RES({ success: true, data: employees });
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
    if (action === 'addAttendance') return addEntry(ATTENDANCE_SHEET_NAME, data);
    if (action === 'updateEntry') return updateEntry(data);
    
    if (action === 'addEmployee') {
      const sheet = checkAndFixHeaders(EMPLOYEES_SHEET_NAME);
      sheet.appendRow([data.name, data.password]);
      return JSON_RES({ success: true });
    }

    if (action === 'approveAttendance') {
      const sheet = checkAndFixHeaders(ATTENDANCE_SHEET_NAME);
      const values = sheet.getDataRange().getValues();
      const headers = values[0];
      const timeIdx = headers.indexOf('Actual Entry Time');
      
      for (let i = 1; i < values.length; i++) {
        if (values[i][timeIdx] === data.actualEntryTime) {
          sheet.getRange(i + 1, headers.indexOf('Status') + 1).setValue('Approved');
          sheet.getRange(i + 1, headers.indexOf('Approved By') + 1).setValue(data.adminName);
          return JSON_RES({ success: true });
        }
      }
      return JSON_RES({ success: false, error: 'Attendance record not found' });
    }

    return JSON_RES({ success: false, error: 'Invalid POST action' });
  } catch (err) { return JSON_RES({ success: false, error: err.toString() }); }
}

function addEntry(sheetName, data) {
  const sheet = checkAndFixHeaders(sheetName);
  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const entryTime = data.address ? data.address + " (" + now + ")" : now;
  const entryBy = data.enteredBy || 'Unknown';
  let row = [];

  if (sheetName === JCB_SHEET_NAME) {
    row = [data.date, data.gadiNo, data.driverName, data.customerName || data.partyName || '', data.customerNumber || '', data.runMode || '', data.workDetail || '', data.startMtr || '', data.stopMtr || '', data.totalHour || data.tipCount || '0', data.startMtrDay || '', data.stopMtrDay || '', data.rate, data.totalAmount, data.receivedAmount || data.paidAmount || '0', data.dueAmount || '0', data.locationLink || '', entryBy, entryTime];
  } else if (sheetName === TIPPER_SHEET_NAME) {
    row = [data.date, data.gadiNo, data.driverName, data.customerName || '', data.customerNumber || '', data.material || '', data.loadingPlace || '', data.unloadingPlace || '', data.cftTrip || '', data.photo || '', data.locationLink || '', entryBy, entryTime];
  } else if (sheetName === DIESEL_SHEET_NAME) {
    row = [data.date, data.gadiNo || data.vehicleNo || '', data.dieselLtr || '0', data.dieselCost || '0', data.petrolPumpName || '', data.dieselMtr || data.meterReading || '', data.dieselPaidBy || data.paidBy || '', data.remarks || '', data.locationLink || '', entryBy, entryTime];
  } else if (sheetName === EXPENSE_SHEET_NAME) {
    row = [data.date, data.expenseMode, data.expensesDescription || data.description || '', data.amount, data.remark || '', new Date().toISOString(), entryBy, entryTime];
  } else if (sheetName === ATTENDANCE_SHEET_NAME) {
    row = [data.date, data.employeeName, data.type, data.time, data.locationLink || '', 'Pending', '', entryTime];
  }

  sheet.appendRow(row);
  return JSON_RES({ success: true, actualEntryTime: entryTime });
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
  const empIdx = headers.indexOf('Employee Name');
  
  let entries = data.slice(1).map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[toCamelCase(h)] = row[i]);
    return obj;
  });

  if (role === 'staff') {
    if (sheetName === ATTENDANCE_SHEET_NAME && empIdx !== -1) {
      entries = entries.filter(e => e.employeeName === userName);
    } else if (userIdx !== -1) {
      entries = entries.filter(e => e.enteredBy === userName);
    }
  }
  return JSON_RES({ success: true, data: entries.reverse() });
}

function getQuickStats(role, userName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let jcbCount = 0, tipperCount = 0, todayJcb = 0, todayTipper = 0, totalDue = 0;
  const now = new Date();
  const todayStr = Utilities.formatDate(now, "Asia/Kolkata", "yyyy-MM-dd");
  const targetUser = (userName || "").toString().trim();

  const js = ss.getSheetByName(JCB_SHEET_NAME);
  if (js) { 
    const d = js.getDataRange().getValues(); 
    const headers = d[0];
    const userIdx = headers.indexOf('Entered By');
    const dueIdx = headers.indexOf('Due Amount');
    const dateIdx = headers.indexOf('Date');
    
    for(let i=1; i<d.length; i++) {
      const rowUser = (d[i][userIdx] || "").toString().trim();
      const rowDate = d[i][dateIdx] ? Utilities.formatDate(new Date(d[i][dateIdx]), "Asia/Kolkata", "yyyy-MM-dd") : "";
      
      if (role === 'admin' || rowUser === targetUser) {
        jcbCount++;
        totalDue += parseFloat(d[i][dueIdx]) || 0;
        if (rowDate === todayStr) todayJcb++;
      }
    }
  }

  const ts = ss.getSheetByName(TIPPER_SHEET_NAME);
  if (ts) {
    const d = ts.getDataRange().getValues();
    const headers = d[0];
    const userIdx = headers.indexOf('Entered By');
    const dateIdx = headers.indexOf('Date');

    for(let i=1; i<d.length; i++) {
      const rowUser = (d[i][userIdx] || "").toString().trim();
      const rowDate = d[i][dateIdx] ? Utilities.formatDate(new Date(d[i][dateIdx]), "Asia/Kolkata", "yyyy-MM-dd") : "";

      if (role === 'admin' || rowUser === targetUser) {
        tipperCount++;
        if (rowDate === todayStr) todayTipper++;
      }
    }
  }
  return JSON_RES({ 
    success: true, 
    data: { jcbCount, tipperCount, todayJcb, todayTipper, totalDue } 
  });
}

function toCamelCase(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (w, i) => i === 0 ? w.toLowerCase() : w.toUpperCase()).replace(/\s+/g, '').replace(/[()]/g, '');
}
