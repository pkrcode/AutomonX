# AutomonX - Quick Start Guide

## How to Run the App

### Simple 3-Step Process

1. **Start Everything**
   ```batch
   .\start-automonx.bat
   ```
   This will:
   - Restart ADB server
   - Wait for your phone to connect (30 seconds max)
   - Configure port forwarding
   - Start Arduino Bridge in a new window
   - Start Metro Bundler in a new window

2. **Check Status** (optional)
   ```batch
   .\check-automonx.bat
   ```
   Verifies:
   - ✓ Bridge running on port 3001
   - ✓ Metro running on port 8081
   - ✓ ADB device connected
   - ✓ Port forwarding configured

3. **Open App on Your Phone**
   - Open **Expo Go** app
   - Either:
     - App auto-loads (if same network)
     - OR shake device → tap **Reload**
     - OR scan QR code from Metro window

### To Stop Everything

```batch
.\stop-automonx.bat
```
Kills all Python and Node processes.

---

## What Each Window Does

### Arduino Bridge Window
- Reads data from Arduino on COM7
- Sends to Firebase Firestore (every 5 seconds)
- Broadcasts to WebSocket on port 3001
- Shows live sensor readings

### Metro Bundler Window
- Serves the React Native app
- Shows QR code for Expo Go
- Displays app logs and errors
- Auto-reloads when you save code files

---

## Current App Status

✅ **All Systems Working:**
- Mock authentication (auto-login as test@automonx.com)
- Drawer navigation (Dashboard, Settings)
- WebSocket live data from Arduino
- Menu button opens drawer
- Hot reload enabled

---

## Troubleshooting

### App stuck on loading screen
1. Run `.\check-automonx.bat`
2. Check Metro window for errors
3. On phone: shake → Reload

### No Arduino data showing
1. Check Bridge window - should show sensor readings
2. Verify Arduino is connected to COM7
3. Check bridge is on port 3001: `netstat -ano | findstr :3001`

### Menu button not working
1. Make sure you reloaded after the recent fixes
2. Shake device → Reload
3. Check Metro console for navigation errors

### ADB device not detected
1. Enable USB debugging on phone
2. Allow computer when prompt appears on phone
3. Run `.\start-automonx.bat` again

---

## File Summary

| File | Purpose |
|------|---------|
| `start-automonx.bat` | Start everything (recommended) |
| `stop-automonx.bat` | Stop all processes |
| `check-automonx.bat` | Check system health |
| `App.tsx` | Main app entry (uses AppNavigator) |
| `src/context/AuthContext.tsx` | Mock auth for Expo Go |
| `src/navigation/MainDrawer.tsx` | Drawer with Dashboard & Settings |
| `scripts/py_serial_bridge.py` | Arduino → Firebase/WebSocket bridge |

---

## Daily Workflow

1. **Morning:** Run `.\start-automonx.bat`
2. **Develop:** Edit files → auto-reloads on phone
3. **Test:** Check Arduino data updates every 2 seconds
4. **Evening:** Run `.\stop-automonx.bat`

That's it! 🎉
