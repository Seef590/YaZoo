#!/usr/bin/env pwsh
[CmdletBinding()]
param(
    [ValidateSet('acr', 'dockerhub')]
    [string] $Registry = 'acr',
    [string] $ResourceGroup = 'yazoo-rg',
    [string] $AcrName = 'yazooacr',
    [string] $DockerHubUser = '',
    [string] $DockerHubRepository = 'yazoo-api',
    [ValidateSet('backend', 'frontend')]
    [string] $App = 'backend',
    [string] $Tag = 'latest',
    [string] $FrontendApiUrl = 'https://yazoo-api.azurewebsites.net/api',
    [string] $FrontendStorageUrl = 'https://yazoo-api.azurewebsites.net/storage',
    [switch] $SkipDockerHubLogin
)

$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $repoRoot

if ($Registry -eq 'acr') {
    Write-Host 'Resolving Azure Container Registry login server...'
    $loginServer = az acr show --resource-group $ResourceGroup --name $AcrName --query loginServer -o tsv
    if (-not $loginServer) {
        throw "Unable to resolve ACR login server for '$AcrName'."
    }

    $imageName = if ($App -eq 'frontend') { 'yazoo-frontend' } else { 'yazoo-api' }
    $image = "${loginServer}/${imageName}:$Tag"

    Write-Host "Building $App image: $image"
    if ($App -eq 'frontend') {
        docker build -t $image -f frontend/Dockerfile --build-arg VITE_API_URL=$FrontendApiUrl --build-arg VITE_STORAGE_URL=$FrontendStorageUrl .
    } else {
        docker build -t $image -f backend/Dockerfile .
    }
    if ($LASTEXITCODE -ne 0) { throw 'Docker build failed.' }

    Write-Host "Logging in to ACR: $AcrName"
    az acr login --name $AcrName
    if ($LASTEXITCODE -ne 0) { throw 'ACR login failed.' }

    Write-Host "Pushing image: $image"
    docker push $image
    if ($LASTEXITCODE -ne 0) { throw 'Docker push failed.' }

    Write-Host "Image pushed: $image"
    return
}

if (-not $DockerHubUser) {
    $DockerHubUser = Read-Host 'Docker Hub username'
}

$image = "$DockerHubUser/${DockerHubRepository}:$Tag"

Write-Host "Building $App image: $image"
if ($App -eq 'frontend') {
    docker build -t $image -f frontend/Dockerfile --build-arg VITE_API_URL=$FrontendApiUrl --build-arg VITE_STORAGE_URL=$FrontendStorageUrl .
} else {
    docker build -t $image -f backend/Dockerfile .
}
if ($LASTEXITCODE -ne 0) { throw 'Docker build failed.' }

if (-not $SkipDockerHubLogin) {
    Write-Host "Logging in to Docker Hub as '$DockerHubUser'..."
    docker login --username $DockerHubUser
    if ($LASTEXITCODE -ne 0) { throw 'Docker Hub login failed.' }
}

Write-Host "Pushing image: $image"
docker push $image
if ($LASTEXITCODE -ne 0) { throw 'Docker Hub push failed.' }

Write-Host "Image pushed: $image"
