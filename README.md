# AutomonX App — Quick Start and Reference

A React Native + Expo application for smart home monitoring and control, with animated controls, smooth navigation, and an Arduino → Python WebSocket bridge for live sensor data.

## Tech stack

- React Native (0.81) + Expo SDK 54
- React Navigation (stack + tabs)
- TypeScript
- react-native-svg (custom vector icons/animations)
- Animated API (RN) for UI animations
- Firebase (shims for Expo Go)
- Python bridge (pyserial + websockets) for Arduino serial data

## Hardware / Physical Components

This project reads real sensor lines from an Arduino over Serial and drives home controls. A typical tested setup includes:

- Microcontroller: Arduino Uno/Nano (or compatible)
- Gas and fire sensors:
  - MQ-2 (LPG/Smoke/Flammable gases)
  - MQ-7 (Carbon Monoxide)
  - Flame sensor module
- Environment sensors:
  - DHT22/AM2302 (Temperature/Humidity)
  - LM35 (Temperature) — optional
- Motion/Security:
  - PIR motion sensor (e.g., HC‑SR501) and/or IR obstacle sensor
- Location (optional): GPS module (e.g., NEO‑6M)
- Actuation & power:
  - 4‑channel relay module (controls fan, light, sprinkler, door lock/solenoid)
  - 12V DC exhaust fan
  - Light/bulb or LED strip
  - 12V DC water pump or solenoid valve for sprinkler
  - Servo/solenoid for door lock (optional)
  - 5V/12V power supply (buck converter as needed)
  - Breadboard, jumper wires, terminal blocks
- Host PC (Windows) running the Python Serial → WebSocket bridge

Adjust names/models to match your exact parts list.

## Key features

- Animated Controls (2-column grid):
  - Fan (12-blade exhaust) — spins when ON
  - Light (bulb with radial glow) — glow when ON; ON status text is green (success)
  - Door lock (door + keyhole) — swing animation on unlock only, with keyhole pulse
  - Sprinkler — animated water sprays when ON
- Theming and dark mode polish, no white flashes on navigation
- Startup Splash: custom lock + threads + border draw + title
- ErrorBoundary guards the splash to avoid startup crashes
- Menu-driven Windows start script (ADB, Metro, Python bridge)
- Automation rules reacting to sensor increases (MQ2/MQ135/MQ7/Flame)

## Project layout (selected files)

- src/screens/main/DashboardScreen.tsx — main dashboard; renders controls and sensors
- src/components/controls/ — FanControl, LightControl, DoorControl, SprinklerControl
- src/components/common/ — Header (logo), SplashIntro, ErrorBoundary
- src/hooks/ — useSensorData, useArduinoWebSocket, useAutomationRules
- src/services/ — DeviceControlService, MockSensorData parser
- scripts/py_serial_bridge.py — Arduino Serial → WebSocket bridge (Python)
- start-automonx.bat — menu-driven startup script (ADB reverse, Bridge, Metro, Dev build)

## Run it (Windows)

Choose one of the modes from the start script:

- I: Expo Go + IoT Bridge (recommended during development)
  - Restarts ADB, sets adb reverse ports
  - Starts Python bridge (WebSocket on ws://localhost:3001)
  - Starts Metro (expo start --clear)
- B: IoT Bridge only (Python)
  - Starts the Python bridge; useful if Metro is already running
- E: Expo Go only (Metro)
- D: Dev Build (expo run:android) — builds and installs an app with the configured adaptive icon

To launch with defaults (interactive):

powershell
.\nstart-automonx.bat


Non-interactive (example, COM3):

powershell
$env:MODE='I'
$env:COM_PORT='COM3'
.\nstart-automonx.bat


Notes:
- If your Arduino IDE Serial Monitor is open, close it (the Python bridge needs exclusive access to the COM port).
- The script auto-creates a .venv and installs pyserial and websockets for the bridge.
- The script will try adb reverse tcp:3001 tcp:3001 so Expo Go on the phone can reach the local bridge over USB.

## Python Arduino bridge

- File: scripts/py_serial_bridge.py
- Detects COM port automatically (or set COM_PORT)
- Serves WebSocket at ws://localhost:3001 (or WS_PORT)
- Broadcasts each serial line as JSON: { type: 'line', text: '...' }
- Optional Firestore writes with throttling (disabled by default)

Manual run (optional):

powershell
.\.venv\Scripts\Activate.ps1
$env:COM_PORT='COM3'
$env:WS_PORT='3001'
python .\scripts\py_serial_bridge.py


## App ↔ Bridge wiring

- Dashboard sets USE_BRIDGE = true and auto-connects to ws://localhost:3001 via useArduinoWebSocket.
- Start script sets up adb reverse to forward from device to PC so the phone (Expo Go) reaches the bridge over USB.

## Automation rules (sensor-driven actions)

- File: src/hooks/useAutomationRules.ts
- Triggered when a sensor shows a meaningful increase (≥10% and ≥1 PPM):
  - MQ2 (flammable gases): turn OFF lights, turn ON fan
  - MQ135 (smoke): turn ON fan
  - MQ7 (CO): turn ON fan
  - Flame detected: turn ON sprinkler, turn OFF lights
- Rules operate on increases vs the last sample; no auto-reset to OFF unless added
- Disabled when preview overrides are active

## Preview overrides (for demos)

- File: src/screens/main/DashboardScreen.tsx
- Flags:
  - PREVIEW_ALL_ON (all controls ON; door unlocked to show animation)
  - PREVIEW_ALL_OFF (all controls OFF; door locked)
- Set both to false for normal, data-driven behavior (default in repo: both false).

## Theming and visuals

- src/components/common/Header.tsx
  - Uses a light circle behind the logo for visibility in dark mode
  - Logo source uses a relative require for reliable bundling: assets/images/logo.png
- Light control ON status is green (colors.success), bulb visual color unchanged
- app.json includes Android adaptive icon config using assets/images/logo.png

## Troubleshooting

- Bridge can’t open COM port
  - Close Arduino IDE Serial Monitor
  - Confirm the correct COM port (e.g., COM3), set $env:COM_PORT accordingly
- App not receiving data
  - Ensure bridge window shows WS listening, and Metro is running
  - Confirm adb reverse tcp:3001 tcp:3001 succeeded (script runs it)
- White flash on navigation
  - NavigationContainer and screen backgrounds are themed; this is already handled
- Launcher icon not updating
  - Uninstall the dev build and re-run Dev Build mode

## Notes

- Expo Go mode won’t create a launcher icon; use Dev Build to install the app with the configured adaptive icon.
- Firebase native modules are shimmed for Expo Go; the bridge is the primary source of live data during development.
