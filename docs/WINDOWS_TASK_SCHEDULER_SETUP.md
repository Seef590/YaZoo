# Windows Task Scheduler Setup

Run these commands from an elevated PowerShell prompt. They create scheduled jobs without embedding secrets.

Project path:

```powershell
$Project = "C:\Users\seef7\OneDrive\Desktop\YaZoo-Startup\Yazoo_V2"
```

## Daily MySQL Backup at 2 AM

```powershell
schtasks /Create /TN "YaZoo Daily MySQL Backup" /SC DAILY /ST 02:00 /TR "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$Project\scripts\backup\backup-mysql.ps1`"" /F
```

## Daily Backup Cleanup at 2:30 AM

```powershell
schtasks /Create /TN "YaZoo Backup Retention Cleanup" /SC DAILY /ST 02:30 /TR "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$Project\scripts\backup\cleanup-old-backups.ps1`"" /F
```

## Weekly Snapshot Sunday at 3 AM

```powershell
schtasks /Create /TN "YaZoo Weekly DR Snapshot" /SC WEEKLY /D SUN /ST 03:00 /TR "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$Project\scripts\backup\create-snapshot.ps1`"" /F
```

## Weekly Health Report Sunday at 3:30 AM

```powershell
schtasks /Create /TN "YaZoo Backup Health Report" /SC WEEKLY /D SUN /ST 03:30 /TR "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$Project\scripts\backup\verify-backup.ps1`"" /F
```

## Verify Scheduled Tasks

```powershell
schtasks /Query /TN "YaZoo Daily MySQL Backup"
schtasks /Query /TN "YaZoo Backup Retention Cleanup"
schtasks /Query /TN "YaZoo Weekly DR Snapshot"
schtasks /Query /TN "YaZoo Backup Health Report"
```

## Remove Scheduled Tasks

```powershell
schtasks /Delete /TN "YaZoo Daily MySQL Backup" /F
schtasks /Delete /TN "YaZoo Backup Retention Cleanup" /F
schtasks /Delete /TN "YaZoo Weekly DR Snapshot" /F
schtasks /Delete /TN "YaZoo Backup Health Report" /F
```

