# Deploying Google Apps Script Backend

This guide will walk you through deploying the Google Apps Script as a Web App to serve as the backend for your Brij Industry Tracker app.

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it **"Brij Industry Tracker Database"**
4. Note the **Spreadsheet ID** from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - Copy the `SPREADSHEET_ID` part

## Step 2: Open Apps Script Editor

1. In your Google Sheet, click **Extensions** > **Apps Script**
2. This will open the Apps Script editor in a new tab
3. Delete any existing code in the editor

## Step 3: Add the Backend Code

1. Copy all the code from `apps-script/Code.gs`
2. Paste it into the Apps Script editor
3. **IMPORTANT**: Update the `SPREADSHEET_ID` variable at the top:
   ```javascript
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Replace with your actual ID
   ```

4. Click **Save** (💾 icon) and name the project **"Brij Industry Backend"**

## Step 4: Deploy as Web App

1. Click **Deploy** > **New deployment**
2. Click the gear icon (⚙️) next to "Select type"
3. Select **Web app**
4. Fill in the deployment settings:
   - **Description**: "Brij Industry API v1"
   - **Execute as**: **Me** (your email)
   - **Who has access**: **Anyone** (important for the mobile app to access it)

5. Click **Deploy**
6. You may need to authorize the script:
   - Click **Authorize access**
   - Choose your Google account
   - Click **Advanced** > **Go to Brij Industry Backend (unsafe)**
   - Click **Allow**

7. **Copy the Web App URL** - it will look like:
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```

## Step 5: Update Mobile App Configuration

1. Open `d:\code\brij-industry-tracker\src\services\api.js`
2. Find this line:
   ```javascript
   const API_URL = 'YOUR_APPS_SCRIPT_URL_HERE';
   ```
3. Replace `'YOUR_APPS_SCRIPT_URL_HERE'` with your copied Web App URL:
   ```javascript
   const API_URL = 'https://script.google.com/macros/s/AKfycby.../exec';
   ```
4. Save the file

## Step 6: Test the Backend

1. Test the API using a browser or Postman:
   - GET request: `YOUR_WEB_APP_URL?action=getStats`
   - You should see a JSON response like:
     ```json
     {
       "success": true,
       "data": {
         "jcbCount": 0,
         "tipperCount": 0,
         "totalDue": 0
       }
     }
     ```

## Updating the Script

If you need to make changes to the backend:

1. Edit the code in the Apps Script editor
2. Save your changes
3. Click **Deploy** > **Manage deployments**
4. Click the pencil icon (✏️) next to your deployment
5. Change **Version** to **New version**
6. Click **Deploy**
7. The Web App URL stays the same

## Troubleshooting

### "Authorization required" error
- Re-deploy the script and make sure "Who has access" is set to "Anyone"

### "Cannot find spreadsheet" error
- Double-check that the SPREADSHEET_ID in Code.gs matches your Google Sheet ID

### Data not saving
- Check that the script has permission to edit the spreadsheet
- Look at **Executions** in Apps Script (left sidebar) to see error logs

## Sheet Structure

The script automatically creates two sheets with proper headers:

**JCB_Logs:**
- Godi No, Date, Driver Name, Start Mtr Day, Stop Mtr Day, Work Detail, Run Mode, Start Mtr, Stop Mtr, Tip Count, Rate, Total Amount, Received Amount, Due Amount, Diesel (Ltr), Diesel Cost, Diesel Mtr, Diesel Paid By, Timestamp

**Tipper_Logs:**
- Gadi No, Driver Name, Date, Material, Loading Place, Unloading Place, CFT/Trip, Diesel (Ltr), Diesel Cost, Amount Paid By, Diesel Photo, Timestamp

These sheets are created automatically when you submit the first entry from the mobile app.
