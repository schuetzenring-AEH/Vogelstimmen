# Local HTTP server without Python (Windows PowerShell)
# Usage: powershell -ExecutionPolicy Bypass -File serve.ps1
# Or:    START.bat

$ErrorActionPreference = 'Stop'

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Split-Path -Parent $ScriptDir
if (-not (Test-Path (Join-Path $Root 'showcase\index.html'))) {
  if (Test-Path (Join-Path $ScriptDir 'showcase\index.html')) {
    $Root = $ScriptDir
  } else {
    Write-Host 'ERROR: showcase\index.html not found.' -ForegroundColor Red
    Write-Host 'Put this script in showcase\ or next to the showcase folder.'
    pause
    exit 1
  }
}

$ports = @(8877, 8878, 8879, 8880)
$port = $null
$listener = $null

foreach ($p in $ports) {
  try {
    $listener = New-Object System.Net.HttpListener
    $prefix = "http://127.0.0.1:$p/"
    $listener.Prefixes.Add($prefix)
    $listener.Start()
    $port = $p
    break
  } catch {
    if ($listener) { try { $listener.Close() } catch {} }
    $listener = $null
  }
}

if (-not $listener) {
  Write-Host 'ERROR: No free port (8877-8880).' -ForegroundColor Red
  Write-Host 'Close other programs or reboot.'
  pause
  exit 1
}

$url = "http://127.0.0.1:$port/showcase/"
$sim = "http://127.0.0.1:$port/simulation/"
$simMobile = "http://127.0.0.1:$port/sim-app/"
Write-Host ''
Write-Host '========================================================' -ForegroundColor DarkYellow
Write-Host ' Vogelstimmen MBSE Showcase' -ForegroundColor Yellow
Write-Host '========================================================' -ForegroundColor DarkYellow
Write-Host ''
Write-Host " Root:   $Root"
Write-Host " URL:    $url"
Write-Host " Sim:    $sim"
Write-Host " Mobile: $simMobile"
Write-Host ''
Write-Host ' Keep this window OPEN.' -ForegroundColor Green
Write-Host ' Stop: Ctrl+C or close window.'
Write-Host '========================================================' -ForegroundColor DarkYellow
Write-Host ''

Start-Process $url

$mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.htm'  = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.md'   = 'text/markdown; charset=utf-8'
  '.txt'  = 'text/plain; charset=utf-8'
  '.svg'  = 'image/svg+xml'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.gif'  = 'image/gif'
  '.webp' = 'image/webp'
  '.webmanifest' = 'application/manifest+json'
  '.pdf'  = 'application/pdf'
  '.csv'  = 'text/csv; charset=utf-8'
  '.zip'  = 'application/zip'
  '.ico'  = 'image/x-icon'
  '.woff' = 'font/woff'
  '.woff2'= 'font/woff2'
  '.map'  = 'application/json'
}

function Get-SafePath([string]$urlPath) {
  $rel = [Uri]::UnescapeDataString($urlPath)
  if ($rel.StartsWith('/')) { $rel = $rel.Substring(1) }
  if ([string]::IsNullOrWhiteSpace($rel)) { $rel = 'showcase/index.html' }
  $q = $rel.IndexOf('?')
  if ($q -ge 0) { $rel = $rel.Substring(0, $q) }
  $full = [System.IO.Path]::GetFullPath((Join-Path $Root ($rel -replace '/', [IO.Path]::DirectorySeparatorChar)))
  $rootFull = [System.IO.Path]::GetFullPath($Root)
  if (-not $full.StartsWith($rootFull, [StringComparison]::OrdinalIgnoreCase)) {
    return $null
  }
  if (Test-Path $full -PathType Container) {
    $idx = Join-Path $full 'index.html'
    if (Test-Path $idx) { return $idx }
    return $null
  }
  if (Test-Path $full -PathType Leaf) { return $full }
  return $null
}

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response
    $bytes = $null
    $code = 200
    $type = 'text/plain; charset=utf-8'
    try {
      $path = Get-SafePath $req.Url.AbsolutePath
      if (-not $path) {
        $code = 404
        $bytes = [Text.Encoding]::UTF8.GetBytes(('404 Not Found: ' + $req.Url.AbsolutePath))
      } else {
        $ext = [IO.Path]::GetExtension($path).ToLowerInvariant()
        if ($mime.ContainsKey($ext)) { $type = $mime[$ext] } else { $type = 'application/octet-stream' }
        $bytes = [IO.File]::ReadAllBytes($path)
      }
    } catch {
      $code = 500
      $bytes = [Text.Encoding]::UTF8.GetBytes(('500 ' + $_.Exception.Message))
      Write-Host ('ERR ' + $req.Url.AbsolutePath + ' -> ' + $_.Exception.Message) -ForegroundColor Red
    }
    try {
      $res.StatusCode = $code
      $res.ContentType = $type
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } catch {
      Write-Host ('WRITE ERR: ' + $_.Exception.Message) -ForegroundColor Red
    } finally {
      try { $res.OutputStream.Close() } catch {}
      try { $res.Close() } catch {}
    }
  }
} finally {
  try { $listener.Stop(); $listener.Close() } catch {}
}
