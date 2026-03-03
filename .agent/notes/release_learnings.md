# Release Learnings - Update Handler Fix

## The Issue
After updating to a new version (v1.8.0), the app continued to show the "Update Available" modal. This was because `src/services/updateHandler.js` and `src/utils/updateChecker.js` had the version string hardcoded as `1.7.9`. Even though the app shell was updated, the internal logic compared its hardcoded `1.7.9` against the server's `1.8.0` and concluded an update was still needed.

## The Solution
1. **Dynamic Versioning**: Changed hardcoded strings to use `Constants.expoConfig.version`.
   ```javascript
   import Constants from 'expo-constants';
   const CURRENT_VERSION = Constants.expoConfig?.version || '1.8.1';
   ```
2. **Prebuild Side-effects**: Noted that `npx expo prebuild --clean` deletes `android/local.properties`. This must be manually restored with the SDK path `C:\\Users\\dipuk\\AppData\\Local\\Android\\Sdk` before running `gradlew`.

## Future builds
- Always use the `/build-and-deploy` workflow which now includes these safety checks.
- Verify that `Constants.expoConfig.version` is correctly reporting the current version in the footer before finalizing a build.
