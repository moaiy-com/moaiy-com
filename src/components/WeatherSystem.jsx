import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, BackSide, Color, MathUtils } from 'three';

const WEATHER_TYPES = [
  {
    name: 'day',
    mode: 'drift',
    topColor: '#73c6ff',
    bottomColor: '#e8f7ff',
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

const SKY_VERTEX_SHADER = `
  varying vec3 vWorldPosition;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SKY_FRAGMENT_SHADER = `
  uniform vec3 uTopColor;
  uniform vec3 uBottomColor;
  varying vec3 vWorldPosition;

  void main() {
    float h = normalize(vWorldPosition + vec3(0.0, 8.0, 0.0)).y;
    float mixStrength = smoothstep(-0.35, 0.9, h);
    vec3 finalColor = mix(uBottomColor, uTopColor, mixStrength);
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export default function WeatherSystem() {
  const [currentWeatherIndex, setCurrentWeatherIndex] = useState(0);
  const [lightningFlash, setLightningFlash] = useState(false);
  const pointsRef = useRef();
  const skyMaterialRef = useRef();
  const flashStrengthRef = useRef(0);

  const currentWeather = WEATHER_TYPES[currentWeatherIndex];

  const topColorRef = useRef(new Color(WEATHER_TYPES[0].topColor));
  const bottomColorRef = useRef(new Color(WEATHER_TYPES[0].bottomColor));
  const topTargetRef = useRef(new Color(WEATHER_TYPES[0].topColor));
  const bottomTargetRef = useRef(new Color(WEATHER_TYPES[0].bottomColor));
  const whiteRef = useRef(new Color(0xFFFFFF));
  const topWorkRef = useRef(new Color(WEATHER_TYPES[0].topColor));
  const bottomWorkRef = useRef(new Color(WEATHER_TYPES[0].bottomColor));

  const skyUniforms = useMemo(
    () => ({
      uTopColor: { value: new Color(WEATHER_TYPES[0].topColor) },
      uBottomColor: { value: new Color(WEATHER_TYPES[0].bottomColor) },
    }),
    [],
  );

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
    const interval = setInterval(() => {
      setCurrentWeatherIndex((prev) => (prev + 1) % WEATHER_TYPES.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    topTargetRef.current.set(currentWeather.topColor);
    bottomTargetRef.current.set(currentWeather.bottomColor);
  }, [currentWeather.topColor, currentWeather.bottomColor]);

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

    flashStrengthRef.current = MathUtils.damp(
      flashStrengthRef.current,
      lightningFlash ? 0.75 : 0,
      9,
      delta,
    );

    if (skyMaterialRef.current) {
      topWorkRef.current
        .copy(topColorRef.current)
        .lerp(whiteRef.current, flashStrengthRef.current);
      bottomWorkRef.current
        .copy(bottomColorRef.current)
        .lerp(whiteRef.current, flashStrengthRef.current * 0.45);

      skyMaterialRef.current.uniforms.uTopColor.value.copy(topWorkRef.current);
      skyMaterialRef.current.uniforms.uBottomColor.value.copy(bottomWorkRef.current);
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
    <>
      <mesh position={[0, 0, -20]}>
        <sphereGeometry args={[34, 48, 32]} />
        <shaderMaterial
          ref={skyMaterialRef}
          depthWrite={false}
          fragmentShader={SKY_FRAGMENT_SHADER}
          side={BackSide}
          uniforms={skyUniforms}
          vertexShader={SKY_VERTEX_SHADER}
        />
      </mesh>

      <mesh position={[0, -2.4, -3]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.5, 13.5, 96]} />
        <meshBasicMaterial color="#7EE8DF" opacity={0.06} transparent />
      </mesh>

      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particleData.positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          blending={AdditiveBlending}
          color={currentWeather.particleColor}
          depthWrite={false}
          opacity={currentWeather.particleOpacity}
          size={currentWeather.particleSize}
          sizeAttenuation
          transparent
        />
      </points>
    </>
  );
}
