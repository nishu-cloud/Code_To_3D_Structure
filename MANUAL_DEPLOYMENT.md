# Manual Azure Deployment Guide (No CLI Required)

If you prefer not to install Azure CLI, you can deploy directly through the Azure Portal.

## 🚀 Quick Manual Deployment

### Step 1: Prepare Your Project

1. **Install dependencies locally:**
   ```bash
   npm ci --omit=dev
   ```

2. **Create deployment package:**
   - Select these files in your project folder:
     - `*.js` (all JavaScript files)
     - `*.html` (all HTML files)
     - `*.css` (all CSS files)
     - `package.json`
     - `package-lock.json`
     - `web.config`
   - Right-click → "Send to" → "Compressed (zipped) folder"
   - Name it `deploy.zip`

### Step 2: Azure Portal Setup

1. **Go to Azure Portal:**
   - Visit: https://portal.azure.com
   - Sign in with your Microsoft account

2. **Create Resource Group:**
   - Click "Create a resource"
   - Search for "Resource group"
   - Click "Create"
   - **Resource group name:** `rg-ar-code-verse`
   - **Region:** `East US` (or your preferred location)
   - Click "Review + create" → "Create"

3. **Create App Service Plan:**
   - Click "Create a resource"
   - Search for "App Service Plan"
   - Click "Create"
   - **Resource group:** Select `rg-ar-code-verse`
   - **Name:** `plan-ar-code-verse`
   - **Region:** Same as resource group
   - **Operating system:** `Linux`
   - **Pricing plan:** `Basic B1` (~$13/month)
   - Click "Review + create" → "Create"

4. **Create Web App:**
   - Click "Create a resource"
   - Search for "Web App"
   - Click "Create"
   - **Resource group:** Select `rg-ar-code-verse`
   - **Name:** `ar-code-verse-[your-unique-name]`
   - **Publish:** `Code`
   - **Runtime stack:** `Node 18 LTS`
   - **Operating system:** `Linux`
   - **Region:** Same as resource group
   - **App Service Plan:** Select `plan-ar-code-verse`
   - Click "Review + create" → "Create"

### Step 3: Deploy Your Code

1. **Go to your Web App:**
   - In Azure Portal, search for your web app name
   - Click on it to open

2. **Deploy from ZIP:**
   - In the left menu, click "Deployment Center"
   - Click "Deployments"
   - Click "Deploy from ZIP"
   - Upload your `deploy.zip` file
   - Click "Deploy"

3. **Configure startup command:**
   - Go to "Configuration" in the left menu
   - Click "General settings"
   - **Startup Command:** `pm2 start /home/site/wwwroot/server.js --no-daemon`
   - Click "Save"

### Step 4: Test Your App

1. **Get your app URL:**
   - In the Overview section, copy the "Default domain"
   - Your app will be at: `https://[your-app-name].azurewebsites.net`

2. **Test the deployment:**
   - Open the URL in your browser
   - You should see your AR Code-Verse application

## 🔧 Troubleshooting

### App Not Starting
- Check "Log stream" in the left menu
- Verify startup command is correct
- Check if all files are in the ZIP

### Files Not Loading
- Ensure `web.config` is included in the ZIP
- Check file paths are correct
- Verify static file serving is working

### Dependencies Issues
- Make sure `node_modules` is NOT included in the ZIP
- Verify `package.json` and `package-lock.json` are included
- Check if all required files are present

## 💰 Cost Information

- **B1 Basic:** ~$13/month (recommended)
- **F1 Free:** Free but limited
- **S1 Standard:** ~$73/month (higher performance)

## 🎯 Next Steps

After successful deployment:
1. Test all AR functionality
2. Set up custom domain (optional)
3. Configure monitoring
4. Set up CI/CD pipeline

## 🆘 Need Help?

- **Azure Documentation:** https://docs.microsoft.com/en-us/azure/app-service/
- **Azure Support:** Available in the portal
- **Community:** Stack Overflow with tag `azure-app-service` 