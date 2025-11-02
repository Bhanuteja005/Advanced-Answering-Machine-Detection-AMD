# AMD Detection Quick Fix
# Run this after setting up ngrok

Write-Host "🔧 AMD Detection Quick Fix Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if ngrok is installed
Write-Host "Checking for ngrok..." -ForegroundColor Yellow
$ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue

if (-not $ngrokInstalled) {
    Write-Host "❌ ngrok not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install ngrok first:" -ForegroundColor Yellow
    Write-Host "  1. Download from: https://ngrok.com/download" -ForegroundColor White
    Write-Host "  2. Or run: choco install ngrok" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✅ ngrok is installed" -ForegroundColor Green
Write-Host ""

# Instructions
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Open a NEW terminal window" -ForegroundColor Yellow
Write-Host "2. Run: ngrok http 3000" -ForegroundColor White
Write-Host ""
Write-Host "3. Copy the https URL (looks like: https://abc123.ngrok.io)" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Paste it when prompted below" -ForegroundColor Yellow
Write-Host ""

# Get ngrok URL from user
Write-Host "Enter your ngrok URL (e.g., https://abc123.ngrok.io):" -ForegroundColor Cyan
$ngrokUrl = Read-Host

# Validate URL
if ($ngrokUrl -notmatch '^https://[a-z0-9]+\.ngrok\.io$') {
    Write-Host "❌ Invalid URL format!" -ForegroundColor Red
    Write-Host "Expected format: https://abc123.ngrok.io" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ Valid ngrok URL: $ngrokUrl" -ForegroundColor Green
Write-Host ""

# Update .env file
$envPath = "C:\Users\pashi\Downloads\amd\.env"

if (Test-Path $envPath) {
    Write-Host "Updating .env file..." -ForegroundColor Yellow
    
    # Read current .env
    $envContent = Get-Content $envPath -Raw
    
    # Check if TWILIO_CALLBACK_BASE_URL already exists
    if ($envContent -match 'TWILIO_CALLBACK_BASE_URL=') {
        # Replace existing value
        $envContent = $envContent -replace 'TWILIO_CALLBACK_BASE_URL=.*', "TWILIO_CALLBACK_BASE_URL=$ngrokUrl"
        Write-Host "✅ Updated existing TWILIO_CALLBACK_BASE_URL" -ForegroundColor Green
    } else {
        # Add new line
        $envContent += "`nTWILIO_CALLBACK_BASE_URL=$ngrokUrl"
        Write-Host "✅ Added TWILIO_CALLBACK_BASE_URL to .env" -ForegroundColor Green
    }
    
    # Save .env file
    Set-Content -Path $envPath -Value $envContent
    
    Write-Host ""
    Write-Host "✅ .env file updated successfully!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "❌ .env file not found at: $envPath" -ForegroundColor Red
    exit 1
}

# Show configuration
Write-Host "📝 Current Configuration:" -ForegroundColor Cyan
Write-Host "  ngrok URL: $ngrokUrl" -ForegroundColor White
Write-Host "  Webhook URL: $ngrokUrl/api/webhooks/twilio/status" -ForegroundColor White
Write-Host "  TwiML URL: $ngrokUrl/api/twiml/handle-call" -ForegroundColor White
Write-Host ""

# Next steps
Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. ✅ ngrok is running (keep that terminal open!)" -ForegroundColor Green
Write-Host "2. ✅ .env is updated with ngrok URL" -ForegroundColor Green
Write-Host "3. 🔄 Restart Next.js server:" -ForegroundColor Yellow
Write-Host "     - Press Ctrl+C in the server terminal" -ForegroundColor White
Write-Host "     - Run: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "4. 📞 Test AMD Detection:" -ForegroundColor Yellow
Write-Host "     - Go to: http://localhost:3000/dial" -ForegroundColor White
Write-Host "     - Make a call to: +917386836602" -ForegroundColor White
Write-Host "     - Answer and say: Hello" -ForegroundColor White
Write-Host "     - Check: http://localhost:3000/history" -ForegroundColor White
Write-Host ""
Write-Host "5. ✅ Verify Results:" -ForegroundColor Yellow
Write-Host "     - Status should update: initiated → ringing → answered → completed" -ForegroundColor White
Write-Host "     - AMD Result should show: human or machine" -ForegroundColor White
Write-Host "     - Confidence score should appear: 0.75-0.95" -ForegroundColor White
Write-Host ""

Write-Host "🎉 Setup complete! Now restart your Next.js server." -ForegroundColor Green
Write-Host ""

# Ask if user wants to restart server
Write-Host "Would you like to restart the Next.js server now? (y/n):" -ForegroundColor Cyan
$restart = Read-Host

if ($restart -eq 'y' -or $restart -eq 'Y') {
    Write-Host ""
    Write-Host "Stopping existing Next.js processes..." -ForegroundColor Yellow
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2
    
    Write-Host "Starting Next.js server..." -ForegroundColor Yellow
    Write-Host ""
    
    # Start server in current directory
    Set-Location "C:\Users\pashi\Downloads\amd"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
    
    Write-Host "✅ Server starting in new window!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 Go test AMD detection now!" -ForegroundColor Cyan
    Write-Host "   URL: http://localhost:3000/dial" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "⚠️  Remember to restart the server manually:" -ForegroundColor Yellow
    Write-Host "   cd C:\Users\pashi\Downloads\amd" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor White
    Write-Host ""
}

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
