import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Weather Configuration
 * 7 weather types, each lasting 10 seconds (70s total cycle)
 */
const WEATHERS = [
  { name: 'day', duration: 10000, bgGradient: ['#87CEEB', '#98D8C8', '#7CB342'] },
  { name: 'night', duration: 10000, bgGradient: ['#0A0E27', '#151B3B', '#1A1F3A'] },
  { name: 'wind', duration: 10000, bgGradient: ['#6B7280', '#4B5563', '#374151'] },
  { name: 'rain', duration: 10000, bgGradient: ['#4A5568', '#2D3748', '#1A202C'] },
  { name: 'lightning', duration: 10000, bgGradient: ['#1F2937', '#111827', '#0A0E27'] },
  { name: 'snow', duration: 10000, bgGradient: ['#E5E7EB', '#D1D5DB', '#9CA3AF'] },
  { name: 'tornado', duration: 10000, bgGradient: ['#374151', '#1F2937', '#111827'] },
];

/**
 * Weather System Component
 * Manages weather transitions and particle effects
 * 
 * Features:
 * - 7 weather types cycling automatically
 * - 10 seconds per weather (70s total cycle)
 * - Particle effects for rain, snow, wind, etc.
 * - Smooth transitions between weathers
 */
export default function WeatherSystem() {
  const [currentWeatherIndex, setCurrentWeatherIndex] = useState(0);
  const timerRef = useRef(0);
  const particlesRef = useRef([]);
  
  const currentWeather = WEATHERS[currentWeatherIndex];
  
  // Auto-switch weather based on duration
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWeatherIndex((prev) => (prev + 1) % WEATHERS.length);
    }, currentWeather.duration);
    
    return () => clearInterval(interval);
  }, [currentWeatherIndex, currentWeather.duration]);
  
  // Create particle system
  const particles = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const count = 500;
    
    for (let i = 0; i < count; i++) {
      positions.push(
        (Math.random() - 0.5) * 20,
        Math.random() * 15,
        (Math.random() - 0.5) * 10
      );
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 0.05,
      transparent: true,
      opacity: 0,
    });
    
    return new THREE.Points(geometry, material);
  }, []);
  
  // Animation loop
  useFrame((state, delta) => {
    if (!particlesRef.current) return;
    
    const positions = particlesRef.current.geometry.attributes.position;
    const weather = currentWeather.name;
    
    // Update particles based on weather type
    if (weather === 'night') {
      // Twinkling stars
      particlesRef.current.material.opacity = 0.8;
      particlesRef.current.material.color.setHex(0xFFFFFF);
      
      for (let i = 0; i < positions.count; i++) {
        positions.array[i * 3 + 1] += 0; // Static
      }
    } else if (weather === 'rain') {
      // Falling raindrops
      particlesRef.current.material.opacity = 0.7;
      particlesRef.current.material.color.setHex(0x9CA3AF);
      
      for (let i = 0; i < positions.count; i++) {
        positions.array[i * 3 + 1] -= 0.3;
        
        if (positions.array[i * 3 + 1] < -5) {
          positions.array[i * 3 + 1] = 15;
        }
      }
    } else if (weather === 'snow') {
      // Falling snowflakes
      particlesRef.current.material.opacity = 0.9;
      particlesRef.current.material.color.setHex(0xFFFFFF);
      
      for (let i = 0; i < positions.count; i++) {
        positions.array[i * 3 + 1] -= 0.05;
        positions.array[i * 3] += Math.sin(state.clock.elapsedTime + i) * 0.02;
        
        if (positions.array[i * 3 + 1] < -5) {
          positions.array[i * 3 + 1] = 15;
        }
      }
    } else if (weather === 'wind') {
      // Wind particles
      particlesRef.current.material.opacity = 0.6;
      particlesRef.current.material.color.setHex(0xD1D5DB);
      
      for (let i = 0; i < positions.count; i++) {
        positions.array[i * 3] += 0.2;
        
        if (positions.array[i * 3] > 10) {
          positions.array[i * 3] = -10;
        }
      }
    } else {
      // Other weather types: fade out particles
      particlesRef.current.material.opacity *= 0.95;
    }
    
    positions.needsUpdate = true;
  });
  
  return (
    <>
      {/* Background plane */}
      <mesh position={[0, 0, -15]}>
        <planeGeometry args={[50, 30]} />
        <meshBasicMaterial color={currentWeather.bgGradient[1]} />
      </mesh>
      
      {/* Particles */}
      <primitive ref={particlesRef} object={particles} />
    </>
  );
}
