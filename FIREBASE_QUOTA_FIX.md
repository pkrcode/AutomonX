# Firebase Free Tier Quota Fix

## Problem
The Arduino bridge was sending data to Firebase every ~2 seconds, which results in:
- **43,200 writes/day** (1 write every 2 seconds × 86,400 seconds/day ÷ 2 = 43,200)
- Firebase Spark (Free) plan limit: **20,000 writes/day**
- **EXCEEDING quota by 2.16x** ❌

This would cause Firebase to either:
1. Throttle writes (data loss)
2. Charge your account (if upgraded to Blaze plan)
3. Stop working after hitting quota

## Solution Implemented
Added **write throttling** to the Python bridge (`scripts/py_serial_bridge.py`):

### Changes Made:
1. **New environment variable**: `FIREBASE_WRITE_INTERVAL=5`
   - Configurable in `scripts/bridge.env`
   - Default: 5 seconds (can be changed)

2. **Bridge now skips writes** between intervals:
   - Arduino still sends data every ~2 seconds (serial stays responsive)
   - Bridge only writes to Firebase every 5 seconds
   - Logs show: `⏭️ Skipping Firebase write (next in X.Xs to stay under quota)`

3. **New quota calculation**:
   - At 5-second interval: **17,280 writes/day** ✅
   - Well under 20,000 limit
   - Leaves 2,720 writes/day for other operations

### Configuration
Edit `scripts/bridge.env`:
```env
# Firebase write interval in seconds (default: 5)
# At 5 seconds: 17,280 writes/day (SAFE - under 20,000 limit)
# At 4 seconds: 21,600 writes/day (OVER limit!)
# At 10 seconds: 8,640 writes/day (VERY SAFE - for multiple devices)
FIREBASE_WRITE_INTERVAL=5
```

## How to Apply Fix

### 1. Stop Running Bridge (if running):
```powershell
# Use the stop script
.\stop-automonx.bat

# Or manually kill Python processes
taskkill /F /IM python.exe
```

### 2. Verify Configuration:
Check that `scripts/bridge.env` contains:
```env
FIREBASE_WRITE_INTERVAL=5
```

### 3. Restart Bridge:
```powershell
# Use the start script (already includes latest code)
.\start-automonx.bat

# Or manually:
python scripts\py_serial_bridge.py
```

### 4. Verify Throttling is Working:
Look for these log messages:
```
[py-bridge] SERIAL: 📊 Data: Temp(DHT22): 31.8°C, Humidity: 52.7%...
[py-bridge] ⏭️  Skipping Firebase write (next in 3.2s to stay under quota)
[py-bridge] SERIAL: 📊 Data: Temp(DHT22): 31.8°C, Humidity: 52.7%...
[py-bridge] ⏭️  Skipping Firebase write (next in 1.1s to stay under quota)
[py-bridge] SERIAL: 📊 Data: Temp(DHT22): 31.8°C, Humidity: 52.7%...
[py-bridge] ✅ Firestore write ok for device default-device
```

You should see:
- ✅ Write confirmations every ~5 seconds
- ⏭️ Skip messages between successful writes
- 📊 Serial data still coming every ~2 seconds

## UI Changes Made

### DashboardScreen Cleanup:
Removed unnecessary panels from the dashboard:
1. ❌ **WebSocket Connection Panel** - Not needed (using Firebase direct)
2. ❌ **Paste Arduino Data String Panel** - Dev testing feature removed
3. ✅ **Menu Button Fixed** - Properly typed navigation for drawer

### What You'll See Now:
- Clean dashboard with only sensor data
- Data updates automatically from Firebase (every 5 seconds)
- Menu button (☰) works to open drawer navigation
- No manual connection/paste needed

## Alternative Quota Solutions

### If 5 seconds is too slow:
**Option 1: Conditional Writes** (future enhancement)
- Only write when values change significantly
- Example: Temperature changes by >0.5°C
- Code change needed in `parse_arduino_line()`

**Option 2: Upgrade to Blaze Plan** (pay-as-you-go)
- Enable billing in Firebase Console
- Cost: ~$0.08/day for 43,200 writes
- Allows 2-second updates
- Free quota still applies (first 20K writes free)

**Option 3: Multiple Devices with Batching**
- Use 10-second intervals (8,640 writes/day per device)
- Supports 2-3 devices on free tier
- Batch multiple sensor readings into single write

## Monitoring Quota Usage

### Firebase Console:
1. Go to: https://console.firebase.google.com/project/automonx-917f4/usage
2. Check "Cloud Firestore" → "Writes"
3. Should see ~17,280 writes/day after fix

### Bridge Logs:
- Count ✅ success messages per minute
- Should see ~12 writes per minute (1 every 5 seconds)
- If seeing more, check `FIREBASE_WRITE_INTERVAL` setting

## Files Modified
1. `scripts/py_serial_bridge.py` - Added throttling logic
2. `scripts/bridge.env` - Added FIREBASE_WRITE_INTERVAL setting
3. `src/screens/main/DashboardScreen.tsx` - UI cleanup and menu fix

## Testing Checklist
- [ ] Bridge starts without errors
- [ ] See "⏭️ Skipping" messages in logs
- [ ] See "✅ Firestore write ok" every ~5 seconds
- [ ] App shows live data on dashboard
- [ ] Menu button opens drawer
- [ ] Firebase usage stays under 20K writes/day

## Troubleshooting

### "Still seeing 2-second writes"
- Check `bridge.env` has `FIREBASE_WRITE_INTERVAL=5`
- Restart Python bridge completely
- Old bridge process might still be running

### "Menu button not working"
- Reload app (shake phone → Reload)
- Clear Metro cache: `Ctrl+C` then `npx expo start -c`
- Check for "OPEN_DRAWER" errors in Metro logs

### "Data not updating in app"
- Check Firebase Console for recent writes
- Verify `useSensorData('default-device')` in logs
- Check network connectivity on phone

## Support
For Firebase quota questions: https://firebase.google.com/docs/firestore/quotas
For AutomonX issues: Check `run.md` troubleshooting section
