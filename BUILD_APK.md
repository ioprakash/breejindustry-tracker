# Building Android APK

This guide explains how to build a standalone Android APK that can be installed directly on devices without needing Expo Go.

## Method 1: EAS Build (Recommended)

Expo Application Services (EAS) is the official way to build production apps.

### Prerequisites

1. Create an Expo account at [expo.dev](https://expo.dev)
2. Install EAS CLI globally:
   ```powershell
   npm install -g eas-cli
   ```

### Steps

1. **Login to EAS:**
   ```powershell
   cd d:\code\brij-industry-tracker
   eas login
   ```
   Enter your Expo credentials when prompted.

2. **Configure EAS:**
   ```powershell
   eas build:configure
   ```
   - Select **Android** when asked
   - This creates `eas.json` configuration file

3. **Build APK (for testing):**
   ```powershell
   eas build -p android --profile preview
   ```
   
   Or for production:
   ```powershell
   eas build -p android --profile production
   ```

4. **Wait for build:**
   - The build happens on Expo's servers
   - Takes about 10-15 minutes
   - You'll get a link to download the APK when done

5. **Download and Install:**
   - Download the APK from the provided link
   - Transfer to your Android phone (via USB, Drive, etc.)
   - Enable "Install from Unknown Sources" on your phone
   - Open the APK file and install

## Method 2: Local Build (Advanced)

If you prefer to build locally, you'll need Android Studio and Java SDK.

### Prerequisites

1. Install Android Studio
2. Set up Android SDK
3. Configure environment variables

### Steps

1. **Install expo-dev-client:**
   ```powershell
   npx expo install expo-dev-client
   ```

2. **Build locally:**
   ```powershell
   eas build --platform android --local
   ```

## APK Types

### Preview Build
- Smaller size
- For testing
- Command: `eas build -p android --profile preview`

### Production Build
- Optimized and minified
- For distribution
- Command: `eas build -p android --profile production`

## Sharing the APK

Once you have the APK:

1. **Upload to Google Drive** and share the link
2. **Transfer via USB** to multiple phones
3. **Host on a web server** for easy download
4. **Submit to Play Store** (requires developer account)

## App Signing

For Play Store distribution, you'll need to handle app signing:

1. EAS automatically manages keystore for you
2. Download credentials:
   ```powershell
   eas credentials
   ```
3. Keep the keystore safe for future updates

## Version Updates

When you make changes to the app:

1. Update version in `app.json`:
   ```json
   "version": "1.0.1"
   ```

2. Rebuild the APK:
   ```powershell
   eas build -p android --profile production
   ```

3. Users can install the new APK over the old one

## Size Optimization

To reduce APK size:

1. Remove unused assets from `assets/` folder
2. Optimize images
3. Use production build profile
4. Enable Proguard (minification)

## Troubleshooting

### Build fails with "Keystore error"
- Clear your credentials: `eas credentials`
- Remove and re-create keystore

### APK won't install
- Check Android version compatibility (minimum Android 5.0)
- Enable "Install from Unknown Sources"
- Make sure previous version is uninstalled if testing

### App crashes after install
- Check that `API_URL` in `src/services/api.js` is correct
- View logs with `adb logcat` if you have Android SDK

## Cost

- EAS Build: **Free tier** includes limited builds per month
- For unlimited builds, Expo offers paid plans
- Local building is completely free

For more details, visit [docs.expo.dev/build/introduction](https://docs.expo.dev/build/introduction/)
