# How to Push App Updates

Follow these steps whenever you want to release a new version of the Brij Industry Tracker app to your users.

## 1. Increment Version
Open `app.json` and change the `"version"` string (e.g., from `1.3.0` to `1.4.0`).
```json
{
  "expo": {
    "version": "1.4.0",
    ...
  }
}
```

## 2. Sync Native Projects
Run this command in your computer's terminal to update the internal Android versioning:
```powershell
npx expo prebuild --platform android --no-install
```

## 3. Build the APK
Navigate to the `android` folder and build the release binary:
```powershell
cd android
./gradlew assembleRelease
```
The file will be generated at: `android/app/build/outputs/apk/release/app-release.apk`.

## 4. Host the APK
1. Rename the APK (e.g., `brij-tracker-v1.4.0.apk`).
2. Upload it to GitHub or any cloud storage.
3. **Important**: Copy the **Direct Download Link** (the one that starts downloading immediately when clicked).

## 5. Update the Server (Google Apps Script)
1. Open your Google Apps Script editor.
2. Update the `version`, `downloadUrl`, and `notes` in the `getLatestVersion` section.
3. Click **Deploy** > **Manage Deployments** > **Edit** > **New Version** > **Deploy**.

Once deployed, all users will see the update prompt the next time they open the app!
