# AutomonX - Quick Start Guide

Complete guide for running AutomonX app with live Arduino sensor data streaming via Firebase.

## 🚀 ONE-CLICK START (Recommended)

**To Start Everything:**
```
Double-click: start-automonx.bat
```

**To Stop Everything:**
```
Double-click: stop-automonx.bat
```

**What it does automatically:**
1. ✅ Checks ADB device connection
2. ✅ Sets up port forwarding (8081, 19000)
3. ✅ Starts Arduino → Firebase bridge (separate window)
4. ✅ Starts Metro bundler (separate window)
5. ✅ Shows instructions

Then open Expo Go on your phone → `exp://localhost:8081`

**Quick Reference:** See `QUICKSTART.md` for a one-page summary

---

## 📋 Prerequisites (One-Time Setup)

### Required:
- ✅ Windows 10/11
- ✅ Node.js 18+ and npm (`npm install` already done)
- ✅ Expo Go on Android phone (from Play Store)
- ✅ Android SDK Platform-Tools (adb in PATH)
- ✅ USB debugging enabled on phone
- ✅ Python 3.10+ with packages: `pyserial`, `websockets`, `google-cloud-firestore`
- ✅ Arduino UNO connected via USB (COM7)
- ✅ Firebase project setup with Firestore enabled

### Firebase Setup (One-Time):
1. Service account key downloaded: `serviceAccountKey.json` in project root
2. Firestore database created in Firebase Console
3. Cloud Firestore API enabled

---

## 🔧 Manual Setup (If Not Using Batch File)

### Step 1: ADB Setup
```powershell
# Check device connected
adb devices

# Setup port forwarding
adb reverse tcp:8081 tcp:8081
adb reverse tcp:19000 tcp:19000
```

### Step 2: Start Arduino Bridge
```powershell
# In Terminal 1
python scripts\py_serial_bridge.py
```

Expected output:
```
[py-bridge] Using forced COM port from env: COM7
[py-bridge] Serial port opened: COM7
[py-bridge] Firestore client initialized for project: automonx-917f4
[py-bridge] Firestore write ok for device default-device
```

### Step 3: Start Metro
```powershell
# In Terminal 2
npx expo start --localhost
```

### Step 4: Open App
On your phone in Expo Go: `exp://localhost:8081`

---

## 4) Reverse the ports with ADB
With your phone connected over USB and USB debugging allowed:
```powershell
adb devices             # ensure your device shows as "device"
adb reverse tcp:8081 tcp:8081
adb reverse tcp:19000 tcp:19000
```

## 5) Open the app on the phone
In Expo Go → Enter URL manually:
```
exp://localhost:8081
```
If that doesn’t load, try:
```
exp://127.0.0.1:8081
```

---

## Arduino Integration: Firebase Direct Method (RECOMMENDED)

Stream UNO sensor readings directly to Firebase - the app reads automatically!

### Quick Setup (3 Steps):

**1. Download Firebase Service Account Key:**
   - Visit: https://console.firebase.google.com/u/0/project/automonx-917f4/settings/serviceaccounts/adminsdk
   - Click "Generate new private key" → "Generate key"
   - Rename downloaded file to: `serviceAccountKey.json`
   - Place in: `D:\7th_Semester_Project\AutomonX_app\serviceAccountKey.json`

**2. Run the Python Bridge:**
   ```powershell
   # Bridge is already configured in scripts/bridge.env
   python scripts\py_serial_bridge.py
   ```
   
   Expected output:
   ```
   [py-bridge] Using forced COM port from env: COM7
   [py-bridge] Serial port opened: COM7
   [py-bridge] Firestore client initialized for project: automonx-917f4
   [py-bridge] SERIAL: 📊 Data: Temp(DHT22): 29.3°C...
   [py-bridge] Firestore write ok for device default-device
   ```

**3. App Automatically Receives Data!**
   - App reads from: `devices/default-device/latest`
   - Real-time updates every 2 seconds
   - No WebSocket configuration needed
   - Works from anywhere (not just USB/LAN)

**Verify in Firebase Console:**
https://console.firebase.google.com/u/0/project/automonx-917f4/firestore/databases/-default-/data

See detailed setup: `FIREBASE_SETUP.md`

---

## Optional: WebSocket Method (Alternative)

If you prefer WebSocket instead of Firebase:

1) Configure the bridge at `scripts/bridge.env`:
```
WS_PORT=3001
DEVICE_ID=default-device
COM_PORT=COM7
```

2) Run bridge:
```powershell
python scripts\py_serial_bridge.py
```

3) In app Settings → Arduino Connection:
```
ws://<YOUR_PC_LAN_IP>:3001
```

4) Reverse WebSocket port:
```powershell
adb reverse tcp:3001 tcp:3001
```

---
Tap Connect to see live updates.

---

## 📡 How It Works - Data Flow

```
Arduino UNO (COM7)
    ↓ Serial USB
Python Bridge (py_serial_bridge.py)
    ↓ Parses sensor data
Firebase Firestore (automonx-917f4)
    ↓ Real-time sync
React Native App
    ↓ useSensorData hook
DashboardScreen displays live data
```

**Data Structure in Firebase:**
```
devices/
  └── default-device/
      ├── latest: {dht22, lm35, mq135, mq2, mq7, flame, ...}
      ├── updatedAt: [timestamp]
      └── readings/
          └── [auto-generated timestamped documents]
```

**Configuration:**
- Bridge config: `scripts/bridge.env`
- Firebase key: `serviceAccountKey.json` (in project root)
- Arduino port: COM7 (configured in bridge.env)
- Firestore path: `devices/default-device/latest`

---

## 🐛 Troubleshooting

• Device not detected (adb devices shows nothing/unauthorized)
  - Replug USB; unlock phone; accept the "Allow USB debugging" prompt
  - Install OEM USB drivers if needed

• Expo Go shows “Something went wrong”
  - Clear Expo Go cache/data (Android Settings → Apps → Expo Go → Storage → Clear Data and Clear Cache)
  - Ensure Metro shows `exp://127.0.0.1:8081`
  - Reapply reverse: `adb reverse tcp:8081 tcp:8081` and `adb reverse tcp:19000 tcp:19000`

• Port 8081 already in use
```powershell
taskkill /F /IM node.exe
```
Then restart Metro.

• Tunnel timeouts
  - Prefer USB (localhost) or LAN; tunnels can be blocked by firewall/ISP
  - If needed later: `npx expo start --tunnel`

• COM port access denied when running the Python bridge
  - Close Arduino Serial Monitor/Plotter and any serial tools
  - Check Device Manager for the COM port (e.g., COM7)
  - Set `COM_PORT=COM7` in `scripts/bridge.env` if auto‑detect is wrong

• Version warnings in terminal
  - Notices about expected versions (e.g., react-native-worklets, @types/react) are safe to ignore for Expo Go development

---

## What you should see
- Dashboard with project title:
  "AutomonX‑VLSI: Edge‑Intelligent Home Safety System with Hardware‑Optimized Sensor Data Compression and LoRa Communication"
- Professional UI with two‑column sensor grid and robust text truncation
- Live WebSocket updates if the Python bridge is connected

---

## Optional npm scripts
Add convenience scripts to `package.json` if desired:
```json
{
  "scripts": {
    "start:local": "expo start --localhost --clear",
    "start:lan": "expo start --lan",
    "start:tunnel": "expo start --tunnel",
    "py-bridge": "python scripts/py_serial_bridge.py"
  }
}
```
