# AutomonX - Quick Reference

## 🎯 To Run the App (Every Time)

### Option 1: ONE-CLICK (Recommended)
```
Double-click: start-automonx.bat
```

### Option 2: Manual
```powershell
# Terminal 1: Arduino Bridge
python scripts\py_serial_bridge.py

# Terminal 2: Metro
npx expo start --localhost

# Terminal 3: ADB Setup
adb reverse tcp:8081 tcp:8081
adb reverse tcp:19000 tcp:19000
```

Then on phone: Expo Go → `exp://localhost:8081`

---

## 📋 What's Running

1. **Arduino UNO** (COM7) → Sends sensor data via USB
2. **Python Bridge** → Reads serial, writes to Firebase
3. **Firebase Firestore** → Stores data in `devices/default-device/latest`
4. **Metro Bundler** → Serves React Native app on port 8081
5. **Expo Go App** → Reads from Firebase and displays live data

---

## ⚙️ Configuration Files

| File | Purpose |
|------|---------|
| `start-automonx.bat` | One-click startup script |
| `scripts/bridge.env` | Arduino COM port, Firebase config |
| `serviceAccountKey.json` | Firebase Admin SDK credentials |
| `run.md` | Full documentation (this is the summary) |

---

## 🔗 Important Links

- Firebase Console: https://console.firebase.google.com/u/0/project/automonx-917f4
- Firestore Data: https://console.firebase.google.com/u/0/project/automonx-917f4/firestore
- Metro URL: exp://127.0.0.1:8081

---

## 📊 Live Sensor Data

The app displays real-time data from:
- DHT22: Temperature & Humidity
- LM35: Temperature
- MQ135: Air Quality (CO2/NH3/Benzene)
- MQ2: Gas Detection (LPG/Smoke/Methane)
- MQ7: Carbon Monoxide
- Flame Sensor: Fire Detection

Updates every ~2 seconds automatically via Firebase real-time sync.

---

## 🚨 Quick Fixes

**App not loading?**
```powershell
adb reverse tcp:8081 tcp:8081
adb reverse tcp:19000 tcp:19000
```

**Bridge not working?**
- Check Arduino is connected
- Close Arduino Serial Monitor
- Verify `serviceAccountKey.json` exists

**Metro cache issue?**
```powershell
npx expo start --localhost --clear
```

---

For full documentation, see: `run.md`
