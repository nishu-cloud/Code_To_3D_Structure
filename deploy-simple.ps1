# Simple Azure Deployment Script for AR Code-Verse
param(
    [string]$ResourceGroupName = "rg-ar-code-verse",
    [string]$AppServicePlanName = "plan-ar-code-verse",
    [string]$WebAppName = "ar-code-verse-$((Get-Random))",
    [string]$Location = "eastus"
)

Write-Host "Starting Azure deployment for AR Code-Verse..." -ForegroundColor Green

# Check if Azure CLI is available
try {
    $azVersion = az version --output json | ConvertFrom-Json
    Write-Host "Azure CLI version: $($azVersion.'azure-cli')" -ForegroundColor Green
} catch {
    Write-Host "Azure CLI is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-windows" -ForegroundColor Yellow
    Write-Host "After installation, restart PowerShell and run this script again." -ForegroundColor Yellow
    exit 1
}

# Check if user is logged in
try {
    $account = az account show --output json | ConvertFrom-Json
    Write-Host "Logged in as: $($account.user.name)" -ForegroundColor Green
} catch {
    Write-Host "Please log in to Azure..." -ForegroundColor Yellow
    az login
}

# Create resource group
Write-Host "Creating resource group: $ResourceGroupName" -ForegroundColor Blue
az group create --name $ResourceGroupName --location $Location --output none

# Create App Service Plan
Write-Host "Creating App Service Plan: $AppServicePlanName" -ForegroundColor Blue
az appservice plan create --name $AppServicePlanName --resource-group $ResourceGroupName --location $Location --sku B1 --is-linux --output none

# Create Web App
Write-Host "Creating Web App: $WebAppName" -ForegroundColor Blue
az webapp create --name $WebAppName --resource-group $ResourceGroupName --plan $AppServicePlanName --runtime "NODE:18-lts" --output none

# Configure startup command
Write-Host "Configuring startup command..." -ForegroundColor Blue
az webapp config set --resource-group $ResourceGroupName --name $WebAppName --startup-file "npm start" --output none

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Blue
npm ci --omit=dev

# Create deployment package
Write-Host "Creating deployment package..." -ForegroundColor Blue
if (Test-Path "deploy.zip") { Remove-Item "deploy.zip" }

# Create ZIP with all necessary files
$files = @("*.js", "*.html", "*.css", "package.json", "package-lock.json", "web.config")
Compress-Archive -Path $files -DestinationPath "deploy.zip" -Force

# Deploy to Azure
Write-Host "Deploying to Azure..." -ForegroundColor Blue
az webapp deployment source config-zip --resource-group $ResourceGroupName --name $WebAppName --src "deploy.zip" --output none

# Get the URL
$webAppUrl = "https://$WebAppName.azurewebsites.net"
Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "Your AR Code-Verse is now available at: $webAppUrl" -ForegroundColor Green

# Clean up
Remove-Item "deploy.zip" -ErrorAction SilentlyContinue

Write-Host "Deployment complete! Visit $webAppUrl to see your AR Code-Verse in action!" -ForegroundColor Green 