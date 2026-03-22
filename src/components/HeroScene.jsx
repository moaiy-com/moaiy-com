import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import Moai from './Moai.jsx';
import WeatherSystem from './WeatherSystem.jsx';

/**
 * Hero Scene Component
 * Main 3D canvas container for the Moai statue and weather system
 */
export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 50 }}
      style={{ background: 'transparent' }}
      dpr={[1, 2]} // Pixel ratio for performance optimization
    >
      <Suspense fallback={null}>
        {/* Lighting system */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.6} />
        <pointLight position={[-10, -10, -5]} intensity={0.3} color="#4ECDC4" />
        
        {/* Moai statue */}
        <Moai />
        
        {/* Weather system */}
        <WeatherSystem />
      </Suspense>
    </Canvas>
  );
}
