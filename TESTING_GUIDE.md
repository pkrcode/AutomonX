# AutoMonX App - Testing Guide

## 🚀 Quick Start (Testing Mode)

Your app is now running in **TEST MODE** with mock sensor data!

### How to View on Your Phone:

1. **Open Expo Go** app on your Android phone
2. **Scan the QR code** from the terminal, OR
3. **Enter URL**: `exp://192.168.29.143:8081`

### What You'll See:

The app will show **realistic mock sensor data** that updates every 3 seconds:
- ✅ Temperature (DHT22 & LM35) - Random values 25-35°C
- ✅ Humidity - Random values 50-80%
- ✅ Air Quality (MQ135) - 200-500 PPM
- ✅ LPG/Smoke (MQ2) - Occasionally shows detection
- ✅ CO Level (MQ7) - 10-60 PPM  
- ✅ Flame Detection - Rarely shows fire alert
- ✅ GPS Location - Mock coordinates near Delhi
- ✅ Security Status - Occasionally shows breach
- ✅ Automation Controls - Fan, Lights, Door Lock

---

## 📡 Tomorrow: Connect Real Arduino Data

### Step 1: Modify Arduino Code (Optional Enhancement)
Add IR sensor to your Arduino for security monitoring:
```cpp
#define IR_SENSOR_PIN 7
pinMode(IR_SENSOR_PIN, INPUT);
int irSensor = digitalRead(IR_SENSOR_PIN);
data += "IR:" + String(irSensor == LOW ? "BREACH" : "CLEAR") + ",";
```

### Step 2: Send Data to Firebase from ESP32/NodeMCU

You'll need a WiFi-enabled module (ESP8266/ESP32) to receive LoRa data and upload to Firebase:

```cpp
// On ESP32/NodeMCU (LoRa Receiver)
#include <WiFi.h>
#include <FirebaseESP32.h>
#include <LoRa.h>

// Replace with your network credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Firebase config (get from Firebase Console)
#define FIREBASE_HOST "automonx-917f4-default-rtdb.firebaseio.com"
#define FIREBASE_AUTH "YOUR_DATABASE_SECRET"

FirebaseData firebaseData;

void setup() {
  WiFi.begin(ssid, password);
  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
  
  // Initialize LoRa receiver
  if (!LoRa.begin(433E6)) {
    Serial.println("LoRa init failed!");
    while (1);
  }
}

void loop() {
  // Receive LoRa data
  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    String receivedData = "";
    while (LoRa.available()) {
      receivedData += (char)LoRa.read();
    }
    
    // Parse the Arduino data string
    // Example: "Temp1(DHT22):25.5,Humidity:60.2,..."
    parseAndUploadToFirebase(receivedData);
  }
}

void parseAndUploadToFirebase(String data) {
  // Parse your Arduino string format
  // Upload to Firebase Firestore path: devices/{deviceId}/sensors
  
  Firebase.setFloat(firebaseData, "/devices/YOUR_DEVICE_ID/dht22/temperature", tempValue);
  Firebase.setFloat(firebaseData, "/devices/YOUR_DEVICE_ID/dht22/humidity", humidityValue);
  // ... add all other sensors
}
```

### Step 3: Update App to Use Real Data

In `DashboardScreen.tsx`, change line 23:
```typescript
const USE_MOCK_DATA = false; // Change from true to false
```

### Step 4: Set Up Firebase Firestore

1. Go to Firebase Console: https://console.firebase.google.com/project/automonx-917f4
2. Click **Firestore Database** → **Create Database**
3. Choose **Test Mode** (for development)
4. Create this structure:
```
devices/
  └── {deviceId}/
       ├── dht22/
       │    ├── temperature: 25.5
       │    └── humidity: 60.2
       ├── lm35/
       │    └── temperature: 26.1
       ├── mq135/
       │    └── airQualityPPM: 350
       ├── mq2/
       │    ├── gasDetected: false
       │    └── lpgPPM: 0
       ├── mq7/
       │    └── coPPM: 25
       ├── flame/
       │    └── detected: false
       ├── gps/
       │    ├── latitude: 28.7041
       │    ├── longitude: 77.1025
       │    └── isValid: true
       └── automations/
            ├── fan: false
            ├── lights: false
            └── doorLock: true
```

---

## 🔧 File Structure

### Important Files:
- `src/services/MockSensorData.ts` - Mock data generator (for testing)
- `src/screens/main/DashboardScreen.tsx` - Main dashboard (line 23: toggle mock/real data)
- `src/hooks/useSensorData.ts` - SensorData TypeScript interface
- `App.tsx` - Current test version (bypasses login)
- `App_Original.tsx` - Original version (with Firebase auth)

### To Restore Firebase Authentication:
```bash
cp App_Original.tsx App.tsx
```

---

## 📱 Features Working in Test Mode:

✅ Dashboard with live sensor cards  
✅ Mock data updates every 3 seconds  
✅ Security status monitoring  
✅ Automation toggles (visual only, not connected yet)  
✅ Event log screen  
✅ Settings screen  

❌ Login/Signup (bypassed in test mode)  
❌ Real Firebase data (using mock data)  
❌ Push notifications (requires FCM setup)  

---

## 🐛 Troubleshooting:

**App shows "Something went wrong":**
- Make sure both phone and PC are on same WiFi network
- Try reloading: Press `r` in Metro terminal or shake phone → Reload

**Changes not showing:**
- Press `r` in Metro terminal to reload
- Or run: `npx expo start --clear`

**TypeScript errors:**
- Run: `npx tsc --noEmit` to check for errors

---

## 📊 Data Format Reference

Your Arduino sends data as:
```
Temp1(DHT22):25.5,Humidity:60.2,Temp2(LM35):26.1,Air(CO2/NH3/Benzene):350.2ppm,LPG/Smoke/Methane):120.5ppm,CO:45.3ppm,Flame:NOFIRE,LAT:12.345678,LON:78.912345
```

This is parsed by `parseArduinoData()` function in `MockSensorData.ts` (line 60).

---

## 🎯 Next Steps:

1. ✅ Test the app today with mock data
2. 📡 Connect LoRa receiver (ESP32) to WiFi tomorrow
3. 🔥 Set up Firebase Firestore database
4. 🔌 Upload Arduino sensor data to Firebase via ESP32
5. 📱 Switch app to real data mode
6. 🔐 Enable Firebase Authentication for secure access

---

**Need Help?**
- Firebase Console: https://console.firebase.google.com/project/automonx-917f4
- Metro Bundler: http://192.168.29.143:8081
- App URL: exp://192.168.29.143:8081
