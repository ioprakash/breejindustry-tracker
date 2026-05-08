// Google Apps Script Backend for Brij Industry Tracker (v1.7.5 Stable - With Location Tracking)

const SPREADSHEET_ID = '1zdVFPZCTOmUR-FdYANyyjOHnGSu-1-ORXuPB705NdRg';
const JCB_SHEET_NAME = 'JCB_Logs';
const TIPPER_SHEET_NAME = 'Tipper_Logs';
const DIESEL_SHEET_NAME = 'Diesel_Logs';
const EXPENSE_SHEET_NAME = 'Daily_Expenses';
const ATTENDANCE_SHEET_NAME = 'Attendance_Logs';
const EMPLOYEES_SHEET_NAME = 'Employees_List';
const LEDGER_PARTIES_SHEET_NAME = 'Ledger_Parties';
const LEDGER_ENTRIES_SHEET_NAME = 'Ledger_Entries';

const LATEST_VERSION = '1.8.4';
const DOWNLOAD_URL = 'https://raw.githubusercontent.com/ioprakash/breejindustry-tracker/refs/heads/main/brij-industry-tracker-v1.8.4.apk';

// Role-based Passwords
const ADMIN_PASSWORD = "667";
 
function JSON_RES(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function checkAndFixHeaders(sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(sheetName);
  
  const headersMap = {
    [JCB_SHEET_NAME]: ['Date', 'Gadi No', 'Driver Name', 'Customer/Party Name', 'Phone', 'Run Mode', 'Work Detail', 'Start Mtr', 'Stop Mtr', 'Total Hour/Count', 'Total Work Run', 'Day Start Mtr', 'Day Stop Mtr', 'Total Day Run', 'Rate', 'Total Amount', 'Received Amount', 'Payment Received By', 'Due Amount', 'Photo', 'Location Link', 'Entered By', 'Actual Entry Time'],
    [TIPPER_SHEET_NAME]: ['Date', 'Gadi No', 'Driver Name', 'Customer Name', 'Customer Phone', 'Material', 'Loading Place', 'Unloading Place', 'CFT/Trip', 'Photo', 'Location Link', 'Entered By', 'Actual Entry Time'],
    [DIESEL_SHEET_NAME]: ['Date', 'Vehicle No', 'Vehicle Type', 'Diesel (Ltr)', 'Cost', 'Petrol Pump Name', 'Meter Reading', 'Paid By', 'Remarks', 'Photo', 'Location Link', 'Entered By', 'Actual Entry Time'],
    [EXPENSE_SHEET_NAME]: ['Date', 'Expense Mode', 'Expenses Description', 'Amount', 'Remark', 'Time', 'Entered By', 'Actual Entry Time'],
    [ATTENDANCE_SHEET_NAME]: ['Date', 'Employee Name', 'Work Description', 'Type', 'Time', 'Location Link', 'Status', 'Approved By', 'Actual Entry Time'],
    [EMPLOYEES_SHEET_NAME]: ['Name', 'Password'],
    [LEDGER_PARTIES_SHEET_NAME]: ['Party Name'],
    [LEDGER_ENTRIES_SHEET_NAME]: ['Date', 'Party Name', 'Type', 'Amount', 'Description', 'Remark', 'Photo', 'Entered By', 'Actual Entry Time']
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

    // Ledger GET actions
    if (action === 'getLedgerParties') {
      const sheet = checkAndFixHeaders(LEDGER_PARTIES_SHEET_NAME);
      const data = sheet.getDataRange().getValues();
      const parties = data.slice(1).map(r => r[0]).filter(n => n);
      return JSON_RES({ success: true, data: parties });
    }

    if (action === 'getLedgerEntries') {
      const partyName = e.parameter.partyName;
      const sheet = checkAndFixHeaders(LEDGER_ENTRIES_SHEET_NAME);
      const data = sheet.getDataRange().getValues();
      if (data.length <= 1) return JSON_RES({ success: true, data: [] });
      const headers = data[0];
      const partyIdx = headers.indexOf('Party Name');
      let entries = data.slice(1)
        .filter(row => row[partyIdx] === partyName)
        .map(row => {
          let obj = {};
          headers.forEach((h, i) => obj[toCamelCase(h)] = row[i]);
          return obj;
        });
      return JSON_RES({ success: true, data: entries });
    }

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

    // Ledger POST actions
    if (action === 'addLedgerParty') {
      const sheet = checkAndFixHeaders(LEDGER_PARTIES_SHEET_NAME);
      const existing = sheet.getDataRange().getValues().slice(1).map(r => r[0]);
      if (existing.includes(data.partyName)) {
        return JSON_RES({ success: false, error: 'Party already exists' });
      }
      sheet.appendRow([data.partyName]);
      return JSON_RES({ success: true });
    }

    if (action === 'addLedger') {
      const sheet = checkAndFixHeaders(LEDGER_ENTRIES_SHEET_NAME);
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      const entryBy = data.enteredBy || 'Unknown';
      var photoUrl = data.photoLink || '';
      if (data.photoBase64 && data.photoBase64.length > 0) {
        photoUrl = uploadPhotoToDrive(data.photoBase64, 'Ledger_' + data.partyName + '_' + now.replace(/[\/:]/g, '-'));
      }
      var valueMap = {
        'Date': data.date, 'Party Name': data.partyName,
        'Type': data.type || 'DR', 'Amount': data.amount || '0',
        'Description': data.description || '', 'Remark': data.remark || '',
        'Photo': photoUrl, 'Entered By': entryBy, 'Actual Entry Time': now
      };
      var row = headers.map(function(h) { return valueMap[h] !== undefined ? valueMap[h] : ''; });
      sheet.appendRow(row);
      return JSON_RES({ success: true, actualEntryTime: now });
    }

    if (action === 'updateLedgerEntry') {
      const sheet = checkAndFixHeaders(LEDGER_ENTRIES_SHEET_NAME);
      const values = sheet.getDataRange().getValues();
      const headers = values[0];
      const timeIdx = headers.indexOf('Actual Entry Time');
      const photoIdx = headers.indexOf('Photo');
      
      for (let i = 1; i < values.length; i++) {
        if (values[i][timeIdx] === data.originalEntryTime) {
          var photoUrl = (photoIdx !== -1 ? values[i][photoIdx] : '') || '';
          if (data.photoBase64 && data.photoBase64.length > 0) {
            photoUrl = uploadPhotoToDrive(data.photoBase64, 'Ledger_' + data.partyName + '_' + data.originalEntryTime.replace(/[\/:]/g, '-'));
          } else if (data.photoLink !== undefined) {
            photoUrl = data.photoLink || '';
          }
          var valueMap = {
            'Date': data.date, 'Party Name': data.partyName,
            'Type': data.type || 'DR', 'Amount': data.amount || '0',
            'Description': data.description || '', 'Remark': data.remark || '',
            'Photo': photoUrl,
            'Entered By': data.userName || values[i][headers.indexOf('Entered By')],
            'Actual Entry Time': data.originalEntryTime
          };
          var row = headers.map(function(h) { return valueMap[h] !== undefined ? valueMap[h] : ''; });
          sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
          return JSON_RES({ success: true });
        }
      }
      return JSON_RES({ success: false, error: 'Ledger entry not found' });
    }

    return JSON_RES({ success: false, error: 'Invalid POST action' });
  } catch (err) { return JSON_RES({ success: false, error: err.toString() }); }
}

function addEntry(sheetName, data) {
  const sheet = checkAndFixHeaders(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const entryTime = data.address ? data.address + " (" + now + ")" : now;
  const entryBy = data.enteredBy || 'Unknown';

  // Upload photo to Google Drive if base64 data is present
  var photoUrl = '';
  if (data.photoBase64 && data.photoBase64.length > 0) {
    photoUrl = uploadPhotoToDrive(data.photoBase64, sheetName + '_' + (data.gadiNo || data.vehicleNo || '') + '_' + now.replace(/[\/:]/g, '-'));
  }

  // Build value map based on sheet type
  var valueMap = {};
  if (sheetName === JCB_SHEET_NAME) {
    valueMap = {
      'Date': data.date, 'Gadi No': data.gadiNo, 'Driver Name': data.driverName,
      'Customer/Party Name': data.customerName || data.partyName || '', 'Phone': data.customerNumber || '',
      'Run Mode': data.runMode || '', 'Work Detail': data.workDetail || '',
      'Start Mtr': data.startMtr || '', 'Stop Mtr': data.stopMtr || '',
      'Total Hour/Count': data.totalHour || data.tipCount || '0',
      'Total Work Run': data.totalWorkRun || '0',
      'Day Start Mtr': data.startMtrDay || '', 'Day Stop Mtr': data.stopMtrDay || '',
      'Total Day Run': data.totalDayRun || '0',
      'Rate': data.rate, 'Total Amount': data.totalAmount,
      'Received Amount': data.receivedAmount || data.paidAmount || '0',
      'Payment Received By': data.paymentReceivedBy || '',
      'Due Amount': data.dueAmount || '0', 'Photo': photoUrl,
      'Location Link': data.locationLink || '', 'Entered By': entryBy, 'Actual Entry Time': entryTime
    };
  } else if (sheetName === TIPPER_SHEET_NAME) {
    valueMap = {
      'Date': data.date, 'Gadi No': data.gadiNo, 'Driver Name': data.driverName,
      'Customer Name': data.customerName || '', 'Customer Phone': data.customerNumber || '',
      'Material': data.material || '', 'Loading Place': data.loadingPlace || '',
      'Unloading Place': data.unloadingPlace || '', 'CFT/Trip': data.cftTrip || '',
      'Photo': photoUrl, 'Location Link': data.locationLink || '',
      'Entered By': entryBy, 'Actual Entry Time': entryTime
    };
  } else if (sheetName === DIESEL_SHEET_NAME) {
    valueMap = {
      'Date': data.date, 'Vehicle No': data.gadiNo || data.vehicleNo || '',
      'Vehicle Type': data.vehicleType || '',
      'Diesel (Ltr)': data.dieselLtr || '0', 'Cost': data.dieselCost || '0',
      'Petrol Pump Name': data.petrolPumpName || '',
      'Meter Reading': data.dieselMtr || data.meterReading || '',
      'Paid By': data.dieselPaidBy || data.paidBy || '', 'Remarks': data.remarks || '',
      'Photo': photoUrl, 'Location Link': data.locationLink || '',
      'Entered By': entryBy, 'Actual Entry Time': entryTime
    };
  } else if (sheetName === EXPENSE_SHEET_NAME) {
    valueMap = {
      'Date': data.date, 'Expense Mode': data.expenseMode,
      'Expenses Description': data.expensesDescription || data.description || '',
      'Amount': data.amount, 'Remark': data.remark || '',
      'Time': new Date().toISOString(), 'Entered By': entryBy, 'Actual Entry Time': entryTime
    };
  } else if (sheetName === ATTENDANCE_SHEET_NAME) {
    valueMap = {
      'Date': data.date, 'Employee Name': data.employeeName,
      'Work Description': data.workDescription || '',
      'Type': data.type,
      'Time': data.time, 'Location Link': data.locationLink || '',
      'Status': 'Pending', 'Approved By': '', 'Actual Entry Time': entryTime
    };
  }

  // Build row based on actual header order in the sheet
  var row = headers.map(function(h) { return valueMap[h] !== undefined ? valueMap[h] : ''; });
  sheet.appendRow(row);
  return JSON_RES({ success: true, actualEntryTime: entryTime });
}

function updateEntry(data) {
  const sheet = checkAndFixHeaders(data.sheetName);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const timeIdx = headers.indexOf('Actual Entry Time');
  const userIdx = headers.indexOf('Entered By');
  const photoIdx = headers.indexOf('Photo');

  for (let i = 1; i < values.length; i++) {
    if (values[i][timeIdx] === data.originalEntryTime) {
      if (data.userRole === 'staff' && values[i][userIdx] !== data.userName) {
          return JSON_RES({ success: false, error: 'Authorization failed' });
      }

      // Handle photo upload
      var photoUrl = (photoIdx !== -1 ? values[i][photoIdx] : '') || '';
      if (data.photoBase64 && data.photoBase64.length > 0) {
        photoUrl = uploadPhotoToDrive(data.photoBase64, data.sheetName + '_' + (data.gadiNo || '') + '_' + data.originalEntryTime.replace(/[\/:]/g, '-'));
      }

      // Build value map based on sheet type
      var valueMap = {};
      if (data.sheetName === JCB_SHEET_NAME) {
        valueMap = {
          'Date': data.date, 'Gadi No': data.gadiNo, 'Driver Name': data.driverName,
          'Customer/Party Name': data.customerName || data.partyName || '', 'Phone': data.customerNumber || '',
          'Run Mode': data.runMode || '', 'Work Detail': data.workDetail || '',
          'Start Mtr': data.startMtr || '', 'Stop Mtr': data.stopMtr || '',
          'Total Hour/Count': data.totalHour || data.tipCount || '0',
          'Total Work Run': data.totalWorkRun || '0',
          'Day Start Mtr': data.startMtrDay || '', 'Day Stop Mtr': data.stopMtrDay || '',
          'Total Day Run': data.totalDayRun || '0',
          'Rate': data.rate, 'Total Amount': data.totalAmount,
          'Received Amount': data.receivedAmount || data.paidAmount || '0',
          'Payment Received By': data.paymentReceivedBy || '',
          'Due Amount': data.dueAmount || '0', 'Photo': photoUrl,
          'Location Link': data.locationLink || '', 'Entered By': data.userName,
          'Actual Entry Time': data.originalEntryTime
        };
      } else if (data.sheetName === TIPPER_SHEET_NAME) {
        valueMap = {
          'Date': data.date, 'Gadi No': data.gadiNo, 'Driver Name': data.driverName,
          'Customer Name': data.customerName || '', 'Customer Phone': data.customerNumber || '',
          'Material': data.material || '', 'Loading Place': data.loadingPlace || '',
          'Unloading Place': data.unloadingPlace || '', 'CFT/Trip': data.cftTrip || '',
          'Photo': photoUrl, 'Location Link': data.locationLink || '',
          'Entered By': data.userName, 'Actual Entry Time': data.originalEntryTime
        };
      } else if (data.sheetName === DIESEL_SHEET_NAME) {
        valueMap = {
          'Date': data.date, 'Vehicle No': data.gadiNo || data.vehicleNo || '',
          'Vehicle Type': data.vehicleType || '',
          'Diesel (Ltr)': data.dieselLtr || '0', 'Cost': data.dieselCost || '0',
          'Petrol Pump Name': data.petrolPumpName || '',
          'Meter Reading': data.dieselMtr || data.meterReading || '',
          'Paid By': data.dieselPaidBy || data.paidBy || '', 'Remarks': data.remarks || '',
          'Photo': photoUrl, 'Location Link': data.locationLink || '',
          'Entered By': data.userName, 'Actual Entry Time': data.originalEntryTime
        };
      }

      // Build row based on actual header order
      var row = headers.map(function(h) { return valueMap[h] !== undefined ? valueMap[h] : ''; });
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

function uploadPhotoToDrive(base64Data, fileName) {
  try {
    var base64Content = base64Data.replace(/^data:image\/\w+;base64,/, '');
    var decoded = Utilities.base64Decode(base64Content);
    var blob = Utilities.newBlob(decoded, 'image/jpeg', fileName + '.jpg');
    
    var folders = DriveApp.getFoldersByName('BrijIndustryPhotos');
    var folder;
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder('BrijIndustryPhotos');
    }
    
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return 'https://drive.google.com/file/d/' + file.getId() + '/view';
  } catch (e) {
    Logger.log('Photo upload error: ' + e.toString());
    return '';
  }
}
