# Deploy static GitHub Pages tree (Windows helper)
# Copies showcase, docs, simulation, mbse → /mbse/
# Usage: powershell -ExecutionPolicy Bypass -File tools/deploy_pages.ps1
# Optional: set $env:VOGELSTIMMEN_PAGES_DIR to a staging folder.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
if (-not (Test-Path (Join-Path $root "showcase\index.html"))) {
  $root = Get-Location
}
$site = $env:VOGELSTIMMEN_PAGES_DIR
if (-not $site) { $site = Join-Path $root ".tmp_pages" }

Write-Host "Root: $root"
Write-Host "Site: $site"

if (Test-Path $site) { Remove-Item -Recurse -Force $site }
New-Item -ItemType Directory -Force -Path `
  "$site\showcase", "$site\docs", "$site\simulation", "$site\mbse", `
  "$site\hardware\V3.0\docs", "$site\hardware\V2.5-final\docs" | Out-Null

Copy-Item "$root\index.html" "$site\"
Set-Content "$site\.nojekyll" "" -Encoding Ascii
robocopy "$root\showcase" "$site\showcase" /E /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
robocopy "$root\docs" "$site\docs" /E /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
robocopy "$root\simulation" "$site\simulation" /E /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
robocopy "$root\mbse" "$site\mbse" /E /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
if (Test-Path "$root\hardware\V3.0\docs") {
  robocopy "$root\hardware\V3.0\docs" "$site\hardware\V3.0\docs" /E /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
}
if (Test-Path "$root\hardware\V2.5-final\docs") {
  robocopy "$root\hardware\V2.5-final\docs" "$site\hardware\V2.5-final\docs" /E /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
}
Copy-Item "$root\README.md" "$site\" -ErrorAction SilentlyContinue

Write-Host "Staged Pages tree at $site"
Write-Host "  /showcase/  documentation SPA"
Write-Host "  /mbse/      Impact-Analyse + Präsentation"
Write-Host "  /simulation/ platinen twin"
Write-Host "Push this folder to gh-pages (or use your existing deploy_pages.ps1 and add the mbse robocopy block)."
