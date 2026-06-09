param(
    [string] $HostUrl = $env:SONAR_HOST_URL,
    [string] $Token = $env:SONAR_TOKEN
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($HostUrl)) {
    throw "SONAR_HOST_URL is required."
}

if ([string]::IsNullOrWhiteSpace($Token)) {
    throw "SONAR_TOKEN is required."
}

$statusUrl = "$($HostUrl.TrimEnd('/'))/api/system/status"
$deadline = (Get-Date).AddMinutes(3)

do {
    try {
        $response = Invoke-RestMethod -Uri $statusUrl -Headers @{ Authorization = "Bearer $Token" } -TimeoutSec 10
        if ($response.status -in @("UP", "DB_MIGRATION_NEEDED")) {
            break
        }
    } catch {
        Start-Sleep -Seconds 5
    }
} while ((Get-Date) -lt $deadline)

if ((Get-Date) -ge $deadline) {
    throw "SonarQube is not reachable at $HostUrl."
}

sonar-scanner "-Dsonar.host.url=$HostUrl" "-Dsonar.token=$Token"
