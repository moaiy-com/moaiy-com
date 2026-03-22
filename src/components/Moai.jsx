import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Moai() {
  const moaiRef = useRef();
  const glowRef = useRef();
  const smileRef = useRef();
  const sunglassesRef = useRef();
  
  // 材质
  const stoneMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x9CA3AF,
    roughness: 0.8,
    metalness: 0.1,
  }), []);
  
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
  
  // 微笑曲线
  const smileCurve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.25, -0.05, 0.76),
    new THREE.Vector3(-0.1, -0.12, 0.76),
    new THREE.Vector3(0, -0.15, 0.76),
    new THREE.Vector3(0.1, -0.12, 0.76),
    new THREE.Vector3(0.25, -0.05, 0.76),
  ]), []);
  
  // 动画
  useFrame((state, delta) => {
    if (!moaiRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // 微微呼吸动画
    moaiRef.current.position.y = Math.sin(time * 0.5) * 0.02;
    
    // 光晕脉冲
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.06 + Math.sin(time * 2) * 0.02;
    }
    
    // 微笑发光
    if (smileRef.current) {
      smileRef.current.material.emissiveIntensity = 0.3 + Math.sin(time * 1.5) * 0.1;
    }
    
    // 墨镜反光（简化版）
    if (sunglassesRef.current) {
      // 可以添加更复杂的反光动画
    }
  });
  
  return (
    <group ref={moaiRef} position={[0, 0, 0]}>
      {/* 头部 */}
      <mesh position={[0, 1.5, 0]} material={stoneMaterial}>
        <sphereGeometry args={[1, 32, 32]} />
        <mesh scale={[0.85, 1.2, 0.75]} />
      </mesh>
      
      {/* 身体 */}
      <mesh position={[0, -0.6, 0]} material={stoneMaterial}>
        <boxGeometry args={[1.3, 2.8, 0.7]} />
      </mesh>
      
      {/* 微笑 */}
      <mesh ref={smileRef} position={[0, 1.4, 0]} material={smileMaterial}>
        <tubeGeometry args={[smileCurve, 20, 0.02, 8, false]} />
      </mesh>
      
      {/* 墨镜 */}
      <group ref={sunglassesRef} position={[0, 1.7, 0]}>
        {/* 左镜片 */}
        <mesh position={[-0.32, 0, 0.72]} material={lensMaterial}>
          <boxGeometry args={[0.45, 0.35, 0.03]} />
        </mesh>
        
        {/* 右镜片 */}
        <mesh position={[0.32, 0, 0.72]} material={lensMaterial}>
          <boxGeometry args={[0.45, 0.35, 0.03]} />
        </mesh>
        
        {/* 顶部横梁 */}
        <mesh position={[0, 0.2, 0.72]} material={frameMaterial}>
          <boxGeometry args={[1.1, 0.04, 0.03]} />
        </mesh>
        
        {/* 鼻梁 */}
        <mesh position={[0, 0, 0.72]} material={frameMaterial}>
          <boxGeometry args={[0.08, 0.08, 0.03]} />
        </mesh>
      </group>
      
      {/* 薄荷绿光晕 */}
      <mesh ref={glowRef} position={[0, 0.5, 0]} material={glowMaterial}>
        <sphereGeometry args={[2.5, 32, 32]} />
      </mesh>
    </group>
  );
}
