# Arduino WebSocket Integration Guide

## Overview
This guide shows how to stream real-time Arduino sensor data to your AutomonX React Native app using WebSocket.

**Architecture:**
```
Arduino (Serial) → Python/Node Bridge (WebSocket Server) → React Native App (WebSocket Client)
```

---

## Step 1: Arduino Setup

### Option A: Simple Text Format (Current)
Your Arduino should send data via Serial at 9600 baud:

```cpp
void setup() {
  Serial.begin(9600);
  // Initialize your sensors (DHT22, MQ-2, PIR, etc.)
}

void loop() {
  // Read sensors
  float temp = dht.readTemperature();
  float humidity = dht.readHumidity();
  int gas = analogRead(A0);  // MQ-2
  int motion = digitalRead(7); // PIR
  int smoke = analogRead(A1); // MQ-135
  
  // Send in readable format
  Serial.print("📊 Data: Temp(DHT22): ");
  Serial.print(temp);
  Serial.print("°C, Humidity(DHT22): ");
  Serial.print(humidity);
  Serial.print("%, Gas(MQ-2): ");
  Serial.print(gas);
  Serial.print(" ppm, Motion(PIR): ");
  Serial.print(motion);
  Serial.print(", Smoke(MQ-135): ");
  Serial.print(smoke);
  Serial.println(" ppm");
  
  delay(2000); // Update every 2 seconds
}
```

### Option B: JSON Format (Recommended for Production)
```cpp
void loop() {
  // Read sensors
  float temp = dht.readTemperature();
  float humidity = dht.readHumidity();
  int gas = analogRead(A0);
  int motion = digitalRead(7);
  int smoke = analogRead(A1);
  
  // Send as JSON
  Serial.print("{\"temp\":");
  Serial.print(temp);
  Serial.print(",\"humidity\":");
  Serial.print(humidity);
  Serial.print(",\"gas\":");
  Serial.print(gas);
  Serial.print(",\"motion\":");
  Serial.print(motion);
  Serial.print(",\"smoke\":");
  Serial.print(smoke);
  Serial.println("}");
  
  delay(2000);
}
```

**Check Arduino is working:**
1. Connect Arduino via USB
2. Open Arduino IDE → Tools → Serial Monitor
3. Set baud rate to 9600
4. You should see data streaming every 2 seconds

---

## Step 2: Find Your Arduino COM Port

**Windows:**
```powershell
# Method 1: Device Manager
# Open Device Manager → Ports (COM & LPT)
# Look for "Arduino Uno (COM3)" or similar

# Method 2: PowerShell
Get-WmiObject Win32_SerialPort | Select-Object Name,DeviceID

# Method 3: Let the script auto-detect (recommended)
# The bridge script will auto-detect Arduino
```

**Example output:**
```
COM3 - Arduino Uno
COM5 - USB Serial Device
```

---

## Step 3: Configure Bridge Environment (Optional)

Create `scripts/bridge.env` if you need to override defaults:

```env
# Force specific COM port (optional, auto-detects if not set)
COM_PORT=COM3

# WebSocket port (default: 3001)
WS_PORT=3001

# Device identifier for Firestore (optional)
DEVICE_ID=home-arduino-01
```

**Note:** If you don't create this file, the bridge will auto-detect the Arduino port.

---

## Step 4: Run the WebSocket Bridge

### Option A: Python Bridge (Recommended - Better for Windows)

```powershell
# Start the bridge
npm run py-bridge

# Or directly:
python scripts/py_serial_bridge.py
```

**Expected output:**
```
[py-bridge] Loaded env from scripts/bridge.env
[py-bridge] Auto-detected port: COM3 - Arduino Uno
[py-bridge] Opening serial port COM3
[py-bridge] WebSocket server started on ws://192.168.11.18:3001
[py-bridge] Serial bridge ready! Clients can connect to:
[py-bridge]   - ws://192.168.11.18:3001 (LAN)
[py-bridge]   - ws://localhost:3001 (local)
```

### Option B: Node.js Bridge (Alternative)

```powershell
npm run serial-bridge
```

**Leave this terminal running!** It must stay open to stream data.

---

## Step 5: Update Your App Settings

### Find Your Computer's IP Address

```powershell
# Get your local IP
ipconfig | findstr IPv4

# Example output: IPv4 Address. . . . . . . . . . . : 192.168.11.18
```

### Update SettingsScreen WebSocket URL

1. Open the AutomonX app on your phone
2. Navigate to **Settings** (hamburger menu → Settings)
3. Find the "Arduino WebSocket URL" field
4. Enter one of these:

**If testing on same computer (emulator/browser):**
```
ws://localhost:3001
```

**If testing on phone (USB debugging):**
```
ws://10.0.2.2:3001  # For Android emulator
ws://127.0.0.1:3001 # If using ADB reverse
```

**If testing on phone (LAN/WiFi):**
```
ws://192.168.11.18:3001  # Replace with YOUR computer's IP
```

4. Toggle "Enable Arduino Connection" to **ON**
5. App will connect and start receiving real-time data!

---

## Step 6: Verify Connection

### In the Bridge Terminal:
You should see:
```
[py-bridge] Client connected
[py-bridge] Broadcasting: {"temp":25.3,"humidity":60.5,...}
```

### In Your App:
1. Open Dashboard screen
2. Look for sensor cards updating in real-time
3. Temperature, humidity, gas levels should show live data
4. Motion detection should trigger alerts

### Troubleshooting Connection Issues:

**Problem: "WebSocket connection failed"**
```powershell
# Check if bridge is running
# Look for this in the bridge terminal:
[py-bridge] WebSocket server started on ws://...

# Check firewall (allow Python/Node through Windows Firewall)
# Windows will prompt on first run - click "Allow"
```

**Problem: "No data received"**
```powershell
# Check Arduino is sending data
# Open Arduino IDE Serial Monitor and verify output

# Check COM port
# In bridge terminal, verify correct port detected:
[py-bridge] Auto-detected port: COM3
```

**Problem: "Connection timeout on phone"**
```powershell
# Ensure phone and PC are on same WiFi network
# Ping test from PC:
ping <PHONE_IP>

# Use your PC's actual LAN IP, not localhost
# Find it: ipconfig | findstr IPv4
```

---

## Complete Workflow (Quick Reference)

```powershell
# Terminal 1: Start WebSocket Bridge
cd D:\7th_Semester_Project\AutomonX_app
npm run py-bridge
# Note the WebSocket URL shown (e.g., ws://192.168.11.18:3001)

# Terminal 2: Start React Native App
npx expo start --localhost
adb reverse tcp:8081 tcp:8081
adb reverse tcp:19000 tcp:19000
# Open exp://localhost:8081 in Expo Go

# On Phone:
# 1. Open AutomonX app
# 2. Go to Settings
# 3. Enter WebSocket URL: ws://<YOUR_PC_IP>:3001
# 4. Toggle "Enable Arduino Connection" ON
# 5. Go to Dashboard - see live data!
```

---

## Data Flow Explanation

```
┌─────────────┐      Serial (9600 baud)      ┌──────────────────┐
│   Arduino   │ ──────────────────────────→ │  Python Bridge   │
│  (Sensors)  │   USB Cable (COM3)           │  (Port 3001)     │
└─────────────┘                              └──────────────────┘
                                                       │
                                              WebSocket (JSON)
                                                       ↓
                                             ┌──────────────────┐
                                             │  React Native    │
                                             │  App (Phone)     │
                                             │  useArduinoWS    │
                                             └──────────────────┘
                                                       │
                                                   Displays
                                                       ↓
                                             ┌──────────────────┐
                                             │  Dashboard UI    │
                                             │  (Live Sensors)  │
                                             └──────────────────┘
```

---

## Advanced: ADB Reverse for USB Testing

If your phone is connected via USB (not WiFi), use ADB port forwarding:

```powershell
# Forward WebSocket port from PC to phone
adb reverse tcp:3001 tcp:3001

# Now use in app settings:
ws://localhost:3001
# or
ws://127.0.0.1:3001
```

This makes your PC's port 3001 accessible as localhost on the phone!

---

## Firestore Integration (Optional)

The Python bridge can also push data to Firebase Firestore for cloud storage and history.

1. Download your Firebase service account key JSON
2. Set environment variable:
   ```powershell
   $env:GOOGLE_APPLICATION_CREDENTIALS="D:\path\to\serviceAccountKey.json"
   ```
3. Install: `pip install google-cloud-firestore`
4. The bridge will automatically start logging to Firestore

---

## Example App Code (Already Implemented)

Your app already has the WebSocket client built in:

```typescript
// In DashboardScreen.tsx
import { useArduinoWebSocket } from '@hooks/useArduinoWebSocket';

const { status, latest, connect, disconnect } = useArduinoWebSocket(
  arduinoUrl,  // from settings, e.g. ws://192.168.11.18:3001
  autoConnect
);

// 'latest' contains real-time sensor data:
// { temperature, humidity, gas, motion, smoke, timestamp }
```

---

## Testing Checklist

- [ ] Arduino connected via USB
- [ ] Arduino Serial Monitor shows data at 9600 baud
- [ ] Identified correct COM port (e.g., COM3)
- [ ] Python dependencies installed (`pyserial`, `websockets`)
- [ ] Bridge running: `npm run py-bridge`
- [ ] Bridge shows: "WebSocket server started on ws://..."
- [ ] Bridge shows: "Client connected" when app connects
- [ ] App Settings: WebSocket URL configured
- [ ] App Settings: "Enable Arduino Connection" toggled ON
- [ ] Dashboard shows live sensor data updating
- [ ] No errors in Metro bundler or bridge terminal

---

## Common Issues & Solutions

### Bridge crashes immediately
```powershell
# Install dependencies
pip install pyserial websockets

# Check Python version (3.7+)
python --version
```

### "Port COM3 not found"
```powershell
# List all ports
python -c "import serial.tools.list_ports; print(list(serial.tools.list_ports.comports()))"

# Or force a specific port in scripts/bridge.env:
COM_PORT=COM5
```

### App can't connect from phone
```powershell
# Check firewall - allow Python through Windows Defender
# Use PC's LAN IP, not 127.0.0.1
# Ensure phone and PC on same WiFi network

# Test from PC browser:
# Open http://<YOUR_PC_IP>:3001/health
# Should return: {"ok":true}
```

### Data not parsing correctly
```powershell
# Check Arduino output format matches expected pattern
# Look in bridge terminal for raw data:
[py-bridge] Broadcasting: ...

# Check parseArduinoData() in src/services/MockSensorData.ts
# Update regex patterns if needed
```

---

## Next Steps

1. **Test the setup** using this guide
2. **Customize Arduino code** for your specific sensors
3. **Add alert thresholds** in Settings screen
4. **Enable Firestore** for cloud logging
5. **Set up LoRa** for long-range communication (advanced)

---

## Support

If you encounter issues:
1. Check both terminals (Metro + Bridge) for error messages
2. Verify Arduino Serial Monitor shows data
3. Test WebSocket connection: `ws://localhost:3001` in browser
4. Check Windows Firewall settings
5. Ensure all dependencies are installed

**Bridge is the key component** - it must stay running to stream data!
