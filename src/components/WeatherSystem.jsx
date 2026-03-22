import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 天气配置
const WEATHERS = [
  { name: 'day', duration: 10000, bgGradient: ['#87CEEB', '#98D8C8', '#7CB342'] },
  { name: 'night', duration: 10000, bgGradient: ['#0A0E27', '#151B3B', '#1A1F3A'] },
  { name: 'wind', duration: 10000, bgGradient: ['#6B7280', '#4B5563', '#374151'] },
  { name: 'rain', duration: 10000, bgGradient: ['#4A5568', '#2D3748', '#1A202C'] },
  { name: 'lightning', duration: 10000, bgGradient: ['#1F2937', '#111827', '#0A0E27'] },
  { name: 'snow', duration: 10000, bgGradient: ['#E5E7EB', '#D1D5DB', '#9CA3AF'] },
  { name: 'tornado', duration: 10000, bgGradient: ['#374151', '#1F2937', '#111827'] },
];

export default function WeatherSystem() {
  const [currentWeatherIndex, setCurrentWeatherIndex] = useState(0);
  const timerRef = useRef(0);
  const particlesRef = useRef([]);
  
  const currentWeather = WEATHERS[currentWeatherIndex];
  
  // 天气切换
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWeatherIndex((prev) => (prev + 1) % WEATHERS.length);
    }, currentWeather.duration);
    
    return () => clearInterval(interval);
  }, [currentWeatherIndex, currentWeather.duration]);
  
  // 创建粒子
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
  
  // 动画
  useFrame((state, delta) => {
    if (!particlesRef.current) return;
    
    const positions = particlesRef.current.geometry.attributes.position;
    const weather = currentWeather.name;
    
    // 根据天气类型更新粒子
    if (weather === 'night') {
      // 星星闪烁
      particlesRef.current.material.opacity = 0.8;
      particlesRef.current.material.color.setHex(0xFFFFFF);
      
      for (let i = 0; i < positions.count; i++) {
        positions.array[i * 3 + 1] += 0; // 静止
      }
    } else if (weather === 'rain') {
      // 雨滴下落
      particlesRef.current.material.opacity = 0.7;
      particlesRef.current.material.color.setHex(0x9CA3AF);
      
      for (let i = 0; i < positions.count; i++) {
        positions.array[i * 3 + 1] -= 0.3;
        
        if (positions.array[i * 3 + 1] < -5) {
          positions.array[i * 3 + 1] = 15;
        }
      }
    } else if (weather === 'snow') {
      // 雪花飘落
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
      // 风粒子
      particlesRef.current.material.opacity = 0.6;
      particlesRef.current.material.color.setHex(0xD1D5DB);
      
      for (let i = 0; i < positions.count; i++) {
        positions.array[i * 3] += 0.2;
        
        if (positions.array[i * 3] > 10) {
          positions.array[i * 3] = -10;
        }
      }
    } else {
      // 其他天气：淡出粒子
      particlesRef.current.material.opacity *= 0.95;
    }
    
    positions.needsUpdate = true;
  });
  
  return (
    <>
      {/* 背景平面 */}
      <mesh position={[0, 0, -15]}>
        <planeGeometry args={[50, 30]} />
        <meshBasicMaterial color={currentWeather.bgGradient[1]} />
      </mesh>
      
      {/* 粒子 */}
      <primitive ref={particlesRef} object={particles} />
    </>
  );
}
