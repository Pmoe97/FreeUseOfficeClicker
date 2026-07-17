@echo off
title FreeUseOfficeClicker Launcher
cd /d "%~dp0"
echo.
echo   Starting FreeUseOfficeClicker local launcher...
echo   (A control panel will open in your browser. Keep this window open while you play.)
echo.
node local-dev\launcher.mjs
echo.
echo   Launcher stopped. Press any key to close.
pause >nul
