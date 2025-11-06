// Serial -> WebSocket bridge for Arduino UNO on Windows
// - Auto-detects Arduino COM port when possible
// - Reads lines from Serial (9600 baud) and broadcasts raw text over WS
// - Client (app) parses the text into structured SensorData

/* Usage:
   1) Install deps: npm i serialport ws
   2) Run: npm run serial-bridge
   3) Optional env vars:
      - COM_PORT=COM5   (forces specific port)
      - WS_PORT=3001    (WebSocket port)
*/

const os = require('os');
const http = require('http');

let SerialPort;
let ReadlineParser;
try {
  SerialPort = require('serialport').SerialPort; // serialport v10+
  ReadlineParser = require('@serialport/parser-readline').ReadlineParser;
} catch (e) {
  try {
    // Fallback older API
    SerialPort = require('serialport');
    ReadlineParser = require('@serialport/parser-readline').ReadlineParser;
  } catch (e2) {
    console.error('serialport package is not installed. Run: npm i serialport');
    process.exit(1);
  }
}

const WebSocket = require('ws');

const WS_PORT = parseInt(process.env.WS_PORT || '3001', 10);
const FORCED_PORT = process.env.COM_PORT; // e.g., "COM5"

function log(...args) {
  console.log('[bridge]', ...args);
}

async function findArduinoPort() {
  if (FORCED_PORT) {
    log('Using forced COM port from env:', FORCED_PORT);
    return FORCED_PORT;
  }
  try {
    const { SerialPort: SP } = require('serialport');
    const ports = await SP.list();
    // Heuristics for Arduino/USB-Serial
    const match = ports.find((p) => {
      const id = `${p.path} ${p.friendlyName || ''} ${p.manufacturer || ''}`.toLowerCase();
      return id.includes('arduino') || id.includes('usb') || id.includes('wch') || id.includes('ch340');
    });
    if (match) {
      log('Auto-detected port:', match.path, '-', match.friendlyName || match.manufacturer || '');
      return match.path;
    }
    // Fallback common Windows ports
    const candidates = ['COM3', 'COM4', 'COM5', 'COM6'];
    log('No obvious Arduino port found. Trying candidates:', candidates.join(', '));
    return candidates[0];
  } catch (e) {
    log('Port detection failed, defaulting to COM3:', e.message);
    return 'COM3';
  }
}

async function start() {
  // HTTP server just for basic health checks (optional)
  const server = http.createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
      return;
    }
    res.writeHead(404);
    res.end();
  });
  server.listen(WS_PORT, () => {
    const ifaces = Object.values(os.networkInterfaces()).flat().filter(Boolean);
    const addrs = ifaces
      .filter((i) => i.family === 'IPv4' && !i.internal)
      .map((i) => i.address);
    log(`WS/HTTP listening on ws://<ip>:${WS_PORT} (try: ${addrs.map((a) => `ws://${a}:${WS_PORT}`).join(', ')})`);
    log('Health endpoint: http://localhost:' + WS_PORT + '/health');
  });

  const wss = new WebSocket.Server({ server });
  wss.on('connection', (ws) => {
    log('Client connected');
    ws.send(JSON.stringify({ type: 'hello', message: 'connected to Arduino bridge' }));
    ws.on('close', () => log('Client disconnected'));
  });

  const portPath = await findArduinoPort();
  log('Opening serial port', portPath);

  let port;
  try {
    // Newer API
    port = new SerialPort({ path: portPath, baudRate: 9600 });
  } catch (e) {
    // Older API signature
    port = new SerialPort(portPath, { baudRate: 9600 }, (err) => {
      if (err) log('Serial open error:', err.message);
    });
  }

  const parser = new ReadlineParser({ delimiter: '\n' });
  port.pipe(parser);

  port.on('open', () => log('Serial port opened:', portPath));
  port.on('error', (err) => log('Serial error:', err.message));

  // Accumulate snapshot blocks between lines of '=' and emit as a single message
  let inBlock = false;
  let blockLines = [];
  const isDivider = (t) => /^=+\s*$/.test(t);

  parser.on('data', (line) => {
    const raw = String(line).replace(/\r$/, '');
    const text = raw.trim();
    if (!text) return;

    // Console echo
    log('SERIAL:', text);

    // Always broadcast individual lines for legacy clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'line', text }));
      }
    });

    // Block detection: lines of only '=' delimit a snapshot
    if (isDivider(text)) {
      if (!inBlock) {
        inBlock = true;
        blockLines = [];
      } else {
        // end of block → emit one combined payload for best app UX
        const blockText = blockLines.join('\n');
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'block', text: blockText }));
          }
        });
        inBlock = false;
        blockLines = [];
      }
      return;
    }

    if (inBlock) {
      blockLines.push(text);
    }
  });
}

start().catch((e) => {
  console.error('Bridge failed to start:', e);
  process.exit(1);
});
