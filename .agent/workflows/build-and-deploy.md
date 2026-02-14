---
description: Build the Android APK locally, update versioning, and push to GitHub for app updates
---

Follow these steps to release a new version of the Brij Industry Tracker app:

### 1. Update Versioning
Before building, you must increment the version in 3 places:
- **`app.json`**: Update `"version": "x.x.x"`
- **`android/app/build.gradle`**: Update `versionName "x.x.x"` and INCREMENT `versionCode` (e.g., from 2 to 3)
- **`apps-script/Code.gs`**: Update `const LATEST_VERSION = 'x.x.x'` and update the `DOWNLOAD_URL` to point to the new APK filename.

### 2. Prepare the Native Project
Run prebuild to sync `app.json` changes to the native android folder:
// turbo
`npx expo prebuild --platform android --clean`

### 3. Generate Local Release APK
Navigate to the android folder and run the Gradle build:
// turbo
`cd android; ./gradlew assembleRelease; cd ..`

### 4. Move and Rename APK
Copy the generated APK to the root directory with the versioned name:
// turbo
`copy-item -Path "android\app\build\outputs\apk\release\app-release.apk" -Destination "d:\code\brij-industry-tracker\brij-industry-tracker-vX.X.X.apk" -Force`

### 5. Push to GitHub
Commit all code changes and the new APK file, then push to the main branch:
// turbo
`git add . ; git commit -m "vX.X.X: [Description of changes]"; git push origin main`

### 6. Update Google Apps Script
Copy the contents of `apps-script/Code.gs` to the Google Sheet Script Editor and **Deploy as a New Version** to make the update live for all users.
