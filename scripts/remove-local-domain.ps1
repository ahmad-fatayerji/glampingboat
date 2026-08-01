$ErrorActionPreference = "Stop"

$hostsPath = Join-Path $env:WINDIR "System32\drivers\etc\hosts"
$marker = "glampingboat-account-security-local"
$certificateNames = @(
  "Glamping Boat Local OAuth Development",
  "Glamping Boat Local OAuth Development Root",
  "Glamping Boat Local OAuth Development Certificate"
)

$updatedHosts = Get-Content -LiteralPath $hostsPath |
  Where-Object { $_ -notmatch [regex]::Escape($marker) }
Set-Content -LiteralPath $hostsPath -Value $updatedHosts -Encoding ascii

Get-ChildItem Cert:\CurrentUser\My, Cert:\CurrentUser\Root |
  Where-Object { $certificateNames -contains $_.FriendlyName } |
  Remove-Item

Clear-DnsClientCache | Out-Null

Write-Host "Removed the local glampingboat.fr hosts entry and trusted certificate."
