# Brij Industry Tracker - User Guide

Complete user manual for the Brij Industry vehicle tracking mobile app.

## Installing the App

### Option 1: Using Expo Go (Development)
1. Install "Expo Go" from Play Store
2. Scan the QR code provided by your administrator
3. App opens in Expo Go

### Option 2: Standalone APK (Production)
1. Download the APK file
2. Go to Settings > Security
3. Enable "Install from Unknown Sources"
4. Open the APK file and tap Install
5. Open "Brij Industry Tracker" from your app drawer

## Home Screen

When you open the app, you'll see:

- **🚜 JCB Entry** - Log JCB work and payments
- **🚚 Tipper Entry** - Record Tipper trips
- **📊 Dashboard** - View all entries

Plus quick stats showing:
- Total JCB entries
- Total Tipper trips
- Total pending due amount

Pull down to refresh the data.

## Recording a JCB Entry

1. Tap **JCB Entry** from the home screen

2. Fill in the required fields:
   - **Godi No** * - Vehicle number (required)
   - **Date** * - Auto-filled with today's date
   - **Driver Name** * - Name of the driver
   - **Tip Count** * - Number of tips/loads
   - **Rate** * - Price per tip

3. Optional fields:
   - Start/Stop meter readings
   - Work details
   - Run Mode (H/N/Tip)
   - Diesel information

4. **Auto-Calculations:**
   - **Total Amount** = Tip Count × Rate (calculated automatically)
   - **Due Amount** = Total Amount - Received Amount

5. Tap **Submit Entry**

6. Entry is saved to Google Sheets instantly (or queued if offline)

## Recording a Tipper Entry

1. Tap **Tipper Entry** from the home screen

2. Fill in the required fields:
   - **Gadi No** * - Vehicle number
   - **Driver Name** *
   - **Date** *
   - **Material** * - Type of material transported

3. Optional fields:
   - Loading place
   - Unloading place
   - CFT/Trip measurement
   - Diesel details

4. **Adding Diesel Receipt Photo:**
   - Tap the camera box
   - Choose "Take Photo" or "Choose from Gallery"
   - Photo is automatically compressed
   - Can see preview before submitting

5. Tap **Submit Entry**

## Viewing the Dashboard

1. Tap **Dashboard** from the home screen

2. **Tabs:**
   - **JCB** - View all JCB entries
   - **Tipper** - View all Tipper entries
   - Numbers show total entries in each category

3. Each entry shows:
   - Vehicle number and date
   - Driver name
   - Work details
   - Amounts (for JCB)
   - Material and locations (for Tipper)

4. **Filtering** (coming soon):
   - By vehicle number
   - By date range
   - By driver name

5. Pull down to refresh data

## Offline Mode

The app works even without internet:

1. **When Offline:**
   - Enter data as normal
   - Entries are saved locally
   - You'll see "Saved Offline" message

2. **When Back Online:**
   - App automatically syncs queued entries
   - Check Google Sheets to confirm

3. **Sync Status:**
   - Opens on app start
   - Happens when you refresh dashboard
   - Manual sync: Pull down on home screen

## Understanding Amounts (JCB)

- **Total Amount**: Automatically calculated as Tip Count × Rate
- **Received Amount**: How much was paid
- **Due Amount**: What's still owed (Total - Received)

Example:
- Tip Count: 10
- Rate: ₹500
- Total Amount: ₹5,000 (automatic)
- Received Amount: ₹3,000 (you enter)
- Due Amount: ₹2,000 (automatic)

## Viewing Data in Google Sheets

1. Open the Google Sheet set up by your administrator
2. You'll see two tabs:
   - **JCB_Logs** - All JCB entries
   - **Tipper_Logs** - All Tipper entries

3. Each row is one entry
4. Timestamps show when entered
5. Diesel photos are saved as base64 text (can be converted back to images)

## Tips for Best Results

### Taking Photos
- Use good lighting
- Keep receipt flat
- Make sure text is readable
- Photos are compressed to save space

### Data Entry
- Enter data daily for accuracy
- Double-check amounts before submitting
- Use consistent naming (e.g., "Gadi 1" vs "Godi 1")

### Tracking Dues
- Check dashboard regularly
- Update received amounts when paid
- Total dues shown on home screen

## Troubleshooting

### "Failed to submit entry"
- Check your internet connection
- Entry is saved offline and will sync later
- Don't submit the same entry multiple times

### App is slow
- Close and reopen the app
- Clear some old entries from Google Sheets
- Check your phone's storage

### Photos not uploading
- Make sure camera permission is granted
- Try compressing photo first
- Check if photo is too large

### Data not showing in Google Sheets
- Check if you're online
- Pull down to refresh on dashboard
- Verify Apps Script backend is deployed correctly

### Can't install APK
- Enable "Install from Unknown Sources"
- Make sure Android version is 5.0 or higher
- Try downloading the APK again

## Getting Help

If you encounter issues:
1. Take a screenshot of the error
2. Note what you were doing when it happened
3. Contact your system administrator
4. Check SETUP.md for technical details

## Data Privacy

- All data is stored in YOUR Google Sheet
- Only you have access to the spreadsheet
- No data is stored on external servers
- Photos are embedded in the sheet
