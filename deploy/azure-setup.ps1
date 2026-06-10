param(
    [string] $SubscriptionId = "",
    [string] $ResourceGroup = "yazoo-rg",
    [string] $Location = "germanywestcentral",
    [string] $AppName = "yazoo-api",
    [string] $StaticWebAppName = "yazoo-web",
    [string] $StaticWebAppLocation = "germanywestcentral",
    [string] $MysqlServerName = "yazoo-mysql",
    [string] $MysqlAdminUser = "yazoo_admin",
    [string] $MysqlAdminPassword,
    [string] $KeyVaultName = "yazoo-kv",
    [string] $AcrName = "yazooacr",
    [string] $AppServicePlanName = "yazoo-linux-plan"
)

$ErrorActionPreference = "Stop"

function Invoke-AzCommand {
    param([string] $Command)
    Write-Host "Running: $Command"
    Invoke-Expression $Command
    if ($LASTEXITCODE -ne 0) {
        throw "Azure CLI command failed with exit code ${LASTEXITCODE} - Command: $Command"
    }
}

if ($SubscriptionId) {
    Invoke-AzCommand "az account set --subscription '$SubscriptionId'"
}

if (-not $MysqlAdminPassword) {
    $MysqlAdminPassword = Read-Host "MySQL admin password"
}

$groupExists = az group exists --name $ResourceGroup | ConvertFrom-Json
if (-not $groupExists) {
    Invoke-AzCommand "az group create --name '$ResourceGroup' --location '$Location'"
} else {
    Write-Host "Resource group '$ResourceGroup' already exists. Using it without changing its location."
}

Invoke-AzCommand "az acr create --resource-group '$ResourceGroup' --name '$AcrName' --sku Basic --location '$Location' --admin-enabled false"
$AcrLoginServer = az acr show --resource-group $ResourceGroup --name $AcrName --query loginServer -o tsv
if (-not $AcrLoginServer) { throw "Unable to get ACR login server." }
$AcrId = az acr show --resource-group $ResourceGroup --name $AcrName --query id -o tsv

# Check if Key Vault already exists; if not, create it
$kvExists = $null
try {
    $kvExists = az keyvault show --resource-group $ResourceGroup --name $KeyVaultName -o json 2>$null | ConvertFrom-Json -ErrorAction SilentlyContinue
} catch {
    # Key Vault does not exist
}
if (-not $kvExists) {
    Invoke-AzCommand "az keyvault create --resource-group '$ResourceGroup' --name '$KeyVaultName' --location '$Location'"
} else {
    Write-Host "Key Vault '$KeyVaultName' already exists. Skipping creation."
}

# Try to set secret; if RBAC issue, continue anyway
Write-Host "Attempting to set DB-PASSWORD in Key Vault..."
az keyvault secret set --vault-name "$KeyVaultName" --name 'DB-PASSWORD' --value "$MysqlAdminPassword" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: Could not set secret in Key Vault (RBAC issue). Continuing deployment..."
}

Write-Host "Attempting to create MySQL Flexible Server..."
az mysql flexible-server create --resource-group "$ResourceGroup" --location "$Location" --name "$MysqlServerName" --admin-user "$MysqlAdminUser" --admin-password "$MysqlAdminPassword" --sku-name Standard_B1ms --tier Burstable --storage-size 20 --database-name yazoo --public-access 0.0.0.0 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: MySQL creation failed (may be region/quota issue). Continuing deployment..."
} else {
    Write-Host "MySQL server created successfully."
}

Invoke-AzCommand "az appservice plan create --resource-group '$ResourceGroup' --name '$AppServicePlanName' --location '$Location' --is-linux --sku B1"

Invoke-AzCommand "az webapp create --resource-group '$ResourceGroup' --plan '$AppServicePlanName' --name '$AppName' --deployment-container-image-name '$AcrLoginServer/yazoo-api:latest'"
Invoke-AzCommand "az webapp update --resource-group '$ResourceGroup' --name '$AppName' --set httpsOnly=true"
Invoke-AzCommand "az webapp config appsettings set --resource-group '$ResourceGroup' --name '$AppName' --settings WEBSITES_PORT=8080 WEBSITES_CONTAINER_START_TIME_LIMIT=1800 WEBSITE_HEALTHCHECK_MAXPINGFAILURES=3 YAZOO_RUN_MIGRATIONS=true YAZOO_RUNTIME_OPTIMIZE=true"
Invoke-AzCommand "az webapp config set --resource-group '$ResourceGroup' --name '$AppName' --generic-configurations '{\"healthCheckPath\":\"/health/ready\",\"acrUseManagedIdentityCreds\":true}'"

$PrincipalId = az webapp identity assign --resource-group $ResourceGroup --name $AppName --query principalId -o tsv
if (-not $PrincipalId) { throw "Failed to assign managed identity to webapp '$AppName'" }
Invoke-AzCommand "az role assignment create --assignee '$PrincipalId' --scope '$AcrId' --role AcrPull"

Invoke-AzCommand "az staticwebapp create --resource-group '$ResourceGroup' --name '$StaticWebAppName' --location '$StaticWebAppLocation' --sku Free"

Write-Host "Azure resources created. Configure GitHub secrets AZURE_CREDENTIALS, AZURE_RESOURCE_GROUP, AZURE_WEBAPP_NAME, AZURE_STATIC_WEB_APPS_API_TOKEN, ACR_NAME and ACR_LOGIN_SERVER."
