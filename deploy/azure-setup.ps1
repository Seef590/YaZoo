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
    [string] $AcrName = "yazooacr"
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
az acr create --resource-group $ResourceGroup --name $AcrName --sku Basic --admin-enabled true
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
    --name "yazoo-free-plan" `
    --is-linux `
    --sku F1

az webapp create `
    --resource-group $ResourceGroup `
    --plan "yazoo-free-plan" `
    --name $AppName `
    --runtime "PHP:8.2"

az webapp config set --resource-group $ResourceGroup --name $AppName --https-only true
az staticwebapp create `
    --resource-group $ResourceGroup `
    --name $StaticWebAppName `
    --location "westeurope" `
    --sku Free

Write-Host "Azure resources created. Store the generated publish profiles and Static Web App token as GitHub secrets."
