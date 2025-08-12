# Complete Azure App Service Deployment Script for AR Code-Verse
# This script fixes the "Repository does not exist" error

param(
    [string]$ResourceGroupName = "rg-ar-code-verse",
    [string]$AppServicePlanName = "plan-ar-code-verse",
    [string]$WebAppName = "ar-code-verse-$((Get-Random))",
    [string]$Location = "eastus"
)

Write-Host "🚀 Starting complete Azure App Service deployment for AR Code-Verse..." -ForegroundColor Green

# Check if Azure CLI is installed and user is logged in
try {
    $azVersion = az version --output json | ConvertFrom-Json
    Write-Host "✅ Azure CLI version: $($azVersion.'azure-cli')" -ForegroundColor Green
} catch {
    Write-Error "❌ Azure CLI is not installed or not accessible. Please install Azure CLI first."
    Write-Host "Install from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor Yellow
    exit 1
}

# Check if user is logged in
try {
    $account = az account show --output json | ConvertFrom-Json
    Write-Host "✅ Logged in as: $($account.user.name)" -ForegroundColor Green
} catch {
    Write-Host "🔐 Please log in to Azure..." -ForegroundColor Yellow
    az login
}

# Create resource group
Write-Host "📦 Creating resource group: $ResourceGroupName" -ForegroundColor Blue
az group create --name $ResourceGroupName --location $Location --output none

# Create App Service Plan
Write-Host "📋 Creating App Service Plan: $AppServicePlanName" -ForegroundColor Blue
az appservice plan create --name $AppServicePlanName --resource-group $ResourceGroupName --location $Location --sku B1 --is-linux --output none

# Create Web App
Write-Host "🌐 Creating Web App: $WebAppName" -ForegroundColor Blue
az webapp create --name $WebAppName --resource-group $ResourceGroupName --plan $AppServicePlanName --runtime "NODE:18-lts" --output none

# IMPORTANT: Disable any existing Git deployment to fix the repository error
Write-Host "🔧 Disabling Git deployment to fix repository error..." -ForegroundColor Yellow
az webapp deployment source delete --resource-group $ResourceGroupName --name $WebAppName --output none

# Configure Web App startup command
Write-Host "⚙️ Configuring Web App startup command..." -ForegroundColor Blue
az webapp config set --resource-group $ResourceGroupName --name $WebAppName --startup-file "npm start" --output none

# Install dependencies
Write-Host "📥 Installing dependencies..." -ForegroundColor Blue
npm ci --omit=dev

# Create deployment package with all necessary files
Write-Host "📦 Creating deployment package..." -ForegroundColor Blue
if (Test-Path "deploy.zip") { Remove-Item "deploy.zip" }

# Include all necessary files for deployment
$filesToInclude = @(
    "*.js",
    "*.html", 
    "*.css",
    "package.json",
    "package-lock.json",
    "web.config",
    "node_modules"
)

Compress-Archive -Path $filesToInclude -DestinationPath "deploy.zip" -Force

# Deploy to Azure using ZIP deployment (not Git)
Write-Host "🚀 Deploying to Azure using ZIP deployment..." -ForegroundColor Blue
az webapp deployment source config-zip --resource-group $ResourceGroupName --name $WebAppName --src "deploy.zip" --output none

# Verify deployment
Write-Host "🔍 Verifying deployment..." -ForegroundColor Blue
$deploymentStatus = az webapp deployment source show --resource-group $ResourceGroupName --name $WebAppName --output json | ConvertFrom-Json
Write-Host "✅ Deployment source: $($deploymentStatus.type)" -ForegroundColor Green

# Get the URL
$webAppUrl = "https://$WebAppName.azurewebsites.net"
Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host "🌐 Your AR Code-Verse is now available at: $webAppUrl" -ForegroundColor Green

# Clean up deployment package
Remove-Item "deploy.zip" -ErrorAction SilentlyContinue

Write-Host "🎉 Deployment complete! Visit $webAppUrl to see your AR Code-Verse in action!" -ForegroundColor Green
Write-Host "💡 If you still see errors, try refreshing the Azure portal after a few minutes." -ForegroundColor Cyan 