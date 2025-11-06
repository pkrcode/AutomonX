#!/usr/bin/env python3
"""
Python Serial -> WebSocket bridge for Arduino UNO (Windows-friendly)
- Auto-detects Arduino COM port (can override via COM_PORT env)
- Reads Serial (9600 baud), broadcasts each line as JSON over WebSocket (WS_PORT, default 3001)
- Compatible with the app's WebSocket client (expects JSON {type:'line', text:'...'})

Usage:
  python scripts/py_serial_bridge.py

Optional environment variables:
  COM_PORT=COM7   # force a specific COM port
  WS_PORT=3001    # select WebSocket port

Requires:
  pip install pyserial websockets
"""

import asyncio
import json
import os
import re
import sys
import time
from typing import Set, Optional, Dict, Any

try:
    import serial
    import serial.tools.list_ports
except ImportError:
    print("Missing dependency 'pyserial'. Install with: python -m pip install pyserial websockets", file=sys.stderr)
    sys.exit(1)

try:
    import websockets
except ImportError:
    print("Missing dependency 'websockets'. Install with: python -m pip install websockets", file=sys.stderr)
    sys.exit(1)

# Optional Firestore (server-side) to push readings to Firebase
FIRESTORE_ENABLED = False
try:
    from google.cloud import firestore
    from google.cloud.firestore_v1 import SERVER_TIMESTAMP
    FIRESTORE_ENABLED = True
except Exception:
    FIRESTORE_ENABLED = False

def log(*args):
    print('[py-bridge]', *args)

def load_env_file():
    """Load optional environment overrides from scripts/bridge.env (KEY=VALUE)."""
    try:
        here = os.path.dirname(os.path.abspath(__file__))
        env_path = os.path.join(here, 'bridge.env')
        if os.path.exists(env_path):
            with open(env_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith('#'):
                        continue
                    if '=' in line:
                        k, v = line.split('=', 1)
                        k = k.strip()
                        v = v.strip()
                        # Do not override existing environment vars
                        if k and (k not in os.environ):
                            os.environ[k] = v
            log('Loaded env from scripts/bridge.env')
    except Exception as e:
        log('Failed to load env file:', str(e))


load_env_file()

COM_PORT = os.environ.get('COM_PORT')
WS_PORT = int(os.environ.get('WS_PORT', '3001'))
DEVICE_ID = os.environ.get('DEVICE_ID', 'default-device')
FIREBASE_PROJECT_ID = os.environ.get('FIREBASE_PROJECT_ID')  # optional; can be auto from creds
FIREBASE_WRITE_INTERVAL = int(os.environ.get('FIREBASE_WRITE_INTERVAL', '5'))  # seconds between Firebase writes

clients: Set[websockets.WebSocketServerProtocol] = set()
last_firebase_write_time = 0  # Track last Firestore write timestamp


def autodetect_port() -> str:
    if COM_PORT:
        log('Using forced COM port from env:', COM_PORT)
        return COM_PORT
    ports = list(serial.tools.list_ports.comports())
    for p in ports:
        ident = f"{p.device} {p.description or ''} {p.manufacturer or ''}".lower()
        if any(k in ident for k in ['arduino', 'usb', 'wch', 'ch340']):
            log('Auto-detected port:', p.device, '-', p.description or p.manufacturer or '')
            return p.device
    # fallback
    log('No obvious Arduino port found. Trying COM3 by default.')
    return 'COM3'


async def ws_handler(websocket):
    clients.add(websocket)
    log('Client connected')
    try:
        await websocket.send(json.dumps({'type': 'hello', 'message': 'connected to Python Arduino bridge'}))
        async for _ in websocket:
            # Bridge is one-way; ignore messages from clients
            pass
    finally:
        clients.discard(websocket)
        log('Client disconnected')


async def broadcast_line(line: str):
    if not clients:
        return
    payload = json.dumps({'type': 'line', 'text': line})
    # Fix: Use state instead of closed attribute for newer websockets library
    coros = [ws.send(payload) for ws in list(clients) if ws.state.name == 'OPEN']
    if coros:
        await asyncio.gather(*coros, return_exceptions=True)


# ---------------- Parsing and Firestore -----------------

num_re = re.compile(r"-?\d+(?:\.\d+)?")

def extract_num(text: Optional[str]) -> float:
    if not text:
        return 0.0
    m = num_re.search(text)
    return float(m.group(0)) if m else 0.0


def parse_arduino_line(line: str) -> Dict[str, Any]:
    s = line.strip()
    # Strip leading emoji prefix like "📊 Data:"
    if s.startswith('📊'):
        idx = s.find(':')
        if idx != -1:
            s = s[idx+1:].strip()

    def find(patterns):
        for pat in patterns:
            m = re.search(pat, s, flags=re.IGNORECASE)
            if m:
                return m.group(1)
        return ''

    dht_temp = extract_num(find([r"Temp\s*\(DHT22\)\s*:\s*([^,]+)"]))
    humidity = extract_num(find([r"Humidity\s*:\s*([^,]+)"]))
    lm35_temp = extract_num(find([r"Temp\s*\(LM35\)\s*:\s*([^,]+)"]))
    mq135_ppm = extract_num(find([r"Air\s*Quality[^:]*:\s*([^,]+)", r"Air\s*\(CO2/NH3/Benzene\)\s*:\s*([^,]+)"]))
    mq2_ppm = extract_num(find([r"Smoke/LPG/Methane\s*\(MQ2\)\s*:\s*([^,]+)", r"LPG/Smoke/Methane\s*:\s*([^,]+)"]))
    mq7_ppm = extract_num(find([r"Carbon\s*Monoxide\s*\(MQ7\)\s*:\s*([^,]+)", r"\bCO\b\s*:\s*([^,]+)"]))
    flame_field = find([r"Flame\s*:\s*([^,]+)"])
    flame_detected = bool(re.search(r"\bFIRE\b", flame_field, flags=re.IGNORECASE) and not re.search(r"NO\s*FIRE", flame_field, flags=re.IGNORECASE))

    data = {
        'dht22': { 'temperature': dht_temp, 'humidity': humidity },
        'lm35': { 'temperature': lm35_temp },
        'mq135': { 'airQualityPPM': mq135_ppm },
        'mq2': { 'gasDetected': mq2_ppm > 100.0, 'lpgPPM': mq2_ppm },
        'mq7': { 'coPPM': mq7_ppm },
        'flame': { 'detected': flame_detected },
        'irSensor': { 'breach': False },
        'automations': { 'fan': dht_temp > 30.0, 'lights': False, 'doorLock': True },
    }
    return data


def _firestore_write_sync(client: 'firestore.Client', device_id: str, record: Dict[str, Any]):
    dev_ref = client.collection('devices').document(device_id)
    # Update latest snapshot
    dev_ref.set({'latest': record, 'updatedAt': SERVER_TIMESTAMP}, merge=True)
    # Append to readings sub-collection
    dev_ref.collection('readings').add({**record, 'createdAt': SERVER_TIMESTAMP})


async def serial_reader_task(port_name: str):
    try:
        ser = serial.Serial(port=port_name, baudrate=9600, timeout=1)
        log('Serial port opened:', port_name)
    except serial.SerialException as e:
        log('Serial open error:', str(e))
        log('Make sure the Arduino Serial Monitor/Plotter is CLOSED and you have permission to access the port.')
        raise

    loop = asyncio.get_running_loop()

    # Initialize Firestore client if enabled and creds exist
    fs_client = None
    if FIRESTORE_ENABLED:
        try:
            creds = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
            if creds:
                log('Using GOOGLE_APPLICATION_CREDENTIALS at:', creds)
            fs_client = firestore.Client(project=FIREBASE_PROJECT_ID) if FIREBASE_PROJECT_ID else firestore.Client()
            log('Firestore client initialized for project:', fs_client.project)
        except Exception as e:
            log('Firestore init failed (will continue without writes):', str(e))
            fs_client = None

    try:
        buf = ''
        while True:
            # Read available bytes without blocking too long
            data = await loop.run_in_executor(None, ser.readline)
            if not data:
                await asyncio.sleep(0.05)
                continue
            try:
                text = data.decode('utf-8', errors='ignore').strip()
            except Exception:
                continue
            if not text:
                continue
            # Normalize Windows CRLF endings and remove control chars
            text = re.sub(r'\s+$', '', text)
            await broadcast_line(text)
            log('SERIAL:', text)

            # Also parse and push to Firestore if configured (with throttling to save quota)
            if fs_client is not None:
                global last_firebase_write_time
                current_time = time.time()
                # Only write to Firebase if enough time has passed since last write
                if current_time - last_firebase_write_time >= FIREBASE_WRITE_INTERVAL:
                    try:
                        record = parse_arduino_line(text)
                        # Include raw text for debugging
                        record['raw'] = text
                        loop = asyncio.get_running_loop()
                        await loop.run_in_executor(None, _firestore_write_sync, fs_client, DEVICE_ID, record)
                        last_firebase_write_time = current_time
                        log(f'✅ Firestore write ok for device {DEVICE_ID}')
                    except Exception as e:
                        # Non-fatal
                        log('❌ Firestore write error:', str(e))
                else:
                    # Log that we're skipping this write to stay under quota
                    time_until_next = FIREBASE_WRITE_INTERVAL - (current_time - last_firebase_write_time)
                    log(f'⏭️  Skipping Firebase write (next in {time_until_next:.1f}s to stay under quota)')
    finally:
        try:
            ser.close()
        except Exception:
            pass


async def main():
    port_name = autodetect_port()
    ws_server = await websockets.serve(ws_handler, '0.0.0.0', WS_PORT)
    log(f'WS listening on ws://<ip>:{WS_PORT} (use your LAN IP on the phone)')

    try:
        await serial_reader_task(port_name)
    finally:
        ws_server.close()
        await ws_server.wait_closed()


if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        log('Shutting down')
