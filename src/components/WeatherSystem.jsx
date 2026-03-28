import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  MathUtils,
} from 'three';

const WEATHER_TYPES = [
  {
    name: 'day',
    mode: 'drift',
    topColor: '#73c6ff',
    bottomColor: '#e8f7ff',
    skyBrightness: 1.0,
    speed: 0.45,
    particleCount: 240,
    particleColor: '#ffffff',
    particleSize: 0.09,
    particleOpacity: 0.58,
  },
  {
    name: 'night',
    mode: 'stars',
    topColor: '#0a1028',
    bottomColor: '#111e42',
    skyBrightness: 0.34,
    speed: 0.18,
    particleCount: 420,
    particleColor: '#d6e8ff',
    particleSize: 0.055,
    particleOpacity: 0.9,
  },
  {
    name: 'wind',
    mode: 'wind',
    topColor: '#4f5f77',
    bottomColor: '#96a9c4',
    skyBrightness: 0.74,
    speed: 1.5,
    particleCount: 470,
    particleColor: '#e7f4ff',
    particleSize: 0.07,
    particleOpacity: 0.62,
  },
  {
    name: 'rain',
    mode: 'rain',
    topColor: '#2b3a5a',
    bottomColor: '#4e6488',
    skyBrightness: 0.58,
    speed: 2.6,
    particleCount: 820,
    particleColor: '#b8d4ff',
    particleSize: 0.048,
    particleOpacity: 0.78,
  },
  {
    name: 'lightning',
    mode: 'rain',
    topColor: '#202a45',
    bottomColor: '#3b4f74',
    skyBrightness: 0.5,
    speed: 2.8,
    particleCount: 860,
    particleColor: '#c3dbff',
    particleSize: 0.05,
    particleOpacity: 0.82,
  },
  {
    name: 'snow',
    mode: 'snow',
    topColor: '#95b5d1',
    bottomColor: '#dcecff',
    skyBrightness: 0.9,
    speed: 0.32,
    particleCount: 720,
    particleColor: '#ffffff',
    particleSize: 0.09,
    particleOpacity: 0.72,
  },
  {
    name: 'tornado',
    mode: 'tornado',
    topColor: '#30343f',
    bottomColor: '#626874',
    skyBrightness: 0.46,
    speed: 1.2,
    particleCount: 980,
    particleColor: '#d3dee8',
    particleSize: 0.06,
    particleOpacity: 0.7,
  },
];

const MAX_PARTICLE_COUNT = WEATHER_TYPES.reduce(
  (max, weather) => Math.max(max, weather.particleCount),
  0,
);

function colorToCss(color) {
  const r = Math.round(Math.min(1, Math.max(0, color.r)) * 255);
  const g = Math.round(Math.min(1, Math.max(0, color.g)) * 255);
  const b = Math.round(Math.min(1, Math.max(0, color.b)) * 255);
  return `rgb(${r}, ${g}, ${b})`;
}

export default function WeatherSystem() {
  const { scene } = useThree();
  const [currentWeatherIndex, setCurrentWeatherIndex] = useState(0);
  const [lightningFlash, setLightningFlash] = useState(false);

  const pointsRef = useRef();
  const skyCanvasRef = useRef(null);
  const skyContextRef = useRef(null);
  const skyTextureRef = useRef(null);

  const flashStrengthRef = useRef(0);
  const brightnessRef = useRef(WEATHER_TYPES[0].skyBrightness);
  const brightnessTargetRef = useRef(WEATHER_TYPES[0].skyBrightness);

  const currentWeather = WEATHER_TYPES[currentWeatherIndex];

  const topColorRef = useRef(new Color(WEATHER_TYPES[0].topColor));
  const bottomColorRef = useRef(new Color(WEATHER_TYPES[0].bottomColor));
  const topTargetRef = useRef(new Color(WEATHER_TYPES[0].topColor));
  const bottomTargetRef = useRef(new Color(WEATHER_TYPES[0].bottomColor));

  const whiteRef = useRef(new Color(0xFFFFFF));
  const topWorkRef = useRef(new Color(WEATHER_TYPES[0].topColor));
  const midWorkRef = useRef(new Color(WEATHER_TYPES[0].bottomColor));
  const bottomWorkRef = useRef(new Color(WEATHER_TYPES[0].bottomColor));
  const taglineColorRef = useRef(new Color('#EEF4FF'));
  const taglineLightRef = useRef(new Color('#EEF4FF'));
  const taglineDarkRef = useRef(new Color('#1D2740'));
  const lastTaglineCssRef = useRef('');

  const skyTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 512;

    const context = canvas.getContext('2d');
    skyCanvasRef.current = canvas;
    skyContextRef.current = context;

    const texture = new CanvasTexture(canvas);
    texture.needsUpdate = true;

    skyTextureRef.current = texture;
    return texture;
  }, []);

  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;

    const context = canvas.getContext('2d');
    if (context) {
      const gradient = context.createRadialGradient(32, 32, 3, 32, 32, 30);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.42, 'rgba(255,255,255,0.82)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    const texture = new CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  const particleData = useMemo(() => {
    const positions = new Float32Array(MAX_PARTICLE_COUNT * 3);
    const randoms = new Float32Array(MAX_PARTICLE_COUNT);

    for (let i = 0; i < MAX_PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 44;
      positions[i * 3 + 1] = Math.random() * 21 - 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 24;
      randoms[i] = Math.random();
    }

    return { positions, randoms };
  }, []);

  useEffect(() => {
    scene.background = skyTexture;
    document.documentElement.style.setProperty('--hero-tagline-color', 'rgb(238, 244, 255)');
    lastTaglineCssRef.current = 'rgb(238, 244, 255)';

    return () => {
      if (scene.background === skyTexture) {
        scene.background = null;
      }
      document.documentElement.style.removeProperty('--hero-tagline-color');
      skyTexture.dispose();
      particleTexture.dispose();
    };
  }, [particleTexture, scene, skyTexture]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWeatherIndex((prev) => (prev + 1) % WEATHER_TYPES.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    topTargetRef.current.set(currentWeather.topColor);
    bottomTargetRef.current.set(currentWeather.bottomColor);
    brightnessTargetRef.current = currentWeather.skyBrightness;
  }, [currentWeather.topColor, currentWeather.bottomColor, currentWeather.skyBrightness]);

  useEffect(() => {
    if (currentWeather.name !== 'lightning') {
      setLightningFlash(false);
      return;
    }

    let timeoutId;
    const interval = setInterval(() => {
      if (Math.random() > 0.74) {
        setLightningFlash(true);
        timeoutId = setTimeout(() => setLightningFlash(false), 120);
      }
    }, 520);

    return () => {
      clearInterval(interval);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [currentWeather.name]);

  useEffect(() => {
    const geometry = pointsRef.current?.geometry;
    if (geometry) {
      geometry.setDrawRange(0, currentWeather.particleCount);
    }
  }, [currentWeather.particleCount]);

  useFrame((state, delta) => {
    topColorRef.current.lerp(topTargetRef.current, 1 - Math.exp(-delta * 1.6));
    bottomColorRef.current.lerp(bottomTargetRef.current, 1 - Math.exp(-delta * 1.6));
    brightnessRef.current = MathUtils.damp(
      brightnessRef.current,
      brightnessTargetRef.current,
      2.2,
      delta,
    );

    flashStrengthRef.current = MathUtils.damp(
      flashStrengthRef.current,
      lightningFlash ? 0.78 : 0,
      9,
      delta,
    );

    const flashStrength = flashStrengthRef.current;
    const brightness = brightnessRef.current * (1 + flashStrength * 0.5);
    const textBlend = MathUtils.smoothstep(brightnessRef.current, 0.72, 1.05);

    taglineColorRef.current
      .copy(taglineLightRef.current)
      .lerp(taglineDarkRef.current, textBlend);
    const taglineCss = colorToCss(taglineColorRef.current);
    if (taglineCss !== lastTaglineCssRef.current) {
      document.documentElement.style.setProperty('--hero-tagline-color', taglineCss);
      lastTaglineCssRef.current = taglineCss;
    }

    topWorkRef.current
      .copy(topColorRef.current)
      .multiplyScalar(brightness)
      .lerp(whiteRef.current, flashStrength * 0.4);

    bottomWorkRef.current
      .copy(bottomColorRef.current)
      .multiplyScalar(brightness * 0.96)
      .lerp(whiteRef.current, flashStrength * 0.22);

    midWorkRef.current
      .copy(topWorkRef.current)
      .lerp(bottomWorkRef.current, 0.58);

    const canvas = skyCanvasRef.current;
    const context = skyContextRef.current;
    if (canvas && context) {
      const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, colorToCss(topWorkRef.current));
      gradient.addColorStop(0.56, colorToCss(midWorkRef.current));
      gradient.addColorStop(1, colorToCss(bottomWorkRef.current));

      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);

      if (flashStrength > 0.01) {
        context.fillStyle = `rgba(255,255,255,${(flashStrength * 0.16).toFixed(3)})`;
        context.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (skyTextureRef.current) {
        skyTextureRef.current.needsUpdate = true;
      }
    }

    const geometry = pointsRef.current?.geometry;
    if (!geometry) {
      return;
    }

    const positions = geometry.attributes.position.array;
    const count = currentWeather.particleCount;
    const time = state.clock.elapsedTime;
    const speed = currentWeather.speed;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const random = particleData.randoms[i];

      switch (currentWeather.mode) {
        case 'drift':
          positions[i3] += speed * delta * 3.2;
          if (positions[i3] > 22) {
            positions[i3] = -22;
          }
          positions[i3 + 1] += Math.sin(time * 0.75 + random * Math.PI * 2) * 0.003;
          break;
        case 'stars':
          positions[i3 + 1] += Math.sin(time * 1.9 + random * 24) * 0.0007;
          positions[i3] += Math.cos(time * 0.35 + random * Math.PI * 2) * 0.0006;
          break;
        case 'wind':
          positions[i3] += speed * delta * 18;
          if (positions[i3] > 22) {
            positions[i3] = -22;
            positions[i3 + 1] = Math.random() * 21 - 10;
            positions[i3 + 2] = (Math.random() - 0.5) * 24;
          }
          positions[i3 + 2] += Math.sin(time * 3 + random * Math.PI * 2) * 0.011;
          break;
        case 'rain':
          positions[i3 + 1] -= speed * delta * 19;
          positions[i3] += Math.sin(time * 6 + random * Math.PI * 2) * 0.016;
          if (positions[i3 + 1] < -10) {
            positions[i3 + 1] = 11;
            positions[i3] = (Math.random() - 0.5) * 44;
          }
          break;
        case 'snow':
          positions[i3 + 1] -= speed * delta * 4.2;
          positions[i3] += Math.sin(time * 1.2 + random * Math.PI * 2) * 0.03;
          positions[i3 + 2] += Math.cos(time * 0.65 + random * Math.PI * 2) * 0.02;
          if (positions[i3 + 1] < -10) {
            positions[i3 + 1] = 11;
            positions[i3] = (Math.random() - 0.5) * 44;
          }
          break;
        case 'tornado': {
          const angle = time * 2.4 + random * Math.PI * 2;
          const radius = 1.2 + random * 2.3 + (positions[i3 + 1] + 10) * 0.05;
          positions[i3] = Math.cos(angle) * radius;
          positions[i3 + 2] = Math.sin(angle) * radius;
          positions[i3 + 1] -= speed * delta * 10;
          if (positions[i3 + 1] < -10) {
            positions[i3 + 1] = 11;
          }
          break;
        }
      }
    }

    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particleData.positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        alphaTest={0.02}
        blending={AdditiveBlending}
        color={currentWeather.particleColor}
        depthTest={false}
        depthWrite={false}
        map={particleTexture}
        opacity={currentWeather.particleOpacity}
        size={currentWeather.particleSize}
        sizeAttenuation
        transparent
      />
    </points>
  );
}
