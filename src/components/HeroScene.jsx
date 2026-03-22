import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import Moai from './Moai.jsx';
import WeatherSystem from './WeatherSystem.jsx';

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 50 }}
      style={{ background: 'transparent' }}
      dpr={[1, 2]} // 像素比，优化性能
    >
      <Suspense fallback={null}>
        {/* 光照 */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.6} />
        <pointLight position={[-10, -10, -5]} intensity={0.3} color="#4ECDC4" />
        
        {/* 摩埃石像 */}
        <Moai />
        
        {/* 天气系统 */}
        <WeatherSystem />
      </Suspense>
    </Canvas>
  );
}
