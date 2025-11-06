@echo off
REM AutomonX Stop Script
REM Stops all AutomonX processes

echo ========================================
echo  AutomonX Stop Script
echo ========================================
echo.

echo Stopping Node/Metro processes...
taskkill /F /IM node.exe 2>nul
if errorlevel 1 (
    echo No Node processes found
) else (
    echo Node/Metro processes stopped
)
echo.

echo ========================================
echo All AutomonX processes stopped
echo ========================================
pause
