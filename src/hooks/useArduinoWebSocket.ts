import { useEffect, useRef, useState } from 'react';
import { parseArduinoData } from '../services/MockSensorData';
import type { SensorData } from './useSensorData';

export type WSStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export function useArduinoWebSocket(url: string | null, autoConnect = false) {
  const [status, setStatus] = useState<WSStatus>('disconnected');
  const [lastError, setLastError] = useState<string | null>(null);
  const [latest, setLatest] = useState<SensorData | null>(null);
  const [lastLine, setLastLine] = useState<string | null>(null);
  const [lastMessageAt, setLastMessageAt] = useState<number | null>(null);
  const aggRef = useRef<SensorData | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = () => {
    if (!url) return;
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }
    setStatus('connecting');
    setLastError(null);
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => setStatus('connected');
      ws.onerror = (e: any) => {
        setStatus('error');
        setLastError(e?.message || 'WebSocket error');
      };
      ws.onclose = () => {
        setStatus('disconnected');
      };
      ws.onmessage = (evt) => {
        try {
          const payload = JSON.parse(typeof evt.data === 'string' ? evt.data : '');
          if (payload?.type === 'line') {
            const text: string = payload.text || '';
            setLastLine(text);
            setLastMessageAt(Date.now());
            const parsed = parseArduinoData(text);
            // Merge parsed partials into an aggregate snapshot to handle multi-line Arduino output
            const prev = aggRef.current || {} as SensorData;
            const merged: SensorData = {
              ...prev,
              dht22: parsed.dht22 !== undefined ? { ...(prev.dht22 || {}), ...(parsed.dht22 || {}) } : prev.dht22,
              lm35: parsed.lm35?.temperature !== undefined ? parsed.lm35 : prev.lm35,
              mq135: parsed.mq135?.airQualityPPM !== undefined ? parsed.mq135 : prev.mq135,
              mq2: (parsed.mq2?.lpgPPM !== undefined || parsed.mq2?.gasDetected !== undefined) ? { ...(prev.mq2 || {}), ...(parsed.mq2 || {}) } : prev.mq2,
              mq7: parsed.mq7?.coPPM !== undefined ? parsed.mq7 : prev.mq7,
              flame: parsed.flame?.detected !== undefined ? parsed.flame : prev.flame,
              gps: parsed.gps !== undefined ? parsed.gps : prev.gps,
              irSensor: prev.irSensor || { breach: false },
              automations: prev.automations || { fan: false, lights: false, doorLock: true },
              lastUpdated: Date.now(),
            } as SensorData;
            aggRef.current = merged;
            setLatest(merged);
          } else if (payload?.type === 'block') {
            const block: string = payload.text || '';
            setLastLine('[block]');
            setLastMessageAt(Date.now());
            const lines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
            let merged = (aggRef.current || {}) as SensorData;
            for (const ln of lines) {
              const parsed = parseArduinoData(ln);
              merged = {
                ...merged,
                dht22: parsed.dht22 !== undefined ? { ...(merged.dht22 || {}), ...(parsed.dht22 || {}) } : merged.dht22,
                lm35: parsed.lm35?.temperature !== undefined ? parsed.lm35 : merged.lm35,
                mq135: parsed.mq135?.airQualityPPM !== undefined ? parsed.mq135 : merged.mq135,
                mq2: (parsed.mq2?.lpgPPM !== undefined || parsed.mq2?.gasDetected !== undefined) ? { ...(merged.mq2 || {}), ...(parsed.mq2 || {}) } : merged.mq2,
                mq7: parsed.mq7?.coPPM !== undefined ? parsed.mq7 : merged.mq7,
                flame: parsed.flame?.detected !== undefined ? parsed.flame : merged.flame,
                gps: parsed.gps !== undefined ? parsed.gps : merged.gps,
                irSensor: merged.irSensor || { breach: false },
                automations: merged.automations || { fan: false, lights: false, doorLock: true },
              } as SensorData;
            }
            merged = { ...merged, lastUpdated: Date.now() };
            aggRef.current = merged;
            setLatest(merged);
          }
        } catch {
          const txt = String((evt as any).data || '');
          if (txt) {
            setLastLine(txt);
            setLastMessageAt(Date.now());
            const parsed = parseArduinoData(txt);
            const prev = aggRef.current || {} as SensorData;
            const merged: SensorData = { ...prev, ...parsed, lastUpdated: Date.now() };
            aggRef.current = merged;
            setLatest(merged);
          }
        }
      };
    } catch (e: any) {
      setStatus('error');
      setLastError(e?.message || 'Failed to connect');
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      try { wsRef.current.close(); } catch {}
    }
    wsRef.current = null;
    setStatus('disconnected');
  };

  useEffect(() => {
    if (autoConnect && url) connect();
    return () => {
      if (wsRef.current) {
        try { wsRef.current.close(); } catch {}
      }
      wsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, autoConnect]);

  return { status, lastError, latest, lastLine, lastMessageAt, connect, disconnect };
}

export default useArduinoWebSocket;
