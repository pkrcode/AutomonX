@echo off
REM AutomonX Health Check Script
REM Verifies that all services are running correctly

echo ========================================
echo  AutomonX Health Check
echo ========================================
echo.

REM Set Android SDK path
set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
set ADB=%ANDROID_HOME%\platform-tools\adb.exe

echo [1/3] Checking Metro Bundler (port 8081)...
netstat -ano | findstr ":8081.*LISTENING" >nul
if %ERRORLEVEL%==0 (
    echo ✓ Metro is RUNNING on port 8081
) else (
    echo ✗ Metro NOT running on port 8081
    echo   Run start-automonx.bat to start it
)
echo.

echo [2/3] Checking ADB Device Connection...
"%ADB%" devices 2>nul | findstr /R /C:"device$" >nul
if %ERRORLEVEL%==0 (
    echo ✓ ADB device CONNECTED
    "%ADB%" devices
) else (
    echo ✗ No ADB device detected
    echo   Connect your phone via USB and enable USB debugging
)
echo.

echo [3/3] Checking ADB Port Forwarding...
"%ADB%" reverse --list 2>nul | findstr "tcp:8081\|tcp:19000" >nul
if %ERRORLEVEL%==0 (
    echo ✓ ADB reverse configured:
    "%ADB%" reverse --list 2>nul | findstr "tcp:8081\|tcp:19000"
) else (
    echo ✗ ADB reverse NOT configured
    echo   Run start-automonx.bat to configure it
)
echo.

echo ========================================
echo Health Check Complete
echo ========================================
echo.
echo SUMMARY:
echo - If all checks show ✓, your system is ready!
echo - If any show ✗, follow the instructions above
echo.
echo TO START: .\start-automonx.bat
echo TO STOP:  .\stop-automonx.bat
echo TO CHECK: .\check-automonx.bat
echo.
pause
