# App Crash Fix Guide

## Common Causes & Solutions

### **Most Likely: Metro Bundler Cache Issue**

After changing the `api.js` file, the app needs to clear its cache and restart.

#### Solution:

1. **Stop the current server:**
   - Press `Ctrl+C` in the terminal running `npm start`

2. **Clear Metro cache:**
   ```powershell
   npx expo start -c
   ```
   The `-c` flag clears the cache

3. **Restart Expo Go app:**
   - Close Expo Go completely on your phone
   - Reopen it and scan the QR code again

---

### **If Still Crashing: Check for Errors**

When you run `npx expo start -c`, look for error messages in red.

Common errors:

#### **Error: "Cannot find module"**
```powershell
npm install
npx expo start -c
```

#### **Error: "Syntax error"**
Check that you pasted the Apps Script URL correctly in `api.js`:
- Should start with `https://script.google.com/macros/s/`
- Should end with `/exec`
- Should have NO spaces or line breaks

#### **Error: "Network request failed"**
- Make sure your phone and computer are on same WiFi
- Try using "Tunnel" mode in Expo (press `s` to switch)

---

### **Nuclear Option: Fresh Start**

If nothing works:

```powershell
# Stop current server (Ctrl+C)

# Delete node_modules
Remove-Item -Recurse -Force node_modules

# Reinstall everything
npm install

# Start with cache clear
npx expo start -c
```

---

## Quick Checklist

Before running the app:

- ✅ `SPREADSHEET_ID` updated in `apps-script/Code.gs`
- ✅ Apps Script deployed as Web App
- ✅ "Who has access" set to "Anyone"
- ✅ `API_URL` updated in `src/services/api.js`
- ✅ Metro bundler cache cleared

---

## How to See the Actual Error

When the app crashes in Expo Go:

1. Shake your phone
2. Tap "Reload"
3. If error appears, read the red error message
4. Take a screenshot and check what it says

Common crash errors:

- **"Element type is invalid"** → Import error in components
- **"undefined is not an object"** → Missing prop or data
- **"Network request failed"** → API URL issue

---

## Still Not Working?

Try this debugging sequence:

1. **Check if Metro is running:**
   ```powershell
   # You should see "Metro waiting" message
   # If not, run: npx expo start -c
   ```

2. **Check QR code:**
   - Make sure you're scanning the right QR code
   - Try typing the URL manually in Expo Go

3. **Check phone/PC connection:**
   - Both on same WiFi network
   - No VPN running
   - Firewall not blocking

4. **Try Tunnel mode:**
   - Press `s` in the terminal
   - Select "Tunnel"
   - Scan new QR code

---

## Expected Behavior

When working correctly:

1. Run `npx expo start -c`
2. See Metro bundler start (green text)
3. QR code appears
4. Scan with Expo Go
5. See "Building JavaScript bundle"
6. App opens showing home screen with Brij Industry logo

If it crashes before showing the home screen, there's a code error.
