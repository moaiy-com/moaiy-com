import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { BackSide, Color, FogExp2, Object3D, Vector3 } from 'three';
import { createDayState, sampleDay } from './keyframes.js';
import RainLayer from './RainLayer.jsx';
import { useDayTime } from './useDayTime.js';

const SKY_RADIUS = 50;
const LIGHT_DISTANCE = 22;
const SHADOW_HALF_EXTENT = 10;

const skyVertex = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p.xyww;
}`;

const skyFragment = /* glsl */ `
uniform vec3 uTop;
uniform vec3 uHorizon;
uniform vec3 uGlow;
uniform float uGlowStrength;
uniform vec3 uSunDir;
uniform vec3 uMoonDir;
uniform float uMoon;
uniform float uStars;
uniform float uFog;
uniform float uTime;
uniform float uCloud;
uniform float uFlash;
uniform float uBolt;
uniform float uBoltSeed;
uniform vec3 uFlashDir;
varying vec3 vDir;

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = fract(sin(dot(i, vec2(127.1, 311.7))) * 43758.5453);
  float b = fract(sin(dot(i + vec2(1.0, 0.0), vec2(127.1, 311.7))) * 43758.5453);
  float c = fract(sin(dot(i + vec2(0.0, 1.0), vec2(127.1, 311.7))) * 43758.5453);
  float d = fract(sin(dot(i + vec2(1.0, 1.0), vec2(127.1, 311.7))) * 43758.5453);
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    v += amp * vnoise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    amp *= 0.5;
  }
  return v;
}

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

void main() {
  vec3 dir = normalize(vDir);
  float h = dir.y;
  float up = clamp(h, 0.0, 1.0);
  vec3 col = mix(uHorizon, uTop, pow(up, 0.55));

  // Sunset / sunrise glow band hugging the horizon, stronger toward the sun.
  vec3 flatDir = normalize(vec3(dir.x, 0.0, dir.z) + 1e-5);
  vec3 flatSun = normalize(vec3(uSunDir.x, 0.0, uSunDir.z) + 1e-5);
  float toward = max(dot(flatDir, flatSun), 0.0);
  float band = exp(-abs(h - 0.02) * 9.0);
  float glow = band * (0.25 + 0.75 * pow(toward, 3.0));
  float sunAbove = smoothstep(-0.25, 0.05, uSunDir.y);
  col += uGlow * glow * uGlowStrength * sunAbove;
  float sunDot = max(dot(dir, uSunDir), 0.0);
  col += uGlow * pow(sunDot, 40.0) * uGlowStrength * 0.6 * sunAbove;
  col += vec3(1.0, 0.95, 0.85) * smoothstep(0.9993, 0.9997, sunDot) * sunAbove * (1.0 - uFog) * step(0.0, h);

  // Twinkling stars (procedural, no textures).
  if (uStars > 0.001 && h > 0.0) {
    vec3 p = dir * 140.0;
    vec3 cell = floor(p);
    float r = hash(cell);
    if (r > 0.965) {
      vec3 center = cell + 0.5 + (vec3(hash(cell + 1.3), hash(cell + 2.7), hash(cell + 4.1)) - 0.5) * 0.6;
      float d = length(p - center);
      float tw = 0.55 + 0.45 * sin(uTime * (1.5 + r * 40.0) + r * 120.0);
      float s = (1.0 - smoothstep(0.0, 0.32, d)) * 1.6 * tw * smoothstep(0.0, 0.02, h);
      col += vec3(0.9, 0.95, 1.0) * s * uStars * (1.0 - uFog);
    }
  }

  // Full moon: disc + soft halo.
  float md = dot(dir, uMoonDir);
  float disc = smoothstep(0.99925, 0.9995, md);
  float halo = pow(max(md, 0.0), 400.0) * 0.45 + pow(max(md, 0.0), 60.0) * 0.06;
  float moonVis = uMoon * smoothstep(-0.06, 0.04, h);
  vec2 mottle = vec2(dot(dir, vec3(91.0, 13.0, 37.0)), dot(dir, vec3(17.0, 83.0, 29.0)));
  float shade = 0.88 + 0.12 * sin(mottle.x) * sin(mottle.y);
  col = mix(col, vec3(0.96, 0.95, 0.88) * shade, disc * moonVis * (1.0 - uFog * 0.8));
  col += vec3(0.6, 0.7, 0.9) * halo * moonVis;

  // Rolling storm clouds: domain-warped fbm projected on a virtual cloud deck.
  if (uCloud > 0.001) {
    vec2 cp = dir.xz / (max(h, 0.0) + 0.09) * 0.9;
    vec2 q = vec2(
      fbm(cp + vec2(uTime * 0.06, 0.0)),
      fbm(cp + vec2(5.2, 1.3) - vec2(0.0, uTime * 0.05))
    );
    float n = fbm(cp + 2.2 * q + vec2(uTime * 0.11, uTime * 0.03));
    float cov = smoothstep(0.62 - uCloud * 0.5, 0.95 - uCloud * 0.25, n + uCloud * 0.2);
    vec3 cdark = mix(uHorizon * 0.55, vec3(0.05, 0.06, 0.075), clamp(q.y * 0.9 + n * 0.3, 0.0, 1.0));
    float fl = uFlash * (0.35 + 0.65 * pow(max(dot(dir, uFlashDir), 0.0), 3.0));
    vec3 ccol = cdark + vec3(0.6, 0.66, 0.85) * fl * (0.25 + n * 0.9);
    col = mix(col, ccol, cov * uCloud);
    col += vec3(0.55, 0.6, 0.78) * uFlash * 0.05 * uCloud;
  }

  // Faint distant bolt during the main flash.
  if (uBolt > 0.001 && h > 0.0 && h < uFlashDir.y) {
    float az = atan(dir.x, -dir.z);
    float faz = atan(uFlashDir.x, -uFlashDir.z);
    float jag = (vnoise(vec2(h * 45.0, uBoltSeed)) - 0.5) * 0.05
      + (vnoise(vec2(h * 160.0, uBoltSeed + 3.0)) - 0.5) * 0.012;
    float bd = abs(az - faz - jag - (uFlashDir.y - h) * 0.15);
    float bolt = 1.0 - smoothstep(0.0, 0.0035, bd);
    col += vec3(0.9, 0.93, 1.0) * bolt * uBolt * 1.6;
  }

  // Below horizon & heavy fog both melt into the fog/horizon colour.
  col = mix(col, uHorizon, (1.0 - smoothstep(-0.08, 0.0, h)));
  col = mix(col, uHorizon, uFog * (1.0 - smoothstep(0.0, 0.6, h) * 0.5));
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const mistFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
uniform float uTime;
uniform float uSeed;
varying vec2 vUv;
float n2(vec2 p){ return sin(p.x)*sin(p.y); }
void main() {
  vec2 c = vUv - 0.5;
  float r = length(c * vec2(1.0, 2.2));
  float soft = (1.0 - smoothstep(0.05, 0.5, r));
  float w = 0.65 + 0.35 * n2(vUv * 6.0 + vec2(uTime * 0.07 + uSeed, uSeed * 2.0));
  gl_FragColor = vec4(uColor, soft * w * uOpacity);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const mistVertex = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

const MIST_LAYOUT = [
  { pos: [-2.5, -1.5, 1.2], scale: [11, 3.2], speed: 0.12, seed: 0.3 },
  { pos: [2.6, -1.0, -0.6], scale: [12, 3.6], speed: -0.09, seed: 2.1 },
  { pos: [0.4, -0.4, -2.5], scale: [16, 4.2], speed: 0.07, seed: 4.7 },
];

function computeTaglineColor(skyHorizon, skyTop, out, light, dark) {
  const lum = (c) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  const brightness = lum(skyHorizon) * 0.6 + lum(skyTop) * 0.4;
  const t = Math.min(1, Math.max(0, (brightness - 0.32) / (0.55 - 0.32)));
  const e = t * t * (3 - 2 * t);
  out.copy(light).lerp(dark, e);
  return brightness;
}

export default function DayCycleSystem({ target = [0, 0, 0] }) {
  const { scene, gl } = useThree();
  const timeRef = useDayTime(0);
  const rainRef = useRef(null);
  const strike = useMemo(
    () => ({ nextAt: 2, start: -10, double: false, strength: 1, seed: 0, dir: new Vector3(0, 0.15, -1), reduced: false, force: false }),
    [],
  );
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const flashParam = new URLSearchParams(window.location.search).get('flash');
    strike.force = flashParam === '1';
    if (flashParam === '0') strike.reduced = true;
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const apply = () => {
      strike.reduced = Boolean(mq?.matches) || flashParam === '0';
    };
    apply();
    mq?.addEventListener?.('change', apply);
    return () => mq?.removeEventListener?.('change', apply);
  }, [strike]);
  const day = useMemo(() => createDayState(), []);
  const lightRef = useRef(null);
  const hemiRef = useRef(null);
  const skyRef = useRef(null);
  const skyMatRef = useRef(null);
  const mistRefs = useRef([]);
  const lastTagline = useRef('');
  const lastOverlay = useRef('');
  const tmp = useMemo(
    () => ({ v: new Vector3(), white: new Color('#ffffff'), c: new Color(), light: new Color('#EEF4FF'), dark: new Color('#1D2740') }),
    [],
  );
  const lightTarget = useMemo(() => {
    const o = new Object3D();
    o.position.set(...target);
    return o;
  }, [target[0], target[1], target[2]]);

  const skyUniforms = useMemo(
    () => ({
      uTop: { value: new Color() },
      uHorizon: { value: new Color() },
      uGlow: { value: new Color() },
      uGlowStrength: { value: 0 },
      uSunDir: { value: new Vector3(0, 1, 0) },
      uMoonDir: { value: new Vector3(0, -1, 0) },
      uMoon: { value: 0 },
      uStars: { value: 0 },
      uFog: { value: 0 },
      uTime: { value: 0 },
      uCloud: { value: 0 },
      uFlash: { value: 0 },
      uBolt: { value: 0 },
      uBoltSeed: { value: 0 },
      uFlashDir: { value: new Vector3(0, 0.15, -1).normalize() },
    }),
    [],
  );
  const mistUniforms = useMemo(
    () =>
      MIST_LAYOUT.map((m) => ({
        uColor: { value: new Color() },
        uOpacity: { value: 0 },
        uTime: { value: 0 },
        uSeed: { value: m.seed },
      })),
    [],
  );

  const fog = useMemo(() => new FogExp2('#cccccc', 0.02), []);

  useEffect(() => {
    const prevFog = scene.fog;
    const prevBg = scene.background;
    scene.fog = fog;
    scene.background = null;
    scene.add(lightTarget);
    return () => {
      scene.fog = prevFog;
      scene.background = prevBg;
      scene.remove(lightTarget);
      document.documentElement.style.removeProperty('--hero-tagline-color');
      document.documentElement.style.removeProperty('--hero-overlay-opacity');
    };
  }, [fog, lightTarget, scene]);

  useFrame((state) => {
    sampleDay(timeRef.current, day);
    const elapsed = state.clock.elapsedTime;

    // Lightning: random-interval strikes with optional double flicker (scalar state only).
    let flash = 0;
    let bolt = 0;
    if (!strike.reduced && day.lightning > 0.02) {
      if (strike.force && elapsed - strike.start > 1.6) strike.nextAt = elapsed;
      if (elapsed >= strike.nextAt) {
        strike.start = elapsed;
        strike.double = Math.random() < 0.45;
        strike.strength = 0.55 + Math.random() * 0.45;
        strike.seed = Math.random() * 100;
        strike.dir.set(-0.9 + Math.random() * 1.8, 0.1 + Math.random() * 0.12, -1).normalize();
        strike.nextAt = elapsed + (1.2 + Math.random() * 5.5) / (0.35 + day.lightning);
      }
      const dt = elapsed - strike.start;
      if (dt >= 0 && dt < 1.2) {
        let env = Math.exp(-dt * 13);
        if (strike.double && dt > 0.15) env += 0.85 * Math.exp(-(dt - 0.15) * 11);
        flash = Math.min(1, env * strike.strength * Math.min(1, day.lightning * 1.6));
        bolt = dt < 0.3 ? flash : 0;
      }
    }

    // Shared sun/moon directional light.
    const light = lightRef.current;
    if (light) {
      light.target = lightTarget;
      tmp.v.copy(day.lightDir);
      if (tmp.v.y < 0.08) tmp.v.y = 0.08;
      tmp.v.normalize();
      light.position.copy(lightTarget.position).addScaledVector(tmp.v, LIGHT_DISTANCE);
      light.color.copy(day.lightColor);
      light.intensity = day.lightIntensity + flash * 1.1;
    }
    const hemi = hemiRef.current;
    if (hemi) {
      hemi.color.copy(day.hemiSky);
      hemi.groundColor.copy(day.hemiGround);
      hemi.intensity = day.hemiIntensity + flash * 0.8;
    }

    fog.color.copy(day.fogColor);
    fog.density = day.fogDensity;
    gl.toneMappingExposure = day.exposure;

    // Write to the material's live uniforms (R3F/three may copy the uniform objects).
    const u = skyMatRef.current?.uniforms ?? skyUniforms;
    u.uTop.value.copy(day.skyTop);
    // Horizon matches fog so the ground fades seamlessly into the sky.
    u.uHorizon.value.copy(day.skyHorizon).lerp(day.fogColor, Math.min(1, day.fogDensity * 6));
    u.uGlow.value.copy(day.glowColor);
    u.uGlowStrength.value = day.glowStrength;
    u.uSunDir.value.copy(day.sunDir);
    u.uMoonDir.value.copy(day.moonDir);
    u.uMoon.value = day.moonIntensity;
    u.uStars.value = day.starOpacity;
    u.uFog.value = Math.min(1, Math.max(0, (day.fogDensity - 0.03) / 0.12));
    u.uTime.value = elapsed;
    u.uCloud.value = day.cloudiness;
    u.uFlash.value = flash;
    u.uBolt.value = bolt;
    u.uBoltSeed.value = strike.seed;
    u.uFlashDir.value.copy(strike.dir);

    const rain = rainRef.current;
    if (rain) {
      rain.visible = day.rain > 0.01;
      const ru = rain.material.uniforms;
      ru.uTime.value = elapsed;
      ru.uRain.value = day.rain;
      ru.uOpacity.value = 0.3 + flash * 0.4;
      ru.uColor.value.copy(day.fogColor).lerp(tmp.white, 0.55);
    }
    if (skyRef.current) skyRef.current.position.copy(state.camera.position);

    MIST_LAYOUT.forEach((m, i) => {
      const mesh = mistRefs.current[i];
      const mu = mesh?.material?.uniforms ?? mistUniforms[i];
      mu.uColor.value.copy(day.fogColor);
      mu.uOpacity.value = day.mistOpacity;
      mu.uTime.value = elapsed;
      if (mesh) {
        mesh.visible = day.mistOpacity > 0.005;
        mesh.position.x = m.pos[0] + Math.sin(elapsed * m.speed + m.seed) * 1.6;
        mesh.quaternion.copy(state.camera.quaternion);
      }
    });

    const brightness = computeTaglineColor(u.uHorizon.value, day.skyTop, tmp.c, tmp.light, tmp.dark);
    // Page wash overlay over the canvas: fade it out at night so stars/moon read.
    const overlay = ((0.15 + 0.85 * Math.min(1, Math.max(0, (brightness - 0.08) / 0.4))) * (1 - day.cloudiness * 0.6)).toFixed(2);
    if (overlay !== lastOverlay.current) {
      document.documentElement.style.setProperty('--hero-overlay-opacity', overlay);
      lastOverlay.current = overlay;
    }
    const css = `rgb(${Math.round(tmp.c.r * 255)}, ${Math.round(tmp.c.g * 255)}, ${Math.round(tmp.c.b * 255)})`;
    if (css !== lastTagline.current) {
      document.documentElement.style.setProperty('--hero-tagline-color', css);
      lastTagline.current = css;
    }
  });

  return (
    <>
      <hemisphereLight ref={hemiRef} args={['#bfe4ff', '#55624a', 0.6]} />
      <directionalLight
        ref={lightRef}
        castShadow
        intensity={1}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0005}
        shadow-normalBias={0.03}
        shadow-camera-near={1}
        shadow-camera-far={LIGHT_DISTANCE * 2}
        shadow-camera-left={-SHADOW_HALF_EXTENT}
        shadow-camera-right={SHADOW_HALF_EXTENT}
        shadow-camera-top={SHADOW_HALF_EXTENT}
        shadow-camera-bottom={-SHADOW_HALF_EXTENT}
      />
      <RainLayer ref={rainRef} />
      <mesh ref={skyRef} frustumCulled={false} renderOrder={-1}>
        <sphereGeometry args={[SKY_RADIUS, 32, 16]} />
        <shaderMaterial
          ref={skyMatRef}
          side={BackSide}
          depthWrite={false}
          uniforms={skyUniforms}
          vertexShader={skyVertex}
          fragmentShader={skyFragment}
        />
      </mesh>
      {MIST_LAYOUT.map((m, i) => (
        <mesh
          key={`mist-${i}`}
          ref={(node) => {
            mistRefs.current[i] = node;
          }}
          position={m.pos}
          scale={[m.scale[0], m.scale[1], 1]}
          renderOrder={2}
        >
          <planeGeometry args={[1, 1]} />
          <shaderMaterial
            transparent
            depthWrite={false}
            uniforms={mistUniforms[i]}
            vertexShader={mistVertex}
            fragmentShader={mistFragment}
          />
        </mesh>
      ))}
    </>
  );
}
