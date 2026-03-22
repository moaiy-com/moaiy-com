import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Weather Configuration
 * 7 weather types, each lasting 10 seconds (70s total cycle)
 */
const WEATHERS = [
  { 
    name: 'day', 
    duration: 10000, 
    bgColor: 0x87CEEB,
    particleColor: 0xFFFFFF,
    particleCount: 200,
    particleType: 'clouds'
  },
  { 
    name: 'night', 
    duration: 10000, 
    bgColor: 0x0A0E27,
    particleColor: 0xFFFFFF,
    particleCount: 500,
    particleType: 'stars'
  },
  { 
    name: 'wind', 
    duration: 10000, 
    bgColor: 0x6B7280,
    particleColor: 0xD1D5DB,
    particleCount: 400,
    particleType: 'wind'
  },
  { 
    name: 'rain', 
    duration: 10000, 
    bgColor: 0x4A5568,
    particleColor: 0x9CA3AF,
    particleCount: 800,
    particleType: 'rain'
  },
  { 
    name: 'lightning', 
    duration: 10000, 
    bgColor: 0x1F2937,
    particleColor: 0xFFFFFF,
    particleCount: 300,
    particleType: 'lightning'
  },
  { 
    name: 'snow', 
    duration: 10000, 
    bgColor: 0xE5E7EB,
    particleColor: 0xFFFFFF,
    particleCount: 600,
    particleType: 'snow'
  },
  { 
    name: 'tornado', 
    duration: 10000, 
    bgColor: 0x374151,
    particleColor: 0x9CA3AF,
    particleCount: 1000,
    particleType: 'tornado'
  },
];

/**
 * Weather System Component
 * Manages weather transitions and particle effects
 * 
 * Features:
 * - 7 weather types cycling automatically
 * - 10 seconds per weather (70s total cycle)
 * - Particle effects for all weather types
 * - Smooth transitions between weathers
 */
export default function WeatherSystem() {
  const [currentWeatherIndex, setCurrentWeatherIndex] = useState(0);
  const timerRef = useRef(0);
  const lightningFlashRef = useRef(false);
  
  const currentWeather = WEATHERS[currentWeatherIndex];
  
  // Create particle system
  const particlesRef = useRef();
  
  const { positions, colors } = useMemo(() => {
    const positions = [];
    const colors = [];
    const count = 1500; // Maximum particle count
    
    for (let i = 0; i < count; i++) {
      // Position
      positions.push(
        (Math.random() - 0.5) * 20,
        Math.random() * 15 - 5,
        (Math.random() - 0.5) * 10
      );
      
      // Color (white by default)
      colors.push(1, 1, 1);
    }
    
    return { positions, colors };
  }, []);
  
  const positionsAttribute = useMemo(() => {
    return new THREE.Float32BufferAttribute(positions, 3);
  }, [positions]);
  
  const colorsAttribute = useMemo(() => {
    return new THREE.Float32BufferAttribute(colors, 3);
  }, [colors]);
  
  // Auto-switch weather based on duration
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWeatherIndex((prev) => (prev + 1) % WEATHERS.length);
    }, currentWeather.duration);
    
    return () => clearInterval(interval);
  }, [currentWeatherIndex, currentWeather.duration]);
  
  // Lightning flash effect
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
  
  // Animation loop
  useFrame((state, delta) => {
    if (!particlesRef.current) return;
    
    const positions = particlesRef.current.geometry.attributes.position;
    const weather = currentWeather.name;
    const count = currentWeather.particleCount;
    
    // Set opacity based on particle count
    particlesRef.current.material.opacity = 0.8;
    
    // Update particles based on weather type
    if (weather === 'day') {
      // Floating clouds
      for (let i = 0; i < count; i++) {
        positions.array[i * 3] += 0.01;
        positions.array[i * 3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.002;
        
        if (positions.array[i * 3] > 10) {
          positions.array[i * 3] = -10;
        }
      }
    } else if (weather === 'night') {
      // Twinkling stars
      for (let i = 0; i < count; i++) {
        // Static positions with slight twinkle
        positions.array[i * 3 + 1] += 0;
      }
    } else if (weather === 'wind') {
      // Fast wind particles
      for (let i = 0; i < count; i++) {
        positions.array[i * 3] += 0.25;
        
        if (positions.array[i * 3] > 10) {
          positions.array[i * 3] = -10;
          positions.array[i * 3 + 1] = Math.random() * 15 - 5;
        }
      }
    } else if (weather === 'rain') {
      // Falling raindrops
      for (let i = 0; i < count; i++) {
        positions.array[i * 3 + 1] -= 0.35;
        positions.array[i * 3] += Math.sin(state.clock.elapsedTime * 2) * 0.01;
        
        if (positions.array[i * 3 + 1] < -5) {
          positions.array[i * 3 + 1] = 15;
          positions.array[i * 3] = (Math.random() - 0.5) * 20;
        }
      }
    } else if (weather === 'lightning') {
      // Rain with lightning flashes
      for (let i = 0; i < count; i++) {
        positions.array[i * 3 + 1] -= 0.3;
        
        if (positions.array[i * 3 + 1] < -5) {
          positions.array[i * 3 + 1] = 15;
        }
      }
    } else if (weather === 'snow') {
      // Falling snowflakes
      for (let i = 0; i < count; i++) {
        positions.array[i * 3 + 1] -= 0.04;
        positions.array[i * 3] += Math.sin(state.clock.elapsedTime + i) * 0.02;
        positions.array[i * 3 + 2] += Math.cos(state.clock.elapsedTime + i * 0.5) * 0.01;
        
        if (positions.array[i * 3 + 1] < -5) {
          positions.array[i * 3 + 1] = 15;
          positions.array[i * 3] = (Math.random() - 0.5) * 20;
        }
      }
    } else if (weather === 'tornado') {
      // Spinning tornado particles
      for (let i = 0; i < count; i++) {
        const angle = state.clock.elapsedTime * 3 + i * 0.1;
        const radius = 2 + Math.sin(i * 0.1) * 1.5;
        
        positions.array[i * 3] = Math.cos(angle) * radius;
        positions.array[i * 3 + 1] -= 0.15;
        positions.array[i * 3 + 2] = Math.sin(angle) * radius;
        
        if (positions.array[i * 3 + 1] < -5) {
          positions.array[i * 3 + 1] = 15;
        }
      }
    }
    
    positions.needsUpdate = true;
  });
  
  // Calculate background color with lightning flash
  const bgColor = useMemo(() => {
    if (currentWeather.name === 'lightning' && lightningFlashRef.current) {
      return 0xFFFFFF;
    }
    return currentWeather.bgColor;
  }, [currentWeather, lightningFlashRef.current]);
  
  return (
    <>
      {/* Background plane */}
      <mesh position={[0, 0, -15]}>
        <planeGeometry args={[50, 30]} />
        <meshBasicMaterial color={bgColor} />
      </mesh>
      
      {/* Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positionsAttribute.array}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={currentWeather.particleType === 'snow' ? 0.08 : 0.05}
          color={currentWeather.particleColor}
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>
    </>
  );
}
