# YaZoo - Securite de partage local

## Objectif

Ce document decrit comment preparer un paquet local YaZoo partageable avec une commission, un encadrant ou un partenaire institutionnel sans exposer les secrets, les journaux, les sauvegardes ou les dependances lourdes.

## Ne jamais inclure

- `.env`, `.env.production` et tout fichier de secret reel.
- `.git` et historique Git local.
- `.github` si le ZIP est destine a une revue non technique.
- `node_modules`, `vendor`, `frontend/dist`, `frontend/coverage`.
- `infra/backups`, snapshots, dumps SQL, `.sql`, `.sql.gz`, `.dump`, `.bak`, `.backup`.
- `backend/storage/logs`, logs applicatifs, cookies de smoke test, fichiers temporaires.
- Volumes Docker, exports de base de donnees et credentials cloud.

## Verification rapide avant partage

```powershell
cd "C:\Users\seef7\OneDrive\Desktop\YaZoo"
rg --files -g ".env" -g ".env.*" -g "*.sql" -g "*.sql.gz" -g "*.dump" -g "*.bak" -g "*.backup" -g "*.zip" -g "*.log" -g "*secret*" -g "*token*"
```

La commande ci-dessus sert a reperer les fichiers a exclure. Elle peut afficher des fichiers d'exemple comme `.env.example`; ceux-ci sont acceptables si aucune valeur secrete reelle n'y figure.

## Creation d'un ZIP propre

Executer cette commande depuis PowerShell. Elle cree un dossier temporaire, copie uniquement les fichiers autorises, puis produit un ZIP sans secrets ni artefacts lourds.

```powershell
$root = "C:\Users\seef7\OneDrive\Desktop\YaZoo"
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$temp = Join-Path $env:TEMP "YaZoo-INDH-clean-$stamp"
$zip = Join-Path $root "YaZoo-INDH-clean-$stamp.zip"
$blockedDirs = @(".git", ".github", ".vscode", "node_modules", "vendor", "dist", "coverage")
$blockedPrefixes = @("infra\backups\", "backend\storage\logs\", "backend\storage\framework\cache\", "backend\storage\framework\sessions\", "backend\storage\framework\views\")
$blockedNames = @(".env", ".env.production", "smoke-cookie.txt", "smoke-cookie-local.txt", "curl-cookie-jar.txt", "smoke-session.xml")
$blockedExtensions = @(".sql", ".dump", ".bak", ".backup", ".log", ".zip", ".tar", ".gz", ".7z", ".pem", ".key")

New-Item -ItemType Directory -Path $temp | Out-Null
Get-ChildItem -LiteralPath $root -Recurse -Force -File | Where-Object {
    $relative = $_.FullName.Substring($root.Length + 1)
    $parts = $relative -split "[\\/]"
    $hasBlockedDir = @($parts | Where-Object { $blockedDirs -contains $_ }).Count -gt 0
    $hasBlockedPrefix = @($blockedPrefixes | Where-Object { $relative.StartsWith($_, [System.StringComparison]::OrdinalIgnoreCase) }).Count -gt 0
    $isBlockedName = $blockedNames -contains $_.Name
    $isBlockedExtension = $blockedExtensions -contains $_.Extension.ToLowerInvariant()
    -not ($hasBlockedDir -or $hasBlockedPrefix -or $isBlockedName -or $isBlockedExtension)
} | ForEach-Object {
    $relative = $_.FullName.Substring($root.Length + 1)
    $destination = Join-Path $temp $relative
    New-Item -ItemType Directory -Path (Split-Path $destination) -Force | Out-Null
    Copy-Item -LiteralPath $_.FullName -Destination $destination
}

Compress-Archive -Path (Join-Path $temp "*") -DestinationPath $zip -Force
Write-Host "ZIP propre cree: $zip"
```

## Controle du ZIP

Apres creation, ouvrir le ZIP et verifier manuellement l'absence de:

- `.env`
- `.git`
- `infra/backups`
- `backend/storage/logs`
- `node_modules`
- `vendor`
- dumps SQL
- fichiers de logs
- credentials cloud

## Decision projet

Pour un dossier INDH, le ZIP doit rester un support de demonstration technique et documentaire. Il ne remplace pas les justificatifs administratifs, la declaration CNDP si applicable, les autorisations ONSSA ou les contrats reels avec les professionnels.
