@echo off
cd /d "%~dp0"
echo.
echo  Vogelstimmen Platinen-Simulation Rev 2.5
echo  ==========================================
echo  URL:  http://127.0.0.1:8766/
echo.
where python >nul 2>&1 && set PY=python || set PY="C:\Program Files\KiCad\10.0\bin\python.exe"
%PY% "%~dp0serve.py" --port 8766
pause
