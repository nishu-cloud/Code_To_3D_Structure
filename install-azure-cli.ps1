# Simple Azure CLI Installation Script

Write-Host "Installing Azure CLI..." -ForegroundColor Green

try {
    # Download Azure CLI installer
    $downloadUrl = "https://aka.ms/installazurecliwindows"
    $installerPath = "$env:TEMP\AzureCLI.msi"
    
    Write-Host "Downloading Azure CLI from Microsoft..." -ForegroundColor Blue
    Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath
    
    Write-Host "Installing Azure CLI..." -ForegroundColor Blue
    Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$installerPath`" /quiet" -Wait
    
    # Clean up
    Remove-Item $installerPath -ErrorAction SilentlyContinue
    
    Write-Host "Azure CLI installed successfully!" -ForegroundColor Green
    Write-Host "Please restart your PowerShell session and run the deployment script again." -ForegroundColor Yellow
    
} catch {
    Write-Host "Failed to install Azure CLI: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please install manually from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-windows" -ForegroundColor Yellow
} 