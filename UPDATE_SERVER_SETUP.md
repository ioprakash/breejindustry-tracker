# Setting Up App Update Server

## Overview
The app now checks `https://industry.breejtech.com.np/version.json` for updates every 24 hours.

## Server Setup

### 1. Create version.json File

Create a file at `https://industry.breejtech.com.np/version.json` with this content:

```json
{
  "version": "1.0.0",
  "downloadUrl": "https://industry.breejtech.com.np/brij-industry-tracker.apk",
  "message": "New version available with bug fixes and improvements!"
}
```

### 2. Update the File When You Release New Version

When you build a new APK:

1. **Upload the new APK** to your server:
   ```
   brij-industry-tracker-v1.1.0.apk
   ```

2. **Update version.json**:
   ```json
   {
     "version": "1.1.0",
     "downloadUrl": "https://industry.breejtech.com.np/brij-industry-tracker-v1.1.0.apk",
     "message": "New features: Improved dashboard and faster sync!"
   }
   ```

3. **Update app.json** in your code before building:
   ```json
   "version": "1.1.0"
   ```

---

## How It Works

1. **App Opens** → Checks version.json (once per 24 hours)
2. **Compares Versions** → Current app version vs server version
3. **If Newer** → Shows alert with "Download" button
4. **User Clicks Download** → Opens browser to download new APK

---

## Update Flow

```
App Startup
    ↓
Check Last Update Time
    ↓
If > 24 hours ago
    ↓
Fetch https://industry.breejtech.com.np/version.json
    ↓
Compare Versions
    ↓
If Server Version > App Version
    ↓
Show Update Alert
    ↓
User Clicks "Download"
    ↓
Open Download URL
```

---

## Server File Structure

```
industry.breejtech.com.np/
├── version.json                           ← Update info
├── brij-industry-tracker.apk             ← Latest APK (symlink)
├── brij-industry-tracker-v1.0.0.apk      ← Versioned APKs
├── brij-industry-tracker-v1.1.0.apk
└── brij-industry-tracker-v1.2.0.apk
```

---

## Testing Update Check

### Test Locally

1. **Create a local test server** or use a GitHub Gist:
   ```json
   {
     "version": "2.0.0",
     "downloadUrl": "https://example.com/test.apk",
     "message": "Test update notification!"
   }
   ```

2. **Temporarily change URL** in `updateChecker.js`:
   ```javascript
   const UPDATE_CHECK_URL = 'https://your-test-url.com/version.json';
   ```

3. **Run the app** - you should see update alert

### Force Check

Add a button in settings to manually check:

```javascript
import { forceCheckForUpdates } from '../utils/updateChecker';

// In your component
<Button onPress={forceCheckForUpdates} title="Check for Updates" />
```

---

## Example: Nginx Configuration

If using Nginx to serve files:

```nginx
server {
    server_name industry.breejtech.com.np;
    
    location /version.json {
        root /var/www/brij-updates;
        add_header Access-Control-Allow-Origin *;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    location ~ \.apk$ {
        root /var/www/brij-updates;
        add_header Content-Type application/vnd.android.package-archive;
    }
}
```

---

## Version Numbering

Follow Semantic Versioning:

- **Major.Minor.Patch** (e.g., 1.2.3)
- **Major**: Breaking changes
- **Minor**: New features
- **Patch**: Bug fixes

Examples:
- `1.0.0` → Initial release
- `1.0.1` → Bug fix
- `1.1.0` → New dashboard feature
- `2.0.0` → Complete redesign

---

## Security Notes

1. **HTTPS Required** - Use SSL for security
2. **APK Signing** - Always sign APKs with same key
3. **Hash Verification** (Optional) - Add SHA256 hash to version.json:
   ```json
   {
     "version": "1.0.0",
     "downloadUrl": "...",
     "sha256": "abc123...",
     "message": "..."
   }
   ```

---

## Troubleshooting

### Update Not Detected
- Clear app cache: Force close and reopen
- Check 24-hour timer hasn't blocked it
- Verify version.json is accessible
- Check version numbers are formatted correctly

### Download Not Working
- Verify downloadUrl is correct
- Check file permissions on server
- Ensure HTTPS works properly

### Testing
```javascript
// In updateChecker.js, temporarily set:
const CHECK_INTERVAL = 0; // Always check for testing
```

---

## Files Modified

- [updateChecker.js](file:///d:/code/brij-industry-tracker/src/utils/updateChecker.js) - Update logic
- [HomeScreen.js](file:///d:/code/brij-industry-tracker/src/screens/HomeScreen.js) - Calls update checker on startup

Current app version: **1.0.0** (from app.json)
