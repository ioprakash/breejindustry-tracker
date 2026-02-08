# 🚀 Quick Apps Script Setup (5 Minutes)

## Why You Need This
Your mobile app needs a "middleman" to talk to Google Sheets. Apps Script is that middleman - it's FREE and SIMPLE!

**Without Apps Script:** ❌ Mobile app can't save or read data  
**With Apps Script:** ✅ Mobile app works perfectly with Google Sheets

---

## Step-by-Step Setup

### 1️⃣ Create a Google Sheet (1 minute)

1. Open https://sheets.google.com
2. Click **+ Blank** to create new sheet
3. Name it: **Brij Industry Database**
4. Copy the **Sheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/COPY_THIS_LONG_ID/edit
                                          ^^^^^^^^^^^^^^^^
   ```
   Example: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

---

### 2️⃣ Open Apps Script Editor (1 minute)

1. In your Google Sheet, click: **Extensions** → **Apps Script**
2. New tab opens with code editor
3. Delete everything you see in the editor

---

### 3️⃣ Paste the Backend Code (1 minute)

1. Open this file on your computer: `d:\code\brij-industry-tracker\apps-script\Code.gs`
2. Copy ALL the code (Ctrl+A, Ctrl+C)
3. Paste into the Apps Script editor (Ctrl+V)
4. Find **Line 5** which says:
   ```javascript
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
   ```
5. Replace `YOUR_SPREADSHEET_ID_HERE` with your Sheet ID from Step 1:
   ```javascript
   const SPREADSHEET_ID = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';
   ```
6. Click **Save** (💾 icon)
7. Name it: **Brij Industry Backend**

---

### 4️⃣ Deploy as Web App (2 minutes)

1. Click **Deploy** → **New deployment**
2. Click the **gear icon** ⚙️ next to "Select type"
3. Choose **Web app**
4. Fill in:
   - Description: `Brij Industry API`
   - Execute as: **Me (your email)**
   - Who has access: **Anyone** ⚠️ IMPORTANT
5. Click **Deploy**

---

### 5️⃣ Authorize the Script

You'll see a permission warning:

1. Click **Authorize access**
2. Choose your Google account
3. Click **Advanced**
4. Click **Go to Brij Industry Backend (unsafe)** ← This is safe, it's YOUR script
5. Click **Allow**

---

### 6️⃣ Copy the URL

After authorization, you'll see:

```
Web app URL: https://script.google.com/macros/s/AKfycbxubMOm8TjBOzgOzhazJ2-heLKddQpVI9-kK6Tea1zZlRQlIeI1h0Z8VDXUZarh5sOe-Q/exec
```

**📋 COPY THIS ENTIRE URL** - you need it for the next step!

---

### 7️⃣ Update Mobile App (30 seconds)

1. Open: `d:\code\brij-industry-tracker\src\services\api.js`
2. Find **Line 10**:
   ```javascript
   const API_URL = 'YOUR_APPS_SCRIPT_URL_HERE';
   ```
3. Replace with your copied URL:
   ```javascript
   const API_URL = 'https://script.google.com/macros/s/AKfycby...your-url.../exec';
   ```
4. **Save the file** (Ctrl+S)

---

## ✅ You're Done!

Now your mobile app can:
- ✅ Save JCB entries to Google Sheets
- ✅ Save Tipper entries to Google Sheets
- ✅ Read all entries back
- ✅ Show statistics on dashboard

The Google Sheet will automatically create two tabs:
- **JCB_Logs** - All JCB entries
- **Tipper_Logs** - All Tipper entries

---

## 🧪 Test It

Your app is already running (`npm start`).

1. Scan QR code with Expo Go
2. Try adding a JCB entry
3. Check your Google Sheet - data should appear!

---

## ❓ Troubleshooting

**App shows "Failed to submit"**
- Check if you saved `api.js` after updating the URL
- Restart the app: Stop `npm start` and run again

**Data not appearing in sheet**
- Check SPREADSHEET_ID in Apps Script matches your sheet
- Check "Who has access" is set to "Anyone"

---

## 📝 Summary

**What you just did:**
1. Created a Google Sheet database
2. Deployed a FREE backend API using Apps Script
3. Connected your mobile app to the backend

**Total cost:** ₹0 (completely free!)  
**Total time:** ~5 minutes

🎉 **Your app is now fully functional!**
