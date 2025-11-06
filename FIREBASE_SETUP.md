# Firebase Setup for Arduino Data

## Quick Start (3 Steps)

### Step 1: Download Service Account Key

1. **Click this direct link**: https://console.firebase.google.com/u/0/project/automonx-917f4/settings/serviceaccounts/adminsdk

2. You'll see a page titled **"Service accounts"**

3. Click the **"Generate new private key"** button

4. In the popup, click **"Generate key"**

5. A file named `automonx-917f4-firebase-adminsdk-xxxxx.json` will download

6. **Rename it to**: `serviceAccountKey.json`

7. **Move it to**: `D:\7th_Semester_Project\AutomonX_app\serviceAccountKey.json`

### Step 2: Run the Python Bridge

Open PowerShell in your project folder and run:

```powershell
cd D:\7th_Semester_Project\AutomonX_app
python scripts/py_serial_bridge.py
```

**Expected Output:**
```
[py-bridge] Loaded env from scripts/bridge.env
[py-bridge] Using forced COM port from env: COM7
[py-bridge] Serial port opened: COM7
[py-bridge] Using GOOGLE_APPLICATION_CREDENTIALS at: D:\7th_Semester_Project\AutomonX_app\serviceAccountKey.json
[py-bridge] Firestore client initialized for project: automonx-917f4
[py-bridge] WS listening on ws://<ip>:3001
[py-bridge] SERIAL: 📊 Data: Temp(DHT22): 29.3°C, Humidity: 70.7%...
[py-bridge] Firestore write ok for device default-device
```

### Step 3: Reload Your App

The app will automatically receive live Arduino data from Firebase!

**In new PowerShell terminal:**
```powershell
npx expo start --localhost --clear
```

Then reload the app on your phone.

---

## How It Works

```
Arduino (COM7)
    ↓ Serial USB
Python Bridge (py_serial_bridge.py)
    ↓ Writes to Firebase
Firebase Firestore (automonx-917f4)
    ↓ Real-time sync
Your App (DashboardScreen)
    ↓ Displays live data
```

**Data Flow:**
1. Arduino sends: `📊 Data: Temp(DHT22): 29.3°C, Humidity: 70.7%...`
2. Bridge parses and writes to: `devices/default-device/latest`
3. App listens to: `devices/default-device/latest`
4. Updates automatically in real-time!

---

## Configuration (Already Done)

The `scripts/bridge.env` is configured with:
```env
COM_PORT=COM7                    # Your Arduino port
DEVICE_ID=default-device         # Firestore document ID
GOOGLE_APPLICATION_CREDENTIALS=D:\7th_Semester_Project\AutomonX_app\serviceAccountKey.json
```

---

## Verify Data in Firebase Console

Go to: https://console.firebase.google.com/u/0/project/automonx-917f4/firestore/databases/-default-/data

You should see:
```
devices/
  └── default-device/
      ├── latest: {dht22: {...}, lm35: {...}, mq135: {...}, ...}
      ├── updatedAt: [timestamp]
      └── readings/
          └── [auto-generated docs with timestamps]
```

---

## Troubleshooting

**Error: "Firestore init failed"**
- Make sure `serviceAccountKey.json` exists in project root
- Check the file path in `bridge.env` is correct

**Error: "Serial port already in use"**
- Close Arduino IDE Serial Monitor
- Close any other programs using COM7

**No data in Firebase**
- Check Arduino is sending data: `📊 Data: ...`
- Verify bridge logs show: `Firestore write ok`
