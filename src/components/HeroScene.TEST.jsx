import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

/**
 * Simple test cube to verify rendering
 */
function TestCube() {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      <meshBasicMaterial color="#4ECDC4" />
    </mesh>
  );
}

/**
 * Hero Scene Component - Test Version
 */
export default function HeroScene() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 0,
      background: 'linear-gradient(180deg, #0A0E27 0%, #151B3B 50%, #1E2545 100%)'
    }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ 
          width: '100%',
          height: '100%',
          background: 'transparent'
        }}
        gl={{ 
          antialias: true,
          alpha: true
        }}
        onCreated={({ gl, scene, camera }) => {
          console.log('✅ WebGL context created');
          console.log('Canvas size:', gl.domElement.width, 'x', gl.domElement.height);
          console.log('Scene:', scene);
          console.log('Camera position:', camera.position);
          
          const context = gl.getContext();
          if (context) {
            console.log('Drawing buffer:', context.drawingBufferWidth, 'x', context.drawingBufferHeight);
          }
        }}
      >
        <Suspense fallback={null}>
          {/* Test cube */}
          <TestCube />
        </Suspense>
      </Canvas>
    </div>
  );
}
