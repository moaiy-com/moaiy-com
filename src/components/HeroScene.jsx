import { Canvas } from '@react-three/fiber';
import { Suspense, useState, useEffect } from 'react';
import Moai from './Moai.jsx';
import WeatherSystem from './WeatherSystem.jsx';

/**
 * Loading fallback component
 */
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#4ECDC4" wireframe />
    </mesh>
  );
}

/**
 * Hero Scene Component
 * Main 3D canvas container for the Moai statue and weather system
 * 
 * Features:
 * - WebGL detection
 * - Loading state
 * - Error handling
 * - Performance monitoring
 */
export default function HeroScene() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    // Check WebGL support on mount
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    setWebglSupported(gl !== null);
    
    if (gl === null) {
      console.error('❌ WebGL not supported');
    } else {
      console.log('✅ WebGL supported');
    }

    // Mark as loaded after a delay
    const timer = setTimeout(() => {
      setIsLoaded(true);
      console.log('✅ 3D scene loaded');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Error boundary
  const handleError = (error) => {
    console.error('❌ 3D scene error:', error);
    setHasError(true);
  };

  if (!webglSupported) {
    return (
      <div className="w-full h-full flex items-center justify-center text-text-secondary">
        <p>⚠️ WebGL not supported. Please use a modern browser.</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center text-text-secondary">
        <p>❌ Failed to load 3D scene</p>
      </div>
    );
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 50 }}
      style={{ background: 'transparent' }}
      dpr={[1, 2]}
      gl={{ 
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      }}
      onCreated={({ gl }) => {
        console.log('✅ Three.js canvas created');
        console.log('Renderer info:', gl.info);
      }}
      onError={handleError}
    >
      <Suspense fallback={<LoadingFallback />}>
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
