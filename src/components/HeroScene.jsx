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
    <div style={{ 
      width: '100vw', 
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      pointerEvents: 'none'
    }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ 
          background: 'linear-gradient(180deg, #0A0E27 0%, #151B3B 50%, #1E2545 100%)',
          width: '100%',
          height: '100%'
        }}
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance'
        }}
        onCreated={({ gl }) => {
          console.log('✅ WebGL context created');
          console.log('Canvas size:', gl.domElement.width, 'x', gl.domElement.height);
          console.log('Renderer info:', gl.info);
          
          // Get WebGL context
          const context = gl.getContext();
          if (context) {
            console.log('Drawing buffer:', context.drawingBufferWidth, 'x', context.drawingBufferHeight);
          }
        }}
      >
        <Suspense fallback={null}>
          {/* Lighting system */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={0.8} />
          <pointLight position={[-10, -10, -5]} intensity={0.4} color="#4ECDC4" />
          
          {/* Moai statue */}
          <Moai />
          
          {/* Weather system */}
          <WeatherSystem />
        </Suspense>
      </Canvas>
    </div>
  );
}
