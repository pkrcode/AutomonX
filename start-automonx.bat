@echo off
setlocal enableextensions

REM Always run from this script's folder (project root)
pushd "%~dp0"

title AutomonX Starter
echo ========================================
echo  AutomonX Starter
echo ========================================
echo.

REM Android SDK / ADB
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
set "ADB=%ANDROID_HOME%\platform-tools\adb.exe"

REM Ensure ADB exists (avoid code-block parsing issues)
if not exist "%ADB%" goto adb_warning
goto adb_checked

:adb_warning
echo (Warning) ADB not found at "%ADB%"
echo Make sure Android Platform Tools are installed.
echo.

:adb_checked

echo [1/4] Restarting ADB server...
"%ADB%" kill-server 2>nul
timeout /t 1 /nobreak >nul
"%ADB%" start-server 2>nul
echo ADB server restarted
echo.

echo [2/4] Choose a run mode:
echo   [E] Expo Go (start Metro only)
echo   [D] Dev Build (build+install app with proper icon)
echo   [S] Start Arduino Serial Bridge (Node)
echo   [Q] Quit
set /p CHOICE=Enter choice [E/D/S/Q]: 
if "%CHOICE%"=="" set CHOICE=E
for %%I in ("%CHOICE%") do set CHOICE=%%~I
set CHOICE=%CHOICE:~0,1%
for %%A in (e E d D s S q Q) do if "%CHOICE%"=="%%A" goto choice_ok
echo Invalid choice. Defaulting to E.
set CHOICE=E
:choice_ok
echo.

REM Always try ADB reverse for common ports (ignore failures)
echo [3/4] Configuring ADB reverse (8081 Metro, 19000/19001 Expo dev, 3001 WS bridge)...
"%ADB%" reverse tcp:8081 tcp:8081 2>nul
"%ADB%" reverse tcp:19000 tcp:19000 2>nul
"%ADB%" reverse tcp:19001 tcp:19001 2>nul
"%ADB%" reverse tcp:3001 tcp:3001 2>nul
echo Reverse attempted (ok if no device connected)
echo.

if /I "%CHOICE%"=="E" goto mode_expo_go
if /I "%CHOICE%"=="D" goto mode_dev_build
if /I "%CHOICE%"=="S" goto mode_serial_bridge
if /I "%CHOICE%"=="Q" goto done

:mode_expo_go
echo ========================================
echo  Expo Go Mode
echo ========================================
echo - Starts Metro bundler (clears cache)
echo - Use Expo Go app to scan the QR code
echo.
echo [4/4] Starting Metro bundler...
start "AutomonX Metro" cmd /k "npx expo start --clear"
timeout /t 3 /nobreak >nul
echo Metro started in a separate window.
echo.
echo NEXT STEPS:
echo - Open Expo Go on your phone and scan the QR in the Metro window
echo - To reload: press 'r' in Metro or shake device -> Reload
echo - To stop: close the Metro window or run stop-automonx.bat
echo.
goto done

:mode_serial_bridge
echo ========================================
echo  Arduino Serial -> WS Bridge
echo ========================================
echo - Reads Arduino UNO Serial (9600 baud)
echo - Exposes lines at ws://localhost:3001 for the app to consume
echo - Ensure your UNO is connected; set COM_PORT env var to force a port (e.g., COM5)
echo.
start "AutomonX Bridge" cmd /k "set WS_PORT=3001 && npm run serial-bridge"
echo Bridge started in separate window. Now choose [E] to start Metro and scan in Expo Go.
echo.
goto done

:mode_dev_build
echo ========================================
echo  Dev Build Mode (expo run:android)
echo ========================================
echo - Builds and installs the Android app on your device/emulator
echo - Uses app.json (icon/adaptiveIcon) so your launcher icon appears on Home screen
echo - This may take several minutes the first time
echo.
echo Checking connected devices (adb devices)...
"%ADB%" devices
echo.
echo Starting build and install now...
call npx expo run:android
set BUILD_EXIT=%ERRORLEVEL%
echo.
if not "%BUILD_EXIT%"=="0" (
	echo (Error) Dev build failed with exit code %BUILD_EXIT%.
	echo You can retry this mode once issues are resolved.
	goto done
)
echo ✓ Dev build completed. If the app didn't auto-open, find "AutomonX-VLSI" on your device Home screen.
echo.
echo Tips:
echo - If the launcher icon didn't update, uninstall previous dev app and rerun this mode.
echo - Metro starts automatically for dev builds; if not, you can run Expo Go mode as well.
echo.
goto done

:done
echo ========================================
echo  Finished
echo ========================================
popd
endlocal
exit /b 0
