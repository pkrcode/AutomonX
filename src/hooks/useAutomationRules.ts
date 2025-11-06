import { useEffect, useMemo, useRef, useState } from 'react';
import DeviceControlService from '@services/DeviceControlService';
import { SensorData } from './useSensorData';

type RuleOptions = {
	mq2High?: number;      // LPG/Smoke high threshold (PPM)
	mq2Clear?: number;     // Clear threshold for hysteresis
	coHigh?: number;       // CO high threshold (PPM)
	coClear?: number;      // CO clear threshold
};

const DEFAULTS: Required<RuleOptions> = {
	mq2High: 150,   // if MQ2 lpgPPM >= 150 OR gasDetected true -> hazard
	mq2Clear: 80,   // back to safe when below 80
	coHigh: 40,     // MQ7 coPPM >= 40
	coClear: 20,
};

/**
 * Derives automation outputs from sensor inputs and pushes to backend.
 * Rules:
 *  - Flammable gases (MQ2) high: turn OFF lights, turn ON exhaust fan.
 *  - CO (MQ7) high: turn ON exhaust fan.
 *  - Flame detected: turn ON sprinkler.
 *  Hysteresis prevents rapid toggling.
 */
export function useAutomationRules(
  deviceId: string,
  data: SensorData | null,
  opts?: RuleOptions,
) {
	const cfg = { ...DEFAULTS, ...(opts || {}) };
	const lastHazard = useRef({ mq2: false, co: false, flame: false });
		const [computed, setComputed] = useState<{ fan: boolean; lights: boolean; sprinkler: boolean; doorLock: boolean } | null>(null);

	useEffect(() => {
		if (!deviceId || !data) return;

		const mq2ppm = data.mq2?.lpgPPM ?? 0;
		const mq2Flag = data.mq2?.gasDetected ?? false;
		const coPPM = data.mq7?.coPPM ?? 0;
		const flame = data.flame?.detected ?? false;

		// --- MQ2 state with hysteresis ---
		let mq2HighNow = lastHazard.current.mq2;
		if (mq2Flag || mq2ppm >= cfg.mq2High) mq2HighNow = true;
		else if (mq2ppm <= cfg.mq2Clear) mq2HighNow = false;

		// --- CO state with hysteresis ---
		let coHighNow = lastHazard.current.co;
		if (coPPM >= cfg.coHigh) coHighNow = true;
		else if (coPPM <= cfg.coClear) coHighNow = false;

		// --- Flame state (no hysteresis, immediate) ---
		const flameNow = !!flame;

		// Decide automations
		// Start with current values (fallback if missing)
		let fan = data.automations?.fan ?? false;
		let lights = data.automations?.lights ?? false;
		let sprinkler = (data as any).automations?.sprinkler ?? false;
		let doorLock = data.automations?.doorLock ?? true;

		// MQ2 hazard: force lights OFF, fan ON
		if (mq2HighNow) {
			lights = false;
			fan = true;
		}

				// CO hazard: fan ON
		if (coHighNow) {
			fan = true;
		}

				// Flame: sprinkler ON and exhaust fan ON (force ventilation during fire)
				if (flameNow) {
					sprinkler = true;
					fan = true;
				}

				// Evacuation condition: any hazard -> unlock door
				const evacNow = mq2HighNow || coHighNow || flameNow || !!(data.irSensor?.breach);
				if (evacNow) {
					doorLock = false;
				}

		lastHazard.current = { mq2: mq2HighNow, co: coHighNow, flame: flameNow };

		// Expose computed automations immediately so UI reflects state while backend updates
		setComputed({ fan, lights, sprinkler, doorLock });

		// Push updates if they differ from current backend state
		const tasks: Array<Promise<any>> = [];
		const push = (key: string, val: boolean, current: boolean | undefined) => {
			if (current !== val) tasks.push(DeviceControlService.updateAutomation(deviceId, key, val));
		};

		push('fan', fan, data.automations?.fan);
		push('lights', lights, data.automations?.lights);
		push('sprinkler', sprinkler, (data as any).automations?.sprinkler);
		push('doorLock', doorLock, data.automations?.doorLock);

		if (tasks.length) {
			Promise.allSettled(tasks).catch(() => {});
		}
	}, [deviceId, data, opts?.mq2High, opts?.mq2Clear, opts?.coHigh, opts?.coClear]);

	return useMemo(() => ({ automations: computed, hazards: lastHazard.current }), [computed]);
}

export default useAutomationRules;
