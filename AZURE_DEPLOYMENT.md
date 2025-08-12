# Azure App Service Deployment Guide for AR Code-Verse

This guide will help you deploy your AR Code-Verse project to Azure App Service.

## Prerequisites

1. **Azure Account**: You need an active Azure subscription
2. **Azure CLI**: Install the Azure Command Line Interface
3. **Node.js**: Version 18 or higher (for local testing)

## Quick Deployment

### Option 1: Automated Script (Recommended)

#### For Windows (PowerShell):
```powershell
# Make sure you're in the project directory
.\deploy-azure.ps1
```

#### For Linux/macOS:
```bash
# Make the script executable
chmod +x deploy-azure.sh

# Run the deployment script
./deploy-azure.sh
```

### Option 2: Manual Deployment

#### Step 1: Install Azure CLI
- **Windows**: Download from [Microsoft's official site](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-windows)
- **macOS**: `brew install azure-cli`
- **Linux**: Follow [official instructions](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-linux)

#### Step 2: Login to Azure
```bash
az login
```

#### Step 3: Create Resources
```bash
# Set variables
RESOURCE_GROUP="rg-ar-code-verse"
PLAN_NAME="plan-ar-code-verse"
APP_NAME="ar-code-verse-$(date +%s)"
LOCATION="eastus"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create App Service Plan
az appservice plan create --name $PLAN_NAME --resource-group $RESOURCE_GROUP --location $LOCATION --sku B1 --is-linux

# Create Web App
az webapp create --name $APP_NAME --resource-group $RESOURCE_GROUP --plan $PLAN_NAME --runtime "NODE:18-lts"
```

#### Step 4: Deploy Your Code
```bash
# Install dependencies
npm ci --omit=dev

# Create deployment package
zip -r deploy.zip *.js *.html *.css package.json package-lock.json web.config

# Deploy to Azure
az webapp deployment source config-zip --resource-group $RESOURCE_GROUP --name $APP_NAME --src deploy.zip

# Clean up
rm deploy.zip
```

#### Step 5: Access Your App
```bash
# Get the URL
az webapp browse --name $APP_NAME --resource-group $RESOURCE_GROUP
```

## Configuration Details

### Web.config
The `web.config` file is configured for:
- Node.js handling via IIS Node
- Static file serving
- SPA routing support
- Security headers

### Server.js
The Express server:
- Serves static files from the root directory
- Handles SPA routing
- Sets appropriate cache headers
- Runs on port 8080 (configurable via environment variable)

### Package.json
- **Start script**: `node server.js`
- **Dependencies**: Express.js for the web server
- **Node version**: 18 or higher

## Environment Variables

You can configure these environment variables in Azure App Service:

- `PORT`: Server port (default: 8080)
- `NODE_ENV`: Environment mode (production/development)

## Monitoring and Logs

### View Logs
```bash
# Stream logs
az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP

# Download logs
az webapp log download --name $APP_NAME --resource-group $RESOURCE_GROUP
```

### Application Insights
Enable Application Insights for monitoring:
```bash
az monitor app-insights component create --app $APP_NAME --location $LOCATION --resource-group $RESOURCE_GROUP --application-type web
```

## Troubleshooting

### Common Issues

1. **Deployment Failed**
   - Check if all files are included in the zip
   - Verify Node.js version compatibility
   - Check Azure App Service logs

2. **App Not Starting**
   - Verify the startup command in web.config
   - Check if server.js is in the root directory
   - Review application logs

3. **Static Files Not Loading**
   - Ensure web.config is properly configured
   - Check file paths in the deployment package

### Debug Commands
```bash
# Check app status
az webapp show --name $APP_NAME --resource-group $RESOURCE_GROUP

# Check app configuration
az webapp config show --name $APP_NAME --resource-group $RESOURCE_GROUP

# Restart app
az webapp restart --name $APP_NAME --resource-group $RESOURCE_GROUP
```

## Cost Optimization

- **Free Tier**: Use F1 for development/testing
- **Basic Tier**: B1 for production (recommended)
- **Standard Tier**: S1 for higher performance needs

## Security Considerations

- HTTPS is enabled by default
- Environment variables for sensitive data
- Regular security updates via Azure
- Network security groups for access control

## Next Steps

After successful deployment:
1. Test all AR functionality
2. Set up custom domain (optional)
3. Configure CI/CD pipeline
4. Set up monitoring and alerts
5. Configure backup and disaster recovery

## Support

- **Azure Documentation**: [App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- **Azure CLI Reference**: [CLI Commands](https://docs.microsoft.com/en-us/cli/azure/)
- **Community**: [Stack Overflow](https://stackoverflow.com/questions/tagged/azure-app-service) 