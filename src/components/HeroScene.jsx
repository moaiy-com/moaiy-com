import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import Moai from './Moai.jsx';
import WeatherSystem from './WeatherSystem.jsx';

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={0.8} 
      />
      <pointLight 
        position={[-10, -10, -5]} 
        intensity={0.3} 
        color="#4ECDC4" 
      />
    </>
  );
}

export default function HeroScene() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0
    }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ 
          background: 'linear-gradient(180deg, #0A0E27 0%, #151B3B 50%, #1E2545 100%)',
          width: '100%',
          height: '100%'
        }}
        gl={{ 
          antialias: true,
          alpha: false
        }}
      >
        <Suspense fallback={null}>
          <SceneLighting />
          <WeatherSystem />
          <Moai />
        </Suspense>
      </Canvas>
    </div>
  );
}
