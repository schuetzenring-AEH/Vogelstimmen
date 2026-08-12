@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Vogelstimmen MBSE Showcase
echo  Kein Python noetig — Windows PowerShell-Server
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0showcase\serve.ps1"
if errorlevel 1 pause
