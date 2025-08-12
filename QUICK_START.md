# 🚀 Quick Start: Deploy AR Code-Verse to Azure

## ⚡ Fastest Way to Deploy

### Option 1: One-Click Deployment (Windows)
```cmd
deploy.bat
```
Just double-click this file and follow the prompts!

### Option 2: PowerShell Commands
```powershell
# Install Azure CLI (if needed)
.\install-azure-cli.ps1

# After restart, deploy
.\deploy-complete.ps1
```

### Option 3: Manual Portal (No CLI)
1. Go to https://portal.azure.com
2. Follow the steps in `MANUAL_DEPLOYMENT.md`

## 🔍 What You Need

- ✅ **Windows 10/11** (PowerShell)
- ✅ **Node.js 18+** (for dependencies)
- ✅ **Azure Account** (free at azure.com)
- ❌ **Azure CLI** (will be installed automatically)

## 📋 What Happens During Deployment

1. **Azure CLI Installation** (if needed)
2. **Resource Creation**:
   - Resource Group: `rg-ar-code-verse`
   - App Service Plan: `plan-ar-code-verse`
   - Web App: `ar-code-verse-[unique-name]`
3. **Code Deployment**:
   - Install dependencies
   - Package application
   - Deploy to Azure
4. **Configuration**:
   - Set startup commands
   - Configure Node.js runtime

## 🌐 After Deployment

Your AR Code-Verse will be live at:
```
https://[your-app-name].azurewebsites.net
```

## 💰 Cost

- **B1 Basic**: ~$13/month (recommended)
- **F1 Free**: Free but limited

## 🆘 If Something Goes Wrong

1. **Check the logs** in the deployment output
2. **Verify prerequisites** are met
3. **Try the manual portal method** (Option 3)
4. **Check the troubleshooting section** in `DEPLOYMENT_SOLUTION.md`

## 🎯 Ready to Deploy?

**Just run: `deploy.bat`**

That's it! The script will handle everything else automatically. 