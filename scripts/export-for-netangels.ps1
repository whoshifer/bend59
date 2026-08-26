$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$dist = Join-Path $root 'dist'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$staging = Join-Path $env:TEMP "bend-next-export-$stamp"
$archive = Join-Path $dist "bend-next-netangels-$stamp.zip"
$excluded = @('node_modules', '.next', '.git', '.env', '.env.docker-test', 'screenshots', 'dist', 'legacy')

New-Item -ItemType Directory -Force -Path $dist | Out-Null
Remove-Item -LiteralPath $staging -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $staging | Out-Null

Get-ChildItem -LiteralPath $root -Force | Where-Object { $_.Name -notin $excluded } | ForEach-Object {
    Copy-Item -LiteralPath $_.FullName -Destination $staging -Recurse -Force
}

Compress-Archive -Path (Join-Path $staging '*') -DestinationPath $archive -CompressionLevel Optimal -Force
Remove-Item -LiteralPath $staging -Recurse -Force

Get-Item -LiteralPath $archive | Select-Object FullName, Length, LastWriteTime
