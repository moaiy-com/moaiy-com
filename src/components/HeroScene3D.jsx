import { Canvas } from '@react-three/fiber';
import { Component, Suspense, lazy } from 'react';
import { ACESFilmicToneMapping } from 'three';

const Moai = lazy(() => import('./Moai.jsx'));
const WeatherSystem = lazy(() => import('./WeatherSystem.jsx'));

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          width: '100vw', 
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          background: '#0A0E27',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#4ECDC4',
          fontFamily: 'monospace',
          padding: '20px'
        }}>
          <div>
            <h1 style={{color: '#ff6b6b'}}>Error Loading 3D Scene</h1>
            <pre style={{fontSize: '12px', color: '#9CA3AF', maxWidth: '600px', overflow: 'auto'}}>
              {this.state.error?.message || 'Unknown error'}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.32} />
      <hemisphereLight args={['#95cffc', '#222f45', 0.5]} />
      <directionalLight
        castShadow
        color="#fef6df"
        intensity={1.2}
        position={[5, 7, 4]}
        shadow-mapSize-height={1024}
        shadow-mapSize-width={1024}
        shadow-camera-near={1}
        shadow-camera-far={24}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      <pointLight
        position={[-4, 2.5, 3]}
        intensity={0.7}
        color="#56d3ca"
      />
      <pointLight
        position={[0, 3.5, -4]}
        intensity={0.35}
        color="#8ea7ff"
      />
    </>
  );
}

export default function HeroScene3D() {
  return (
    <ErrorBoundary>
      <div style={{
        position: 'absolute',
        inset: 0,
      }}>
        <Canvas
          dpr={[1, 1.75]}
          performance={{ min: 0.5 }}
          shadows
          camera={{ position: [0, 1.1, 6.4], fov: 42, near: 0.1, far: 60 }}
          style={{
            width: '100%',
            height: '100%',
          }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x0A0E27, 1);
            gl.toneMapping = ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.08;
          }}
        >
          <Suspense fallback={null}>
            <SceneLighting />
            <mesh
              position={[0, -2.45, 0]}
              receiveShadow
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <circleGeometry args={[9.5, 96]} />
              <meshStandardMaterial color="#17233a" metalness={0.08} roughness={0.94} />
            </mesh>
            <mesh
              position={[0, -2.43, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <ringGeometry args={[2.8, 6.8, 96]} />
              <meshBasicMaterial color="#4ECDC4" opacity={0.1} transparent />
            </mesh>
            <WeatherSystem />
            <Moai />
          </Suspense>
        </Canvas>
      </div>
    </ErrorBoundary>
  );
}
