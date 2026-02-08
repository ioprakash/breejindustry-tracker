// Google Apps Script Backend for Brij Industry Tracker
// This script should be deployed as a Web App

// IMPORTANT: Update these with your Google Sheet ID
const SPREADSHEET_ID = '1zdVFPZCTOmUR-FdYANyyjOHnGSu-1-ORXuPB705NdRg';
const JCB_SHEET_NAME = 'JCB_Logs';
const TIPPER_SHEET_NAME = 'Tipper_Logs';

// Handle GET requests (fetch data)
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'getJCB') {
      return getJCBEntries();
    } else if (action === 'getTipper') {
      return getTipperEntries();
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

// Add JCB Entry
function addJCBEntry(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(JCB_SHEET_NAME);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      const newSheet = ss.insertSheet(JCB_SHEET_NAME);
      newSheet.appendRow([
        'Godi No', 'Date', 'Driver Name', 'Start Mtr Day', 'Stop Mtr Day',
        'Work Detail', 'Run Mode', 'Start Mtr', 'Stop Mtr', 'Tip Count',
        'Rate', 'Total Amount', 'Received Amount', 'Due Amount',
        'Diesel (Ltr)', 'Diesel Cost', 'Diesel Mtr', 'Diesel Paid By', 'Timestamp'
      ]);
      return addJCBEntry(data); // Retry after creating sheet
    }
    
    sheet.appendRow([
      data.godiNo,
      data.date,
      data.driverName,
      data.startMtrDay || '',
      data.stopMtrDay || '',
      data.workDetail || '',
      data.runMode || '',
      data.startMtr || '',
      data.stopMtr || '',
      data.tipCount,
      data.rate,
      data.totalAmount,
      data.receivedAmount || 0,
      data.dueAmount || 0,
      data.dieselLtr || '',
      data.dieselCost || '',
      data.dieselMtr || '',
      data.dieselPaidBy || '',
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
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      const newSheet = ss.insertSheet(TIPPER_SHEET_NAME);
      newSheet.appendRow([
        'Gadi No', 'Driver Name', 'Date', 'Material', 'Loading Place',
        'Unloading Place', 'CFT/Trip', 'Diesel (Ltr)', 'Diesel Cost',
        'Amount Paid By', 'Diesel Photo', 'Timestamp'
      ]);
      return addTipperEntry(data); // Retry after creating sheet
    }
    
    sheet.appendRow([
      data.gadiNo,
      data.driverName,
      data.date,
      data.material,
      data.loadingPlace || '',
      data.unloadingPlace || '',
      data.cftTrip || '',
      data.dieselLtr || '',
      data.dieselCost || '',
      data.amountPaidBy || '',
      data.dieselPhoto || '', // Base64 image
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

// Get JCB Entries
function getJCBEntries() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(JCB_SHEET_NAME);
    
    if (!sheet) {
      return ContentService.createTextOutput(
        JSON.stringify({ success: true, data: [] })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
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

// Get Tipper Entries
function getTipperEntries() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(TIPPER_SHEET_NAME);
    
    if (!sheet) {
      return ContentService.createTextOutput(
        JSON.stringify({ success: true, data: [] })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
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
    
    // Count JCB entries
    const jcbSheet = ss.getSheetByName(JCB_SHEET_NAME);
    if (jcbSheet) {
      const jcbData = jcbSheet.getDataRange().getValues();
      jcbCount = jcbData.length - 1; // Exclude header
      
      // Calculate total due (column 14 is "Due Amount", 0-indexed is 13)
      for (let i = 1; i < jcbData.length; i++) {
        totalDue += parseFloat(jcbData[i][13]) || 0;
      }
    }
    
    // Count Tipper entries
    const tipperSheet = ss.getSheetByName(TIPPER_SHEET_NAME);
    if (tipperSheet) {
      const tipperData = tipperSheet.getDataRange().getValues();
      tipperCount = tipperData.length - 1; // Exclude header
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

// Helper function to convert header to camelCase
function toCamelCase(str) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '')
    .replace(/[()]/g, '');
}
