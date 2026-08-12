# Vogelstimmen für WT588D konvertieren (16 kHz Mono WAV)
param(
    [Parameter(Mandatory = $true)]
    [string]$InputDir,

    [Parameter(Mandatory = $true)]
    [string]$OutputDir
)

$extensions = @(".mp3", ".wav", ".ogg", ".flac", ".m4a")

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    Write-Error "ffmpeg nicht gefunden. Bitte installieren: https://ffmpeg.org/download.html"
    exit 1
}

if (-not (Test-Path $InputDir)) {
    Write-Error "Eingabeordner nicht gefunden: $InputDir"
    exit 1
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$files = Get-ChildItem -Path $InputDir -File |
    Where-Object { $extensions -contains $_.Extension.ToLower() } |
    Sort-Object Name |
    Select-Object -First 8

if ($files.Count -eq 0) {
    Write-Error "Keine Audiodateien in $InputDir gefunden."
    exit 1
}

$i = 1
foreach ($file in $files) {
    $out = Join-Path $OutputDir ("vogel{0}.wav" -f $i)
    Write-Host "[$i/8] $($file.Name) -> $(Split-Path $out -Leaf)"
    & ffmpeg -y -i $file.FullName -ar 16000 -ac 1 -sample_fmt s16 $out 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Error "ffmpeg fehlgeschlagen fuer $($file.Name)"
        exit 1
    }
    $i++
}

Write-Host ""
Write-Host "Fertig: $($files.Count) Datei(en) in $OutputDir"
Write-Host "Weiter mit WT588D-Tool: docs/wt588d-konfiguration.md"
