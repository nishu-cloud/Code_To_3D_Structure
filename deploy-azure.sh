#!/bin/bash

# Azure App Service Deployment Script for AR Code-Verse
# Prerequisites: Azure CLI must be installed and you must be logged in

# Default values
RESOURCE_GROUP_NAME="rg-ar-code-verse"
APP_SERVICE_PLAN_NAME="plan-ar-code-verse"
WEB_APP_NAME="ar-code-verse-$(date +%s)"
LOCATION="eastus"

echo "🚀 Starting Azure App Service deployment for AR Code-Verse..."

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install Azure CLI first."
    echo "Install from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check Azure CLI version
AZ_VERSION=$(az version --query '"azure-cli"' -o tsv)
echo "✅ Azure CLI version: $AZ_VERSION"

# Check if user is logged in
if ! az account show &> /dev/null; then
    echo "🔐 Please log in to Azure..."
    az login
fi

# Get account info
ACCOUNT=$(az account show --query 'user.name' -o tsv)
echo "✅ Logged in as: $ACCOUNT"

# Create resource group
echo "📦 Creating resource group: $RESOURCE_GROUP_NAME"
az group create --name $RESOURCE_GROUP_NAME --location $LOCATION --output none

# Create App Service Plan
echo "📋 Creating App Service Plan: $APP_SERVICE_PLAN_NAME"
az appservice plan create --name $APP_SERVICE_PLAN_NAME --resource-group $RESOURCE_GROUP_NAME --location $LOCATION --sku B1 --is-linux --output none

# Create Web App
echo "🌐 Creating Web App: $WEB_APP_NAME"
az webapp create --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP_NAME --plan $APP_SERVICE_PLAN_NAME --runtime "NODE:18-lts" --output none

# Configure Web App
echo "⚙️ Configuring Web App..."
az webapp config set --resource-group $RESOURCE_GROUP_NAME --name $WEB_APP_NAME --startup-file "pm2 start /home/site/wwwroot/server.js --no-daemon" --output none

# Install dependencies and prepare deployment
echo "📥 Installing dependencies..."
npm ci --omit=dev

# Create deployment package
echo "📦 Creating deployment package..."
if [ -f "deploy.zip" ]; then
    rm deploy.zip
fi

zip -r deploy.zip *.js *.html *.css package.json package-lock.json web.config

# Deploy to Azure
echo "🚀 Deploying to Azure..."
az webapp deployment source config-zip --resource-group $RESOURCE_GROUP_NAME --name $WEB_APP_NAME --src deploy.zip --output none

# Get the URL
WEB_APP_URL="https://$WEB_APP_NAME.azurewebsites.net"
echo "✅ Deployment completed successfully!"
echo "🌐 Your AR Code-Verse is now available at: $WEB_APP_URL"

# Clean up deployment package
rm deploy.zip

echo "🎉 Deployment complete! Visit $WEB_APP_URL to see your AR Code-Verse in action!" 