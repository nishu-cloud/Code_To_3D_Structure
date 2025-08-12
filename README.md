# AR Code-Verse: Visualize Your Code in 3D

This project is an innovative Augmented Reality (AR) application that transforms a software codebase into an interactive 3D structure. It aims to revolutionize how developers understand, debug, and analyze complex codebases by providing an immersive, spatial visualization.

## Features
- **3D Code Visualization:** View your code's file and component structure in a 3D space.
- **Interactive Navigation:** "Walk through" your codebase using your device.
- **Dependency Highlighting:** See the connections and data flows between different parts of your code.

## Tech Stack
- **WebXR:** For creating the Augmented Reality experience on the web.
- **Three.js / A-Frame:** For rendering the 3D objects and scenes.
- **Babel (or similar parser):** To generate an Abstract Syntax Tree (AST) from your code.

## Deploy to Azure App Service (Linux)

1. Prerequisites
   - Install Azure CLI and login: `az login`
   - Install Node.js 18+ locally if you want to run it: `node -v`

2. Run locally
   - Install deps: `npm install`
   - Start server: `npm start`
   - Open: `http://localhost:8080`

3. Create Azure resources (one-time)

```bash
# Variables
APP_NAME="ar-code-verse-$RANDOM"    # choose your own unique name instead
LOCATION="eastus"
RG_NAME="rg-ar-code-verse"
PLAN_NAME="plan-ar-code-verse"

# Resource group and Linux plan
az group create -n $RG_NAME -l $LOCATION
az appservice plan create -n $PLAN_NAME -g $RG_NAME --sku B1 --is-linux

# Create the web app for Node 18 LTS
az webapp create -n $APP_NAME -g $RG_NAME -p $PLAN_NAME --runtime "NODE:18-lts"
```

4. Deploy your code

- Zip deploy (simple):
```bash
# From the repo root
npm ci --omit=dev || npm install --omit=dev
zip -r app.zip . -x "node_modules/*" -x ".git/*"
az webapp deploy --resource-group $RG_NAME --name $APP_NAME --src-path app.zip --type zip
```

- Or use the quick command that creates resources automatically:
```bash
az webapp up --runtime "NODE:18-lts" --sku F1 --name $APP_NAME --location $LOCATION
```

5. Browse

```bash
az webapp browse -n $APP_NAME -g $RG_NAME
```

Notes
- This repo now includes `server.js` and `package.json` so Azure can run it as a Node app.
- If you prefer Azure Static Web Apps for a pure static host, you can also deploy without the Node server.
