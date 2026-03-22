import { Canvas } from '@react-three/fiber';
import { Suspense, useRef } from 'react';

/**
 * Simple test cube
 */
function TestCube() {
  const meshRef = useRef();

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#4ECDC4" />
    </mesh>
  );
}

/**
 * Hero Scene Component - TEST VERSION
 * Uses minimal cube instead of Moai
 */
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
        onCreated={({ gl }) => {
          console.log('✅ WebGL context created');
          console.log('Canvas size:', gl.domElement.width, 'x', gl.domElement.height);
          console.log('Renderer info:', gl.info);
          
          const context = gl.getContext();
          if (context) {
            console.log('Drawing buffer:', context.drawingBufferWidth, 'x', context.drawingBufferHeight);
          }
        }}
      >
        <Suspense fallback={null}>
          {/* Full intensity lights like test page */}
          <ambientLight intensity={1.0} />
          <directionalLight position={[10, 10, 5]} intensity={1.0} />
          
          {/* Test cube instead of Moai */}
          <TestCube />
        </Suspense>
      </Canvas>
    </div>
  );
}
