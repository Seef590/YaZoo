#!/usr/bin/env pwsh
[CmdletBinding()]
param(
    [string] $SubscriptionId = "",
    [string] $ResourceGroup = "yazoo-rg",
    [string] $Location = "germanywestcentral",
    [string] $AppServicePlanName = "yazoo-linux-plan",
    [string] $WebAppName = "yazoo-api",
    [string] $DockerHubImage = "5eef/yazoo-api:latest",
    [string] $AppKey,
    [string] $FrontendUrl,
    [string] $DbHost,
    [string] $DbDatabase = "yazoo",
    [string] $DbUsername,
    [string] $DbPassword,
    [string] $RedisHost,
    [string] $RedisPassword,
    [string] $RedisPort = "6380",
    [string] $RedisScheme = "tls",
    [string] $GoogleClientId = "",
    [string] $GoogleClientSecret = "",
    [string] $GoogleRedirectUri = "",
    [string] $GoogleFrontendRedirect = "",
    [string] $MailMailer = "log",
    [string] $MailHost = "",
    [string] $MailPort = "",
    [string] $MailUsername = "",
    [string] $MailPassword = "",
    [string] $MailEncryption = "",
    [string] $MailFromAddress = "",
    [string] $MailFromName = "YaZoo",
    [switch] $SkipMigrations
)

$ErrorActionPreference = "Stop"

function Invoke-AzCommand {
    param([Parameter(Mandatory)][string] $Command)

    Write-Host "Running: $Command"
    Invoke-Expression $Command
    if ($LASTEXITCODE -ne 0) {
        throw "Azure CLI command failed with exit code ${LASTEXITCODE}: $Command"
    }
}

if ($SubscriptionId) {
    Invoke-AzCommand "az account set --subscription '$SubscriptionId'"
}

if (-not $AppKey) {
    throw "APP_KEY is required. Generate one with: cd backend; php artisan key:generate --show"
}

if (-not $FrontendUrl) {
    $FrontendUrl = Read-Host "Frontend URL, for example https://<static-web-app>.azurestaticapps.net"
}

if (-not $DbHost) { $DbHost = Read-Host "Azure MySQL host" }
if (-not $DbUsername) { $DbUsername = Read-Host "Azure MySQL username" }
if (-not $DbPassword) { $DbPassword = Read-Host "Azure MySQL password" }
if (-not $RedisHost) { $RedisHost = Read-Host "Azure Redis host" }
if (-not $RedisPassword) { $RedisPassword = Read-Host "Azure Redis access key" }

$frontendHost = ([Uri] $FrontendUrl).Host
$runMigrations = if ($SkipMigrations) { "false" } else { "true" }
if (-not $GoogleRedirectUri) {
    $GoogleRedirectUri = "https://$WebAppName.azurewebsites.net/api/auth/google/callback"
}
if (-not $GoogleFrontendRedirect) {
    $GoogleFrontendRedirect = "$FrontendUrl/feed"
}

$groupExists = az group exists --name $ResourceGroup | ConvertFrom-Json
if (-not $groupExists) {
    Invoke-AzCommand "az group create --name '$ResourceGroup' --location '$Location'"
}

Invoke-AzCommand "az appservice plan create --resource-group '$ResourceGroup' --name '$AppServicePlanName' --location '$Location' --is-linux --sku B1"

$webAppExists = $null
try {
    $webAppExists = az webapp show --resource-group $ResourceGroup --name $WebAppName -o json 2>$null | ConvertFrom-Json -ErrorAction SilentlyContinue
} catch {
    $webAppExists = $null
}

if (-not $webAppExists) {
    Invoke-AzCommand "az webapp create --resource-group '$ResourceGroup' --plan '$AppServicePlanName' --name '$WebAppName' --deployment-container-image-name '$DockerHubImage'"
}

Invoke-AzCommand "az webapp update --resource-group '$ResourceGroup' --name '$WebAppName' --set httpsOnly=true"
Invoke-AzCommand "az webapp config container set --resource-group '$ResourceGroup' --name '$WebAppName' --docker-custom-image-name '$DockerHubImage' --docker-registry-server-url 'https://index.docker.io'"
Invoke-AzCommand "az webapp config set --resource-group '$ResourceGroup' --name '$WebAppName' --generic-configurations '{\"healthCheckPath\":\"/health/ready\"}'"

Invoke-AzCommand @"
az webapp config appsettings set --resource-group '$ResourceGroup' --name '$WebAppName' --settings `
WEBSITES_PORT=8080 `
WEBSITES_CONTAINER_START_TIME_LIMIT=1800 `
WEBSITE_HEALTHCHECK_MAXPINGFAILURES=3 `
YAZOO_RUN_MIGRATIONS=$runMigrations `
YAZOO_RUNTIME_OPTIMIZE=true `
APP_NAME=YaZoo `
APP_ENV=production `
APP_KEY='$AppKey' `
APP_DEBUG=false `
APP_URL='https://$WebAppName.azurewebsites.net' `
APP_FORCE_HTTPS=true `
LOG_CHANNEL=stack `
LOG_STACK=stderr `
LOG_LEVEL=info `
DB_CONNECTION=mysql `
DB_HOST='$DbHost' `
DB_PORT=3306 `
DB_DATABASE='$DbDatabase' `
DB_USERNAME='$DbUsername' `
DB_PASSWORD='$DbPassword' `
MYSQL_ATTR_SSL_CA=/etc/ssl/certs/ca-certificates.crt `
CACHE_STORE=redis `
QUEUE_CONNECTION=redis `
SESSION_DRIVER=redis `
SESSION_CONNECTION=default `
SESSION_ENCRYPT=true `
SESSION_SECURE_COOKIE=true `
SESSION_SAME_SITE=none `
SESSION_DOMAIN=null `
REDIS_CLIENT=phpredis `
REDIS_SCHEME='$RedisScheme' `
REDIS_HOST='$RedisHost' `
REDIS_PORT='$RedisPort' `
REDIS_PASSWORD='$RedisPassword' `
REDIS_DB=0 `
REDIS_CACHE_DB=1 `
FRONTEND_URL='$FrontendUrl' `
SANCTUM_STATEFUL_DOMAINS='$frontendHost' `
CORS_ALLOWED_ORIGINS='$FrontendUrl' `
GOOGLE_CLIENT_ID='$GoogleClientId' `
GOOGLE_CLIENT_SECRET='$GoogleClientSecret' `
GOOGLE_REDIRECT_URI='$GoogleRedirectUri' `
GOOGLE_FRONTEND_REDIRECT='$GoogleFrontendRedirect' `
FILESYSTEM_DISK=public `
MEDIA_STORAGE_DRIVER=filesystem `
MAIL_MAILER='$MailMailer' `
MAIL_HOST='$MailHost' `
MAIL_PORT='$MailPort' `
MAIL_USERNAME='$MailUsername' `
MAIL_PASSWORD='$MailPassword' `
MAIL_ENCRYPTION='$MailEncryption' `
MAIL_FROM_ADDRESS='$MailFromAddress' `
MAIL_FROM_NAME='$MailFromName'
"@

Invoke-AzCommand "az webapp restart --resource-group '$ResourceGroup' --name '$WebAppName'"

Write-Host ""
Write-Host "Backend deployment configured:"
Write-Host "https://$WebAppName.azurewebsites.net/health/live"
Write-Host "https://$WebAppName.azurewebsites.net/health/ready"
