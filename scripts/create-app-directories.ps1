$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $root

$directories = @(
    'src\lib\db',
    'src\data',
    'src\components\admin',
    'src\components\site',
    'src\app\admin\login',
    'src\app\admin\content',
    'src\app\admin\content\[id]',
    'src\app\admin\products',
    'src\app\admin\products\[id]',
    'src\app\admin\series',
    'src\app\admin\series\[id]',
    'src\app\admin\documents',
    'src\app\admin\documents\[id]',
    'src\app\admin\media',
    'src\app\admin\inquiries',
    'src\app\admin\inquiries\[id]',
    'src\app\api\admin\upload',
    'src\app\api\admin\media\[id]',
    'src\app\api\inquiries',
    'public\uploads\series',
    'public\documents',
    'docs'
)

foreach ($directory in $directories) {
    New-Item -ItemType Directory -Force -Path $directory | Out-Null
}

Write-Output "Created $($directories.Count) application directories."
