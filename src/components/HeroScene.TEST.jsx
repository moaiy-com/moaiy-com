import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

/**
 * Simple Test Scene
 * Tests if Three.js is rendering at all
 */
function TestScene() {
  return (
    <>
      {/* Red ambient light - makes everything red */}
      <ambientLight intensity={1.0} color="red" />
      
      {/* Simple test cube */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshBasicMaterial color="#4ECDC4" />
      </mesh>
    </>
  );
}

/**
 * Hero Scene Component - Test Version
 */
export default function HeroScene() {
  return (
    <div style={{ width: '100%', height: '100%', background: 'transparent' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl, scene, camera }) => {
          console.log('✅ Canvas created');
          console.log('Renderer:', gl);
          console.log('Scene:', scene);
          console.log('Camera:', camera);
          console.log('Canvas size:', gl.domElement.width, 'x', gl.domElement.height);
        }}
      >
        <Suspense fallback={null}>
          <TestScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
