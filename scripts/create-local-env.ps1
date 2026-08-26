$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root '.env'

if (Test-Path -LiteralPath $envFile) {
    Write-Output '.env already exists; it was not replaced.'
    exit 0
}

function New-AlphaNumericSecret([int]$Length) {
    $alphabet = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    $bytes = New-Object byte[] $Length
    $generator = New-Object System.Security.Cryptography.RNGCryptoServiceProvider
    try {
        $generator.GetBytes($bytes)
    } finally {
        $generator.Dispose()
    }
    return -join ($bytes | ForEach-Object { $alphabet[$_ % $alphabet.Length] })
}

$dbPassword = 'db_' + (New-AlphaNumericSecret 28)
$authSecret = New-AlphaNumericSecret 56
$adminPassword = 'Bend_' + (New-AlphaNumericSecret 24)

@"
POSTGRES_DB=bend
POSTGRES_USER=bend
POSTGRES_PASSWORD=$dbPassword
DATABASE_URL=postgresql://bend:$dbPassword@localhost:5433/bend
AUTH_SECRET=$authSecret
ADMIN_EMAIL=admin@bend.local
ADMIN_PASSWORD=$adminPassword
SITE_URL=http://localhost:3000
"@ | Set-Content -LiteralPath $envFile -Encoding UTF8

Write-Output 'Created .env with random local secrets. Store it privately; values were not printed.'
