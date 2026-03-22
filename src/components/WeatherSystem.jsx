import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const WEATHER_TYPES = [
  { name: 'day', bgColor: 0x87CEEB, speed: 0.5, particleCount: 200 },
  { name: 'night', bgColor: 0x0A0E27, speed: 0, particleCount: 500 },
  { name: 'wind', bgColor: 0x6B7280, speed: 2.0, particleCount: 400 },
  { name: 'rain', bgColor: 0x4A5568, speed: 3.0, particleCount: 800 },
  { name: 'lightning', bgColor: 0x1F2937, speed: 3.0, particleCount: 800 },
  { name: 'snow', bgColor: 0xE5E7EB, speed: 0.3, particleCount: 600 },
  { name: 'tornado', bgColor: 0x374151, speed: 1.5, particleCount: 1000 },
];

export default function WeatherSystem() {
  const [currentWeatherIndex, setCurrentWeatherIndex] = useState(0);
  const [lightningFlash, setLightningFlash] = useState(false);
  const pointsRef = useRef();
  const particleRef = useRef();
  
  const currentWeather = WEATHER_TYPES[currentWeatherIndex];
  
  const particleData = useMemo(() => {
    const count = 1500;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const randoms = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 20 - 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      velocities[i * 3] = 0;
      velocities[i * 3 + 1] = 0;
      velocities[i * 3 + 2] = 0;
      randoms[i] = Math.random();
    }
    
    return { positions, velocities, randoms };
  }, []);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWeatherIndex((prev) => (prev + 1) % WEATHER_TYPES.length);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (currentWeather.name === 'lightning') {
      const flashInterval = setInterval(() => {
        if (Math.random() > 0.7) {
          setLightningFlash(true);
          setTimeout(() => setLightningFlash(false), 100);
        }
      }, 500);
      
      return () => clearInterval(flashInterval);
    }
  }, [currentWeather.name]);
  
  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    const positions = pointsRef.current.geometry.attributes.position.array;
    const count = currentWeather.particleCount;
    const speed = currentWeather.speed * delta * 10;
    const time = state.clock.elapsedTime;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const random = particleData.randoms[i];
      
      switch (currentWeather.name) {
        case 'day':
          positions[i3] += speed * 0.3;
          if (positions[i3] > 20) positions[i3] = -20;
          positions[i3 + 1] += Math.sin(time + random * Math.PI * 2) * 0.002;
          break;
          
        case 'night':
          break;
          
        case 'wind':
          positions[i3] += speed * 4;
          if (positions[i3] > 20) {
            positions[i3] = -20;
            positions[i3 + 1] = Math.random() * 20 - 10;
          }
          positions[i3 + 1] += Math.sin(time * 2 + random * Math.PI) * 0.05;
          break;
          
        case 'rain':
        case 'lightning':
          positions[i3 + 1] -= speed * 6;
          positions[i3] += Math.sin(time * 4 + random * Math.PI * 2) * 0.01;
          if (positions[i3 + 1] < -10) {
            positions[i3 + 1] = 10;
            positions[i3] = (Math.random() - 0.5) * 40;
          }
          break;
          
        case 'snow':
          positions[i3 + 1] -= speed * 0.5;
          positions[i3] += Math.sin(time + random * Math.PI * 2) * 0.02;
          positions[i3 + 2] += Math.cos(time + random * Math.PI) * 0.01;
          if (positions[i3 + 1] < -10) {
            positions[i3 + 1] = 10;
            positions[i3] = (Math.random() - 0.5) * 40;
          }
          break;
          
        case 'tornado':
          const angle = time * 3 + random * Math.PI * 2;
          const radius = 2 + Math.sin(random * Math.PI) * 1.5;
          positions[i3] = Math.cos(angle) * radius;
          positions[i3 + 2] = Math.sin(angle) * radius;
          positions[i3 + 1] -= speed * 2;
          if (positions[i3 + 1] < -10) {
            positions[i3 + 1] = 10;
          }
          break;
      }
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });
  
  const bgColor = currentWeather.name === 'lightning' && lightningFlash
    ? 0xFFFFFF
    : currentWeather.bgColor;
  
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
            args={[particleData.positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={currentWeather.name === 'snow' ? 0.08 : 0.05}
          color={currentWeather.name === 'snow' || currentWeather.name === 'day' ? 0xFFFFFF : 0x88AACC}
          transparent
          opacity={currentWeather.name === 'night' ? 0.9 : 0.7}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </>
  );
}
