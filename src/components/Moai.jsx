import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Moai Statue Component
 * 3D model of the Moai statue with sunglasses
 * 
 * Features:
 * - Minimalist modern style with slight cartoonish feel
 * - Mint green gradient sunglasses
 * - Slight upward smile
 * - Mint green glow effect
 * - Breathing animation
 */
export default function Moai() {
  const moaiRef = useRef();
  const glowRef = useRef();
  const smileRef = useRef();
  const sunglassesRef = useRef();
  
  // Stone material for the statue body
  const stoneMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x9CA3AF, // Stone gray
    roughness: 0.8,
    metalness: 0.1,
  }), []);
  
  // Smile material with mint green glow
  const smileMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x4ECDC4, // Mint green
    emissive: 0x4ECDC4,
    emissiveIntensity: 0.3,
  }), []);
  
  // Sunglasses lens material - mint green gradient
  const lensMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x4ECDC4, // Mint green
    transparent: true,
    opacity: 0.85,
    metalness: 0.3,
    roughness: 0.2,
  }), []);
  
  // Sunglasses frame material
  const frameMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x374151, // Dark gray
    metalness: 0.5,
    roughness: 0.3,
  }), []);
  
  // Glow material for the aura effect
  const glowMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: 0x4ECDC4, // Mint green
    transparent: true,
    opacity: 0.08,
  }), []);
  
  // Smile curve definition
  const smileCurve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.25, -0.05, 0.76),
    new THREE.Vector3(-0.1, -0.12, 0.76),
    new THREE.Vector3(0, -0.15, 0.76),
    new THREE.Vector3(0.1, -0.12, 0.76),
    new THREE.Vector3(0.25, -0.05, 0.76),
  ]), []);
  
  // Animation loop
  useFrame((state, delta) => {
    if (!moaiRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Subtle breathing animation
    moaiRef.current.position.y = Math.sin(time * 0.5) * 0.02;
    
    // Pulsing glow effect
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.06 + Math.sin(time * 2) * 0.02;
    }
    
    // Smile glow animation
    if (smileRef.current) {
      smileRef.current.material.emissiveIntensity = 0.3 + Math.sin(time * 1.5) * 0.1;
    }
  });
  
  return (
    <group ref={moaiRef} position={[0, 0, 0]}>
      {/* Head */}
      <mesh position={[0, 1.5, 0]} material={stoneMaterial}>
        <sphereGeometry args={[1, 32, 32]} />
        <mesh scale={[0.85, 1.2, 0.75]} />
      </mesh>
      
      {/* Body */}
      <mesh position={[0, -0.6, 0]} material={stoneMaterial}>
        <boxGeometry args={[1.3, 2.8, 0.7]} />
      </mesh>
      
      {/* Smile */}
      <mesh ref={smileRef} position={[0, 1.4, 0]} material={smileMaterial}>
        <tubeGeometry args={[smileCurve, 20, 0.02, 8, false]} />
      </mesh>
      
      {/* Sunglasses */}
      <group ref={sunglassesRef} position={[0, 1.7, 0]}>
        {/* Left lens */}
        <mesh position={[-0.32, 0, 0.72]} material={lensMaterial}>
          <boxGeometry args={[0.45, 0.35, 0.03]} />
        </mesh>
        
        {/* Right lens */}
        <mesh position={[0.32, 0, 0.72]} material={lensMaterial}>
          <boxGeometry args={[0.45, 0.35, 0.03]} />
        </mesh>
        
        {/* Top bar */}
        <mesh position={[0, 0.2, 0.72]} material={frameMaterial}>
          <boxGeometry args={[1.1, 0.04, 0.03]} />
        </mesh>
        
        {/* Nose bridge */}
        <mesh position={[0, 0, 0.72]} material={frameMaterial}>
          <boxGeometry args={[0.08, 0.08, 0.03]} />
        </mesh>
      </group>
      
      {/* Mint green glow aura */}
      <mesh ref={glowRef} position={[0, 0.5, 0]} material={glowMaterial}>
        <sphereGeometry args={[2.5, 32, 32]} />
      </mesh>
    </group>
  );
}
