// Google Apps Script Backend for Brij Industry Tracker
// This script should be deployed as a Web App

// IMPORTANT: Update these with your Google Sheet ID
const SPREADSHEET_ID = '1zdVFPZCTOmUR-FdYANyyjOHnGSu-1-ORXuPB705NdRg';
const JCB_SHEET_NAME = 'JCB_Logs';
const TIPPER_SHEET_NAME = 'Tipper_Logs';
const DIESEL_SHEET_NAME = 'Diesel_Logs';

// Current App Version for the Updater
const LATEST_VERSION = "1.5.0";
const DOWNLOAD_URL = "https://github.com/ioprakash/breejindustry-tracker/blob/main/brij-industry-tracker-v1.5.0.apk?raw=true";

// Handle GET requests (fetch data)
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    // In-App Update Check
    if (action === 'getLatestVersion') {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        version: LATEST_VERSION,
        downloadUrl: DOWNLOAD_URL,
        notes: "UI refresh with premium design, customer name & number tracking in JCB/Tipper forms."
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'getJCB') {
      return getJCBEntries();
    } else if (action === 'getTipper') {
      return getTipperEntries();
    } else if (action === 'getDiesel') {
      return getDieselEntries();
    } else if (action === 'getStats') {
      return getQuickStats();
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: 'Invalid action' })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle POST requests (submit data)
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'addJCB') {
      return addJCBEntry(data.data);
    } else if (action === 'addTipper') {
      return addTipperEntry(data.data);
    } else if (action === 'addDiesel') {
      return addDieselEntry(data.data);
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: 'Invalid action' })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Add Diesel Entry
function addDieselEntry(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(DIESEL_SHEET_NAME);
    
    if (!sheet) {
      const newSheet = ss.insertSheet(DIESEL_SHEET_NAME);
      newSheet.appendRow([
        'Vehicle No', 'Date', 'Diesel (Ltr)', 'Cost', 'Meter Reading', 
        'Paid By', 'Remarks', 'Receipt Photo', 'Timestamp'
      ]);
      return addDieselEntry(data);
    }
    
    sheet.appendRow([
      data.vehicleNo,
      data.date,
      data.dieselLtr,
      data.dieselCost,
      data.meterReading,
      data.paidBy,
      data.remarks || '',
      data.receiptPhoto || '',
      new Date().toISOString()
    ]);
    
    return ContentService.createTextOutput(
      JSON.stringify({ success: true })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Add JCB Entry
function addJCBEntry(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(JCB_SHEET_NAME);
    
    if (!sheet) {
      const newSheet = ss.insertSheet(JCB_SHEET_NAME);
      newSheet.appendRow([
        'Gadi No', 'Date', 'Driver Name', 'Customer Name', 'Customer Number',
        'Start Mtr Day', 'Stop Mtr Day',
        'Work Detail', 'Run Mode', 'Start Mtr', 'Stop Mtr', 'Tip Count',
        'Rate', 'Total Amount', 'Received Amount', 'Due Amount', 'Timestamp'
      ]);
      return addJCBEntry(data);
    }
    
    sheet.appendRow([
      data.gadiNo,
      data.date,
      data.driverName,
      data.customerName || '',
      data.customerNumber || '',
      data.startMtrDay || '',
      data.stopMtrDay || '',
      data.workDetail || '',
      data.runMode || '',
      data.startMtr || '',
      data.stopMtr || '',
      data.tipCount || 0,
      data.rate,
      data.totalAmount,
      data.receivedAmount || 0,
      data.dueAmount || 0,
      new Date().toISOString()
    ]);
    
    return ContentService.createTextOutput(
      JSON.stringify({ success: true })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Add Tipper Entry
function addTipperEntry(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(TIPPER_SHEET_NAME);
    
    if (!sheet) {
      const newSheet = ss.insertSheet(TIPPER_SHEET_NAME);
      newSheet.appendRow([
        'Gadi No', 'Driver Name', 'Date', 'Customer Name', 'Customer Number',
        'Material', 'Loading Place',
        'Unloading Place', 'CFT/Trip', 'Diesel Photo', 'Timestamp'
      ]);
      return addTipperEntry(data);
    }
    
    sheet.appendRow([
      data.gadiNo,
      data.driverName,
      data.date,
      data.customerName || '',
      data.customerNumber || '',
      data.material,
      data.loadingPlace || '',
      data.unloadingPlace || '',
      data.cftTrip || '',
      data.dieselPhoto || '',
      new Date().toISOString()
    ]);
    
    return ContentService.createTextOutput(
      JSON.stringify({ success: true })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Get Diesel Entries
function getDieselEntries() {
  return fetchEntries(DIESEL_SHEET_NAME);
}

// Get JCB Entries
function getJCBEntries() {
  return fetchEntries(JCB_SHEET_NAME);
}

// Get Tipper Entries
function getTipperEntries() {
  return fetchEntries(TIPPER_SHEET_NAME);
}

// Generic Fetch Function
function fetchEntries(sheetName) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return ContentService.createTextOutput(
        JSON.stringify({ success: true, data: [] })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return ContentService.createTextOutput(JSON.stringify({ success: true, data: [] })).setMimeType(ContentService.MimeType.JSON);
    
    const headers = data[0];
    const rows = data.slice(1);
    
    const entries = rows.map(row => {
      const entry = {};
      headers.forEach((header, index) => {
        entry[toCamelCase(header)] = row[index];
      });
      return entry;
    });
    
    return ContentService.createTextOutput(
      JSON.stringify({ success: true, data: entries })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Get Quick Stats
function getQuickStats() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    let jcbCount = 0;
    let tipperCount = 0;
    let totalDue = 0;
    
    const jcbSheet = ss.getSheetByName(JCB_SHEET_NAME);
    if (jcbSheet) {
      const jcbData = jcbSheet.getDataRange().getValues();
      jcbCount = Math.max(0, jcbData.length - 1);
      for (let i = 1; i < jcbData.length; i++) {
        totalDue += parseFloat(jcbData[i][13]) || 0;
      }
    }
    
    const tipperSheet = ss.getSheetByName(TIPPER_SHEET_NAME);
    if (tipperSheet) {
      const tipperData = tipperSheet.getDataRange().getValues();
      tipperCount = Math.max(0, tipperData.length - 1);
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        data: {
          jcbCount: jcbCount,
          tipperCount: tipperCount,
          totalDue: totalDue
        }
      })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Helper: convert header to camelCase
function toCamelCase(str) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '')
    .replace(/[()]/g, '');
}
