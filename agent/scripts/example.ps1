# InfoBot Example Script
# This script demonstrates basic functionality

Write-Host "InfoBot Script Execution Started" -ForegroundColor Green
Write-Host "Timestamp: $(Get-Date)" -ForegroundColor Yellow

# System Information
Write-Host "`nSystem Information:" -ForegroundColor Cyan
Write-Host "Computer Name: $env:COMPUTERNAME"
Write-Host "User: $env:USERNAME"
Write-Host "OS: $(Get-WmiObject -Class Win32_OperatingSystem | Select-Object -ExpandProperty Caption)"

# Example task - Get running processes (top 5 by CPU)
Write-Host "`nTop 5 Processes by CPU Usage:" -ForegroundColor Cyan
Get-Process | Sort-Object CPU -Descending | Select-Object -First 5 Name, CPU, WorkingSet | Format-Table -AutoSize

# Example task - Check disk space
Write-Host "`nDisk Space Information:" -ForegroundColor Cyan
Get-WmiObject -Class Win32_LogicalDisk | Where-Object {$_.DriveType -eq 3} | ForEach-Object {
    $freeSpaceGB = [math]::Round($_.FreeSpace / 1GB, 2)
    $totalSpaceGB = [math]::Round($_.Size / 1GB, 2)
    $percentFree = [math]::Round(($_.FreeSpace / $_.Size) * 100, 2)
    Write-Host "Drive $($_.DeviceID) - Free: ${freeSpaceGB}GB / Total: ${totalSpaceGB}GB (${percentFree}% free)"
}

# Simulate some work
Write-Host "`nPerforming example task..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

Write-Host "`nScript execution completed successfully!" -ForegroundColor Green
Write-Host "Exit Code: 0"

# Return success
exit 0 