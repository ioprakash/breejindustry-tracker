# Brij Industry Tracker

A native Android mobile application for tracking JCB and Tipper vehicle operations with Google Sheets as the backend database.

## 📱 Features

- ✅ **Native Android App** - Smooth performance, works like a real app
- 📝 **JCB Entry Form** - Track work details, tip counts, rates, and payments
- 🚚 **Tipper Entry Form** - Record trips, materials, and locations
- 📸 **Photo Capture** - Take photos of diesel receipts with automatic compression
- 🔢 **Auto-Calculations** - Automatic computation of totals and dues
- 📊 **Dashboard** - View all entries with filtering by type
- 💾 **Offline Support** - Works without internet, auto-syncs when online
- 🎨 **Modern UI** - Beautiful dark theme with smooth animations
- ☁️ **Google Sheets Backend** - All data stored in your Google Sheet

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Android phone
- Google account

### Installation

1. **Clone or navigate to the project:**
   ```powershell
   cd d:\code\brij-industry-tracker
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Set up Google Apps Script backend:**
   - Follow instructions in `apps-script/DEPLOYMENT.md`
   - Update API_URL in `src/services/api.js`

4. **Run the app:**
   ```powershell
   npm start
   ```

5. **Scan QR code** with Expo Go app on your phone

## 📖 Documentation

- **[SETUP.md](SETUP.md)** - Complete setup instructions
- **[BUILD_APK.md](BUILD_APK.md)** - How to build Android APK
- **[USER_GUIDE.md](USER_GUIDE.md)** - User manual for the app
- **[apps-script/DEPLOYMENT.md](apps-script/DEPLOYMENT.md)** - Backend deployment guide

## 📁 Project Structure

```
brij-industry-tracker/
├── src/
│   ├── screens/          # App screens
│   │   ├── HomeScreen.js
│   │   ├── JCBFormScreen.js
│   │   ├── TipperFormScreen.js
│   │   └── DashboardScreen.js
│   ├── components/       # Reusable components
│   │   ├── CustomInput.js
│   │   ├── CustomButton.js
│   │   ├── PhotoPicker.js
│   │   └── StatCard.js
│   ├── services/         # API and storage services
│   │   ├── api.js
│   │   └── storage.js
│   ├── utils/            # Utility functions
│   │   ├── calculations.js
│   │   └── imageCompressor.js
│   └── styles/           # Theme and styles
│       └── theme.js
├── apps-script/          # Google Apps Script backend
│   ├── Code.gs
│   └── DEPLOYMENT.md
├── App.js                # Main app entry point
├── app.json              # Expo configuration
└── package.json          # Dependencies
```

## 🎯 Key Features Explained

### JCB Entry
Records JCB work with fields like:
- Godi No, Date, Driver Name
- Tip Count × Rate = Auto-calculated Total
- Tracks received and due amounts
- Diesel consumption details

### Tipper Entry
Logs Tipper trips with:
- Gadi No, Driver, Material
- Loading and unloading locations
- Photo of diesel receipts
- CFT/Trip measurements

### Dashboard
- View all JCB and Tipper entries
- Toggle between entry types
- Real-time stats on home screen
- Pull to refresh data

### Offline Mode
- Entries saved locally when offline
- Automatic sync when connection restored
- Sync queue management
- Cached data for viewing

## 🛠️ Tech Stack

- **Framework:** React Native + Expo
- **Navigation:** React Navigation
- **Storage:** AsyncStorage
- **Backend:** Google Apps Script
- **Database:** Google Sheets
- **Image:** Expo Image Picker + Camera

## 📦 Available Scripts

```powershell
npm start          # Start development server
npm run android    # Run on Android device/emulator
npm run web        # Run in web browser
```

## 🔧 Configuration

Update these files before deployment:

1. **`src/services/api.js`** - Set your Google Apps Script URL
2. **`apps-script/Code.gs`** - Set your Google Sheet ID
3. **`app.json`** - Customize app name, icon, etc.

## 📸 Screenshots

[App screenshots would go here in production]

## 🤝 Support

For issues or questions:
1. Check documentation files
2. Review troubleshooting sections
3. Contact system administrator

## 📄 License

This project is created for Brij Industry's internal use.

## 🙏 Credits

Built with React Native and Expo  
Backend powered by Google Apps Script  
Data stored in Google Sheets

---

**Made for Brij Industry** 🚜🚚
# breejindustry-tracker
