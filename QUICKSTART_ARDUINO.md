# 🚀 Quick Start: Connect Arduino to AutomonX App

## Simple 3-Step Setup

### Step 1: Check Arduino is Sending Data

1. **Connect Arduino** via USB to your PC
2. **Open Arduino IDE** → Tools → Serial Monitor
3. **Set baud rate** to 9600
4. **Verify** you see data streaming like:
   ```
   Temp1(DHT22):25.5,Humidity:60.2,Air(CO2/NH3/Benzene):350.2ppm...
   ```

**If no data appears:**
- Check Arduino is powered on
- Verify USB cable is connected
- Upload your Arduino sketch again
- Check correct COM port is selected in Arduino IDE

---

### Step 2: Start the WebSocket Bridge

**Option A: Using Python (Recommended)**

Open PowerShell in project folder:

```powershell
# Start the bridge
npm run py-bridge
```

**Option B: Using Node.js**

```powershell
npm run serial-bridge
```

**You should see:**
```
[py-bridge] Auto-detected port: COM3 - Arduino Uno
[py-bridge] Opening serial port COM3
[py-bridge] WebSocket server started on ws://192.168.11.18:3001
[py-bridge] Serial bridge ready! Clients can connect
```

**Note the WebSocket URL** (e.g., `ws://192.168.11.18:3001`) - you'll need this!

**⚠️ Keep this terminal window open!** The bridge must stay running.

---

### Step 3: Configure the App

1. **Start the React Native app**:
   ```powershell
   # In a NEW terminal (keep bridge running in first terminal)
   npx expo start --localhost
   adb reverse tcp:8081 tcp:8081
   adb reverse tcp:19000 tcp:19000
   ```

2. **Open app** on your phone (exp://localhost:8081 in Expo Go)

3. **Go to Settings** (tap hamburger menu ☰ → Settings)

4. **Configure Arduino Connection**:
   - Find the "🔌 Arduino Connection" section
   - Enter WebSocket URL:
     - **If phone on WiFi**: `ws://192.168.11.18:3001` (use YOUR PC's IP)
     - **If phone via USB**: `ws://127.0.0.1:3001` (after `adb reverse tcp:3001 tcp:3001`)
   - Tap **"Save URL"**
   - Toggle **"Enable Arduino Connection"** to ON

5. **Go to Dashboard** → You should see real-time sensor data! 🎉

---

## How to Get Your PC's IP Address

```powershell
ipconfig | findstr IPv4
```

Example output:
```
IPv4 Address. . . . . . . . . . . : 192.168.11.18
```

Use this IP in the WebSocket URL: `ws://192.168.11.18:3001`

---

## Using ADB Reverse (USB Only)

If your phone is connected via USB debugging:

```powershell
# Forward bridge port to phone
adb reverse tcp:3001 tcp:3001

# Then in app settings use:
ws://127.0.0.1:3001
# or
ws://localhost:3001
```

This makes your PC's port 3001 appear as localhost on the phone!

---

## Troubleshooting

### Bridge won't start

```powershell
# Install Python dependencies
python -m pip install pyserial websockets
```

### "COM port not found"

The bridge auto-detects Arduino. If it fails, create `scripts/bridge.env`:

```env
COM_PORT=COM3
```

Replace `COM3` with your actual Arduino port (check Device Manager).

### App shows "Disconnected"

1. **Check bridge is running** (look for "WebSocket server started" message)
2. **Verify URL** is correct in Settings
3. **Ensure toggle is ON** (Enable Arduino Connection)
4. **Check firewall** - allow Python/Node through Windows Defender
5. **Test connection**: Go to Dashboard and tap "Connect" button

### App shows "Error"

1. **Wrong URL format** - must start with `ws://` (not `http://`)
2. **Wrong IP** - use your PC's actual IP, not 127.0.0.1 (unless using ADB reverse)
3. **Phone and PC not on same network** (if using WiFi)

---

## Complete Workflow (All Commands)

```powershell
# Terminal 1: Start WebSocket Bridge
cd D:\7th_Semester_Project\AutomonX_app
npm run py-bridge
# Note the ws://... URL shown

# Terminal 2: Start React Native Metro
npx expo start --localhost
adb reverse tcp:8081 tcp:8081
adb reverse tcp:19000 tcp:19000
adb reverse tcp:3001 tcp:3001  # Optional: if using USB debugging

# On Phone (Expo Go):
# Open exp://localhost:8081
# Settings → Arduino Connection
#   - WebSocket URL: ws://YOUR_PC_IP:3001 (or ws://localhost:3001 if using ADB reverse)
#   - Save URL
#   - Toggle ON
# Dashboard → See live data!
```

---

## What You Should See

### In Bridge Terminal:
```
[py-bridge] Client connected
[py-bridge] Broadcasting: Temp1(DHT22):25.3,Humidity:65.2...
```

### In App Dashboard:
- 🔌 Arduino Live Connection: Status: **connected** ✅
- Temperature cards updating every 2 seconds
- Humidity, Gas, Motion sensors showing live values
- Alerts when thresholds exceeded

---

## Need More Help?

See the complete guide: **[ARDUINO_WEBSOCKET_SETUP.md](./ARDUINO_WEBSOCKET_SETUP.md)**

That file has:
- Detailed Arduino code examples
- Advanced configuration options
- Firestore cloud logging setup
- Data format specifications
- Complete troubleshooting guide
