@echo off
echo 🚀 Starting AR Code-Verse Azure Deployment...
echo.

REM Check if PowerShell is available
powershell -Command "Get-Host" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PowerShell is not available on this system.
    echo Please install PowerShell and try again.
    pause
    exit /b 1
)

REM Run the deployment script
echo ✅ PowerShell found. Starting deployment...
echo.
powershell -ExecutionPolicy Bypass -File "deploy-complete.ps1"

echo.
echo 🎯 Deployment script completed.
pause 