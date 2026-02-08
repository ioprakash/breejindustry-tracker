# Brij Industry Tracker - Setup Guide

Complete setup instructions for the Brij Industry vehicle tracking Android app.

## Prerequisites

- Windows PC
- Node.js (v18 or higher) - [Download here](https://nodejs.org/)
- Android phone for testing
- Google account

## Step 1: Verify Node.js Installation

Open PowerShell and run:

```powershell
node --version
npm --version
```

If not installed, install Node.js from the link above.

## Step 2: Install Expo CLI

```powershell
npm install -g expo-cli
```

## Step 3: Install Expo Go App on Android Phone

1. Open Play Store on your Android phone
2. Search for "Expo Go"
3. Install the app
4. Open it and create an account (optional)

## Step 4: Set Up Google Apps Script Backend

Follow the detailed guides in the project:

1. Read `apps-script/DEPLOYMENT.md` for step-by-step instructions
2. Create a Google Sheet
3. Deploy the Apps Script as a Web App
4. Copy your Web App URL

## Step 5: Configure the Mobile App

1. Open `d:\code\brij-industry-tracker\src\services\api.js`
2. Replace `YOUR_APPS_SCRIPT_URL_HERE` with your actual Web App URL
3. Save the file

## Step 6: Run the App on Your Phone

1. Open PowerShell and navigate to the project:
   ```powershell
   cd d:\code\brij-industry-tracker
   ```

2. Start the development server:
   ```powershell
   npm start
   ```

3. A QR code will appear in the terminal
4. Open Expo Go on your Android phone
5. Scan the QR code
6. The app will load on your phone!

## Step 7: Test the App

1. Try adding a JCB entry
2. Try adding a Tipper entry with a photo
3. View the dashboard
4. Check your Google Sheet - the data should appear!

## Building APK (Optional)

To build a standalone APK that can be installed without Expo Go:

1. Install EAS CLI:
   ```powershell
   npm install -g eas-cli
   ```

2. Login to Expo:
   ```powershell
   eas login
   ```

3. Build the APK:
   ```powershell
   eas build -p android --profile preview
   ```

4. Wait for the build to complete (10-15 minutes)
5. Download the APK from the link provided
6. Transfer to your phone and install

## Troubleshooting

### "Cannot find module" error
```powershell
npm install
```

### QR code not working
- Make sure your phone and PC are on the same WiFi network
- Try using the "Tunnel" connection method in Expo

### App crashes on startup
- Check that you've updated the API_URL in `src/services/api.js`
- Make sure all npm packages are installed

For more help, see `USER_GUIDE.md`.
