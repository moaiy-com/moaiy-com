import { Color, MathUtils, Vector3 } from 'three';

/** Seconds for one full day loop. Tune freely. */
export const DAY_LENGTH_SECONDS = 100;

/**
 * Keyframes along the 0..1 day axis. Every keyframe holds the same param set.
 * Directions are world-space unit-ish vectors (+x = east/right, -x = west/left,
 * +y = up, +z = towards the camera / south). They are normalised after blending.
 * cloudiness / rain / lightning are consumed in STEP 2 (storm system).
 */
export const DAY_KEYFRAMES = [
  {
    name: 'dawn-fog',
    t: 0.0,
    sunDir: [0.92, 0.12, 0.38],
    lightDir: [0.92, 0.2, 0.38],
    lightColor: '#ffd2a8',
    lightIntensity: 0.55,
    hemiSky: '#c9d3df',
    hemiGround: '#5d6658',
    hemiIntensity: 0.75,
    skyTop: '#8ea4bd',
    skyHorizon: '#d9d8d2',
    glowColor: '#ffc29a',
    glowStrength: 0.25,
    fogColor: '#d3d5d2',
    fogDensity: 0.16,
    mistOpacity: 0.55,
    cloudiness: 0.3,
    rain: 0,
    lightning: 0,
    starOpacity: 0,
    moonDir: [-0.85, 0.12, 0.3],
    moonIntensity: 0,
    exposure: 1.0,
  },
  {
    name: 'morning-storm',
    t: 0.2,
    sunDir: [0.7, 0.55, 0.45],
    lightDir: [0.7, 0.6, 0.45],
    lightColor: '#b7c0cc',
    lightIntensity: 0.35,
    hemiSky: '#6f7a88',
    hemiGround: '#3b4239',
    hemiIntensity: 0.7,
    skyTop: '#3a4250',
    skyHorizon: '#6c7480',
    glowColor: '#8b93a0',
    glowStrength: 0.0,
    fogColor: '#646c77',
    fogDensity: 0.045,
    mistOpacity: 0.1,
    cloudiness: 1,
    rain: 1,
    lightning: 0.6,
    starOpacity: 0,
    moonDir: [-0.85, -0.3, 0.3],
    moonIntensity: 0,
    exposure: 0.9,
  },
  {
    name: 'afternoon-clear',
    t: 0.42,
    sunDir: [-0.55, 0.68, 0.48],
    lightDir: [-0.55, 0.68, 0.48],
    lightColor: '#fff3dc',
    lightIntensity: 2.6,
    hemiSky: '#bfe4ff',
    hemiGround: '#6b7f55',
    hemiIntensity: 0.5,
    skyTop: '#2f78d0',
    skyHorizon: '#a9d0f0',
    glowColor: '#fff4dc',
    glowStrength: 0.35,
    fogColor: '#b4d4ee',
    fogDensity: 0.012,
    mistOpacity: 0,
    cloudiness: 0.15,
    rain: 0,
    lightning: 0,
    starOpacity: 0,
    moonDir: [0.85, -0.4, 0.3],
    moonIntensity: 0,
    exposure: 1.02,
  },
  {
    name: 'sunset',
    t: 0.62,
    sunDir: [-0.92, 0.12, 0.3],
    lightDir: [-0.85, 0.33, 0.4],
    lightColor: '#ff9a52',
    lightIntensity: 2.4,
    hemiSky: '#e9a07a',
    hemiGround: '#4a3d3a',
    hemiIntensity: 0.35,
    skyTop: '#3a3f78',
    skyHorizon: '#ff9d5c',
    glowColor: '#ff6a2c',
    glowStrength: 1.4,
    fogColor: '#e59a72',
    fogDensity: 0.02,
    mistOpacity: 0,
    cloudiness: 0.2,
    rain: 0,
    lightning: 0,
    starOpacity: 0.05,
    moonDir: [0.9, 0.02, 0.3],
    moonIntensity: 0,
    exposure: 1.05,
  },
  {
    name: 'night',
    t: 0.8,
    sunDir: [-0.6, -0.5, 0.3],
    lightDir: [0.55, 0.55, 0.45],
    lightColor: '#9db4e8',
    lightIntensity: 0.65,
    hemiSky: '#2b3c66',
    hemiGround: '#11161f',
    hemiIntensity: 0.45,
    skyTop: '#040817',
    skyHorizon: '#1a2546',
    glowColor: '#1a2546',
    glowStrength: 0,
    fogColor: '#151d36',
    fogDensity: 0.02,
    mistOpacity: 0,
    cloudiness: 0.1,
    rain: 0,
    lightning: 0,
    starOpacity: 1,
    moonDir: [0.5, 0.12, -0.86],
    moonIntensity: 1,
    exposure: 1.1,
  },
  {
    name: 'pre-dawn',
    t: 0.93,
    sunDir: [0.85, -0.15, 0.4],
    lightDir: [0.0, 0.7, -0.4],
    lightColor: '#a9b5d6',
    lightIntensity: 0.3,
    hemiSky: '#5a6787',
    hemiGround: '#262a2e',
    hemiIntensity: 0.55,
    skyTop: '#26304f',
    skyHorizon: '#8a8ea0',
    glowColor: '#c79a8f',
    glowStrength: 0.2,
    fogColor: '#7e8394',
    fogDensity: 0.11,
    mistOpacity: 0.35,
    cloudiness: 0.25,
    rain: 0,
    lightning: 0,
    starOpacity: 0.35,
    moonDir: [-0.3, 0.32, -0.9],
    moonIntensity: 0.4,
    exposure: 1.0,
  },
];

const COLOR_KEYS = ['lightColor', 'hemiSky', 'hemiGround', 'skyTop', 'skyHorizon', 'glowColor', 'fogColor'];
const VEC_KEYS = ['sunDir', 'lightDir', 'moonDir'];
const NUM_KEYS = [
  'lightIntensity', 'hemiIntensity', 'glowStrength', 'fogDensity', 'mistOpacity', 'cloudiness',
  'rain', 'lightning', 'starOpacity', 'moonIntensity', 'exposure',
];

// Pre-parse once so per-frame sampling allocates nothing.
const PARSED = DAY_KEYFRAMES.map((kf) => {
  const p = { name: kf.name, t: kf.t };
  for (const k of COLOR_KEYS) p[k] = new Color(kf[k]);
  for (const k of VEC_KEYS) p[k] = new Vector3(...kf[k]).normalize();
  for (const k of NUM_KEYS) p[k] = kf[k];
  return p;
});

export function createDayState() {
  const s = { name: '', blend: 0 };
  for (const k of COLOR_KEYS) s[k] = new Color();
  for (const k of VEC_KEYS) s[k] = new Vector3();
  for (const k of NUM_KEYS) s[k] = 0;
  return s;
}

/** Sample the day at t (0..1, wraps) into `out` with smoothstep easing between neighbours. */
export function sampleDay(t, out) {
  const time = ((t % 1) + 1) % 1;
  const n = PARSED.length;
  let i = n - 1;
  for (let k = 0; k < n; k++) {
    if (PARSED[k].t <= time) i = k;
  }
  const a = PARSED[i];
  const b = PARSED[(i + 1) % n];
  const bt = i + 1 < n ? b.t : 1 + b.t;
  const raw = (time - a.t) / Math.max(1e-6, bt - a.t);
  const e = MathUtils.smoothstep(raw, 0, 1);
  out.name = e < 0.5 ? a.name : b.name;
  out.blend = e;
  for (const k of COLOR_KEYS) out[k].copy(a[k]).lerp(b[k], e);
  for (const k of VEC_KEYS) {
    out[k].copy(a[k]).lerp(b[k], e);
    if (out[k].lengthSq() < 1e-6) out[k].set(0, 1, 0);
    out[k].normalize();
  }
  for (const k of NUM_KEYS) out[k] = a[k] + (b[k] - a[k]) * e;
  return out;
}
