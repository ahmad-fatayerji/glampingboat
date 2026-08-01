$ErrorActionPreference = "Stop"

$workspace = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$certificateDirectory = Join-Path $workspace ".local-certs"
$hostsPath = Join-Path $env:WINDIR "System32\drivers\etc\hosts"
$marker = "glampingboat-account-security-local"
$legacyFriendlyName = "Glamping Boat Local OAuth Development"
$rootFriendlyName = "Glamping Boat Local OAuth Development Root"
$leafFriendlyName = "Glamping Boat Local OAuth Development Certificate"

New-Item -ItemType Directory -Path $certificateDirectory -Force | Out-Null

$rootCertificate = Get-ChildItem Cert:\CurrentUser\My |
  Where-Object {
    $_.FriendlyName -eq $rootFriendlyName -and
    $_.NotAfter -gt (Get-Date).AddDays(7)
  } |
  Select-Object -First 1

if (-not $rootCertificate) {
  $rootCertificate = New-SelfSignedCertificate `
    -Type Custom `
    -Subject "CN=Glamping Boat Local Development Root" `
    -CertStoreLocation "Cert:\CurrentUser\My" `
    -FriendlyName $rootFriendlyName `
    -NotAfter (Get-Date).AddYears(5) `
    -KeyAlgorithm RSA `
    -KeyLength 3072 `
    -HashAlgorithm SHA256 `
    -KeyExportPolicy Exportable `
    -KeyUsage CertSign, CRLSign, DigitalSignature `
    -TextExtension @("2.5.29.19={critical}{text}ca=1&pathlength=1")
}

$certificate = Get-ChildItem Cert:\CurrentUser\My |
  Where-Object {
    $_.FriendlyName -eq $leafFriendlyName -and
    $_.NotAfter -gt (Get-Date).AddDays(7)
  } |
  Select-Object -First 1

if (-not $certificate) {
  $certificate = New-SelfSignedCertificate `
    -Type Custom `
    -Subject "CN=glampingboat.fr" `
    -DnsName "glampingboat.fr" `
    -Signer $rootCertificate `
    -CertStoreLocation "Cert:\CurrentUser\My" `
    -FriendlyName $leafFriendlyName `
    -NotAfter (Get-Date).AddYears(2) `
    -KeyAlgorithm RSA `
    -KeyLength 2048 `
    -HashAlgorithm SHA256 `
    -KeyExportPolicy Exportable `
    -KeyUsage DigitalSignature, KeyEncipherment `
    -TextExtension @(
      "2.5.29.19={critical}{text}ca=0",
      "2.5.29.37={text}1.3.6.1.5.5.7.3.1"
    )
}

$password = ConvertTo-SecureString `
  "glampingboat-local-development" `
  -AsPlainText `
  -Force
$pfxPath = Join-Path $certificateDirectory "glampingboat.fr.pfx"
$cerPath = Join-Path $certificateDirectory "glampingboat.fr.cer"
$rootCerPath = Join-Path $certificateDirectory "glampingboat-local-root.cer"

Export-PfxCertificate `
  -Cert $certificate `
  -FilePath $pfxPath `
  -Password $password `
  -Force | Out-Null
Export-Certificate `
  -Cert $certificate `
  -FilePath $cerPath `
  -Force | Out-Null
Export-Certificate `
  -Cert $rootCertificate `
  -FilePath $rootCerPath `
  -Force | Out-Null

$trusted = Get-ChildItem Cert:\CurrentUser\Root |
  Where-Object { $_.Thumbprint -eq $rootCertificate.Thumbprint }
if (-not $trusted) {
  Import-Certificate `
    -FilePath $rootCerPath `
    -CertStoreLocation "Cert:\CurrentUser\Root" | Out-Null
}

# Remove the original self-signed leaf trust entry created by older versions
# of this script. Chrome requires a proper CA-to-server certificate chain.
Get-ChildItem Cert:\CurrentUser\Root, Cert:\CurrentUser\My |
  Where-Object { $_.FriendlyName -eq $legacyFriendlyName } |
  Remove-Item

$existingEntry = Get-Content -LiteralPath $hostsPath |
  Select-String -SimpleMatch $marker
if (-not $existingEntry) {
  Copy-Item `
    -LiteralPath $hostsPath `
    -Destination (Join-Path $certificateDirectory "hosts.before-glampingboat.txt") `
    -Force
  Add-Content `
    -LiteralPath $hostsPath `
    -Value "`r`n127.0.0.1 glampingboat.fr # $marker"
}

Clear-DnsClientCache | Out-Null

Write-Host "Local domain configured: https://glampingboat.fr"
Write-Host "Certificate expires: $($certificate.NotAfter)"
Write-Host "Trusted root expires: $($rootCertificate.NotAfter)"
Write-Host "Start with: npm run dev:security:domain"
