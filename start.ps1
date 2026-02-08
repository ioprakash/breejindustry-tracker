# Quick Start Script for Brij Industry Tracker

Write-Host "🚜 Brij Industry Tracker - Quick Start" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install from: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check if we're in the right directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ Not in project directory!" -ForegroundColor Red
    Write-Host "Please run this script from: d:\code\brij-industry-tracker" -ForegroundColor Red
    exit 1
}

Write-Host "✅ In project directory" -ForegroundColor Green
Write-Host ""

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "⚠️  IMPORTANT: Before running the app" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Deploy Google Apps Script Backend:" -ForegroundColor White
Write-Host "   📖 See: apps-script\DEPLOYMENT.md" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Update API Configuration:" -ForegroundColor White
Write-Host "   📝 Edit: src\services\api.js" -ForegroundColor Gray
Write-Host "   Replace 'YOUR_APPS_SCRIPT_URL_HERE' with your URL" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Install Expo Go on your Android phone" -ForegroundColor White
Write-Host "   📱 Download from Play Store" -ForegroundColor Gray
Write-Host ""

# Ask if user is ready
Write-Host "========================================" -ForegroundColor Cyan
$ready = Read-Host "Have you completed the above steps? (yes/no)"

if ($ready -ne "yes") {
    Write-Host ""
    Write-Host "⏸️  Please complete the setup steps first." -ForegroundColor Yellow
    Write-Host "📖 Full setup guide: SETUP.md" -ForegroundColor Yellow
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "🚀 Starting development server..." -ForegroundColor Green
Write-Host "📱 Scan the QR code with Expo Go on your phone" -ForegroundColor Cyan
Write-Host ""

# Start the app
npm start
