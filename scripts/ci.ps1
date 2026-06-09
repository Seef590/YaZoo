param(
    [switch] $SkipSonar
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

Push-Location "$Root\backend"
try {
    php artisan test
    composer test:coverage
} finally {
    Pop-Location
}

Push-Location "$Root\frontend"
try {
    npm ci
    npm run lint
    npm run test:coverage
    npm run build
} finally {
    Pop-Location
}

if (-not $SkipSonar) {
    & "$PSScriptRoot\run-sonar.ps1"
}
