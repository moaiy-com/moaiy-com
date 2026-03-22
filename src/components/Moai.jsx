import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Moai() {
  console.log('Moai: Rendering');
  
  const moaiRef = useRef();
  const glowRef = useRef();
  const smileRef = useRef();
  
  const stoneMaterial = useMemo(() => {
    console.log('Moai: Creating stone material');
    return new THREE.MeshStandardMaterial({
      color: 0x9CA3AF,
      roughness: 0.8,
      metalness: 0.1,
    });
  }, []);
  
  const smileMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x4ECDC4,
    emissive: 0x4ECDC4,
    emissiveIntensity: 0.3,
  }), []);
  
  const lensMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x4ECDC4,
    transparent: true,
    opacity: 0.85,
    metalness: 0.3,
    roughness: 0.2,
  }), []);
  
  const frameMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x374151,
    metalness: 0.5,
    roughness: 0.3,
  }), []);
  
  const glowMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: 0x4ECDC4,
    transparent: true,
    opacity: 0.08,
  }), []);
  
  const smileCurve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.25, -0.05, 0.76),
    new THREE.Vector3(-0.1, -0.12, 0.76),
    new THREE.Vector3(0, -0.15, 0.76),
    new THREE.Vector3(0.1, -0.12, 0.76),
    new THREE.Vector3(0.25, -0.05, 0.76),
  ]), []);
  
  const targetBreathY = useRef(0);
  
  useFrame((state) => {
    if (!moaiRef.current) return;
    
    const time = state.clock.elapsedTime;
    const targetY = Math.sin(time * 0.5) * 0.02;
    
    targetBreathY.current += (targetY - targetBreathY.current) * 0.05;
    moaiRef.current.position.y = targetBreathY.current;
    
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.06 + Math.sin(time * 2) * 0.02;
    }
    
    if (smileRef.current) {
      smileRef.current.material.emissiveIntensity = 0.3 + Math.sin(time * 1.5) * 0.1;
    }
  });

  useEffect(() => {
    console.log('Moai: Mounted, disposing on unmount');
    return () => {
      stoneMaterial.dispose();
      smileMaterial.dispose();
      lensMaterial.dispose();
      frameMaterial.dispose();
      glowMaterial.dispose();
    };
  }, [stoneMaterial, smileMaterial, lensMaterial, frameMaterial, glowMaterial]);
  
  console.log('Moai: Rendering meshes');
  
  return (
    <group ref={moaiRef} position={[0, 0, 0]}>
      <mesh position={[0, 1.8, 0]} material={stoneMaterial} scale={[0.85, 1.2, 0.75]}>
        <sphereGeometry args={[1, 32, 32]} />
      </mesh>
      
      <mesh position={[0, 1.5, 0.6]} material={stoneMaterial}>
        <boxGeometry args={[0.25, 0.5, 0.35]} />
      </mesh>
      
      <mesh position={[0, -0.3, 0]} material={stoneMaterial}>
        <boxGeometry args={[1.2, 2.4, 0.6]} />
      </mesh>
      
      <mesh position={[0, -1.3, 0]} material={stoneMaterial}>
        <boxGeometry args={[1.4, 0.4, 0.55]} />
      </mesh>
      
      <mesh ref={smileRef} position={[0, 1.55, 0.75]} material={smileMaterial}>
        <tubeGeometry args={[smileCurve, 20, 0.025, 8, false]} />
      </mesh>
      
      <group position={[0, 1.85, 0]}>
        <mesh position={[-0.32, 0, 0.65]} material={lensMaterial}>
          <boxGeometry args={[0.45, 0.35, 0.03]} />
        </mesh>
        
        <mesh position={[0.32, 0, 0.65]} material={lensMaterial}>
          <boxGeometry args={[0.45, 0.35, 0.03]} />
        </mesh>
        
        <mesh position={[0, 0.2, 0.65]} material={frameMaterial}>
          <boxGeometry args={[1.1, 0.04, 0.03]} />
        </mesh>
        
        <mesh position={[0, 0, 0.65]} material={frameMaterial}>
          <boxGeometry args={[0.08, 0.08, 0.03]} />
        </mesh>
        
        <mesh position={[-0.58, 0.1, 0.5]} material={frameMaterial} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[0.03, 0.15, 0.03]} />
        </mesh>
        
        <mesh position={[0.58, 0.1, 0.5]} material={frameMaterial} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.03, 0.15, 0.03]} />
        </mesh>
      </group>
      
      <mesh ref={glowRef} position={[0, 0.5, 0]} material={glowMaterial}>
        <sphereGeometry args={[2.5, 32, 32]} />
      </mesh>
    </group>
  );
}

export default Moai;
