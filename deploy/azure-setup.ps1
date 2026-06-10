param(
    [string] $SubscriptionId = "",
    [string] $ResourceGroup = "yazoo-rg",
    [string] $Location = "francecentral",
    [string] $AppName = "yazoo-api",
    [string] $StaticWebAppName = "yazoo-web",
    [string] $MysqlServerName = "yazoo-mysql",
    [string] $MysqlAdminUser = "yazoo_admin",
    [string] $MysqlAdminPassword,
    [string] $KeyVaultName = "yazoo-kv",
    [string] $AcrName = "yazooacr",
    [string] $AppServicePlanName = "yazoo-linux-plan"
)

$ErrorActionPreference = "Stop"

if ($SubscriptionId) {
    az account set --subscription $SubscriptionId
}

if (-not $MysqlAdminPassword) {
    $MysqlAdminPassword = Read-Host "MySQL admin password" -AsSecureString
    $MysqlAdminPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($MysqlAdminPassword)
    )
}

az group create --name $ResourceGroup --location $Location
az acr create --resource-group $ResourceGroup --name $AcrName --sku Basic --admin-enabled false
$AcrLoginServer = az acr show --resource-group $ResourceGroup --name $AcrName --query loginServer -o tsv
$AcrId = az acr show --resource-group $ResourceGroup --name $AcrName --query id -o tsv
az keyvault create --resource-group $ResourceGroup --name $KeyVaultName --location $Location
az keyvault secret set --vault-name $KeyVaultName --name "DB-PASSWORD" --value $MysqlAdminPassword

az mysql flexible-server create `
    --resource-group $ResourceGroup `
    --location $Location `
    --name $MysqlServerName `
    --admin-user $MysqlAdminUser `
    --admin-password $MysqlAdminPassword `
    --sku-name Standard_B1ms `
    --tier Burstable `
    --storage-size 20 `
    --database-name yazoo `
    --public-access 0.0.0.0

az appservice plan create `
    --resource-group $ResourceGroup `
    --name $AppServicePlanName `
    --is-linux `
    --sku B1

az webapp create `
    --resource-group $ResourceGroup `
    --plan $AppServicePlanName `
    --name $AppName `
    --deployment-container-image-name "$AcrLoginServer/yazoo-api:latest"

az webapp config set --resource-group $ResourceGroup --name $AppName --https-only true
az webapp config appsettings set `
    --resource-group $ResourceGroup `
    --name $AppName `
    --settings WEBSITES_PORT=8080 WEBSITES_CONTAINER_START_TIME_LIMIT=1800 WEBSITE_HEALTHCHECK_MAXPINGFAILURES=3 YAZOO_RUN_MIGRATIONS=true YAZOO_RUNTIME_OPTIMIZE=true

az webapp config set `
    --resource-group $ResourceGroup `
    --name $AppName `
    --generic-configurations '{"healthCheckPath":"/health/ready","acrUseManagedIdentityCreds":true}'

$PrincipalId = az webapp identity assign --resource-group $ResourceGroup --name $AppName --query principalId -o tsv
az role assignment create --assignee $PrincipalId --scope $AcrId --role AcrPull

az staticwebapp create `
    --resource-group $ResourceGroup `
    --name $StaticWebAppName `
    --location "westeurope" `
    --sku Free

Write-Host "Azure resources created. Configure GitHub secrets AZURE_CREDENTIALS, AZURE_RESOURCE_GROUP, AZURE_WEBAPP_NAME, AZURE_STATIC_WEB_APPS_API_TOKEN, ACR_NAME and ACR_LOGIN_SERVER."
