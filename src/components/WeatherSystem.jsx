import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const WEATHER_TYPES = [
  { name: 'day', bgColor: 0x87CEEB, particleType: 0, speed: 0.5 },
  { name: 'night', bgColor: 0x0A0E27, particleType: 1, speed: 0 },
  { name: 'wind', bgColor: 0x6B7280, particleType: 2, speed: 2.0 },
  { name: 'rain', bgColor: 0x4A5568, particleType: 3, speed: 3.0 },
  { name: 'lightning', bgColor: 0x1F2937, particleType: 4, speed: 3.0 },
  { name: 'snow', bgColor: 0xE5E7EB, particleType: 5, speed: 0.3 },
  { name: 'tornado', bgColor: 0x374151, particleType: 6, speed: 1.5 },
];

const vertexShader = `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uParticleType;
  
  attribute float aRandom;
  attribute float aScale;
  
  varying float vAlpha;
  varying float vRandom;
  
  void main() {
    vec3 pos = position;
    float t = uTime * uSpeed;
    float pi = 3.14159265359;
    
    if (uParticleType < 0.5) {
      // Day - Floating clouds
      float drift = t * 0.3 + aRandom * 20.0;
      pos.x = mod(pos.x + drift, 40.0) - 20.0;
      pos.y += sin(t * 0.5 + aRandom * pi * 2.0) * 0.1;
    } else if (uParticleType < 1.5) {
      // Night - Static stars with twinkle
      vAlpha = 0.4 + 0.6 * sin(t * 3.0 + aRandom * pi * 2.0);
    } else if (uParticleType < 2.5) {
      // Wind - Fast horizontal movement
      float drift = t * 2.0 + aRandom * 20.0;
      pos.x = mod(pos.x + drift, 40.0) - 20.0;
      pos.y += sin(t * 2.0 + aRandom * pi) * 0.3;
    } else if (uParticleType < 3.5) {
      // Rain - Falling drops
      pos.y = mod(pos.y - t * 3.0 + aRandom * 20.0, 25.0) - 10.0;
      pos.x += sin(t * 4.0 + aRandom * pi * 2.0) * 0.05;
    } else if (uParticleType < 4.5) {
      // Lightning - Rain with flash
      pos.y = mod(pos.y - t * 3.0 + aRandom * 20.0, 25.0) - 10.0;
    } else if (uParticleType < 5.5) {
      // Snow - Gentle falling
      float angle = t * 0.5 + aRandom * pi * 2.0;
      pos.y = mod(pos.y - t * 0.3 + aRandom * 20.0, 25.0) - 10.0;
      pos.x += sin(angle) * 0.1;
      pos.z += cos(angle * 0.5) * 0.05;
    } else {
      // Tornado - Spinning spiral
      float angle = t * 3.0 + aRandom * pi * 2.0;
      float radius = 2.0 + sin(aRandom * pi) * 1.5;
      pos.x = cos(angle) * radius;
      pos.z = sin(angle) * radius;
      pos.y = mod(pos.y - t * 1.5 + aRandom * 20.0, 25.0) - 10.0;
    }
    
    vAlpha = 0.8;
    vRandom = aRandom;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aScale * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying float vAlpha;
  varying float vRandom;
  
  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    
    float alpha = vAlpha * (1.0 - dist * 2.0);
    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha * 0.9);
  }
`;

export default function WeatherSystem() {
  const [currentWeatherIndex, setCurrentWeatherIndex] = useState(0);
  const pointsRef = useRef();
  const lightningFlashRef = useRef(false);
  
  const currentWeather = WEATHER_TYPES[currentWeatherIndex];
  
  const { positions, randoms, scales } = useMemo(() => {
    const count = 1500;
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);
    const scales = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 20 - 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      randoms[i] = Math.random();
      scales[i] = 0.05 + Math.random() * 0.1;
    }
    
    return { positions, randoms, scales };
  }, []);
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uSpeed: { value: currentWeather.speed },
    uParticleType: { value: currentWeather.particleType },
  }), []);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWeatherIndex((prev) => (prev + 1) % WEATHER_TYPES.length);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    uniforms.uSpeed.value = currentWeather.speed;
    uniforms.uParticleType.value = currentWeather.particleType;
  }, [currentWeather, uniforms]);
  
  useEffect(() => {
    if (currentWeather.name === 'lightning') {
      const flashInterval = setInterval(() => {
        if (Math.random() > 0.7) {
          lightningFlashRef.current = true;
          setTimeout(() => {
            lightningFlashRef.current = false;
          }, 100);
        }
      }, 500);
      
      return () => clearInterval(flashInterval);
    }
  }, [currentWeather.name]);
  
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.material.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });
  
  const bgColor = useMemo(() => {
    if (currentWeather.name === 'lightning' && lightningFlashRef.current) {
      return 0xFFFFFF;
    }
    return currentWeather.bgColor;
  }, [currentWeather, lightningFlashRef.current]);
  
  return (
    <>
      <mesh position={[0, 0, -15]}>
        <planeGeometry args={[50, 30]} />
        <meshBasicMaterial color={bgColor} />
      </mesh>
      
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute 
            attach="attributes-position" 
            count={positions.length / 3} 
            array={positions} 
            itemSize={3} 
          />
          <bufferAttribute 
            attach="attributes-aRandom" 
            count={randoms.length} 
            array={randoms} 
            itemSize={1} 
          />
          <bufferAttribute 
            attach="attributes-aScale" 
            count={scales.length} 
            array={scales} 
            itemSize={1} 
          />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}
