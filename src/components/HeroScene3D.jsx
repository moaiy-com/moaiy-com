import { Canvas } from '@react-three/fiber';
import { Component, Suspense, lazy, useMemo } from 'react';
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

function Flower({ position, rotationY, scale, petalColor }) {
  const petals = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => {
        const angle = (Math.PI * 2 * index) / 6;
        return {
          x: Math.cos(angle) * 0.085 * scale,
          z: Math.sin(angle) * 0.085 * scale,
        };
      }),
    [scale],
  );

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh castShadow position={[0, 0.16 * scale, 0]}>
        <cylinderGeometry args={[0.018 * scale, 0.024 * scale, 0.32 * scale, 12]} />
        <meshStandardMaterial color="#4d8f35" roughness={0.92} />
      </mesh>

      {petals.map((petal, index) => (
        <mesh
          key={`petal-${index}`}
          castShadow
          position={[petal.x, 0.33 * scale, petal.z]}
        >
          <sphereGeometry args={[0.058 * scale, 12, 10]} />
          <meshStandardMaterial color={petalColor} roughness={0.7} />
        </mesh>
      ))}

      <mesh castShadow position={[0, 0.33 * scale, 0]}>
        <sphereGeometry args={[0.048 * scale, 14, 12]} />
        <meshStandardMaterial color="#f4be4f" roughness={0.62} metalness={0.03} />
      </mesh>
    </group>
  );
}

function GrassGround() {
  const flowers = useMemo(() => {
    const flowerCount = 1 + Math.floor(Math.random() * 2);
    const petalPalette = ['#fff6da', '#f8f2ff', '#ffe5f0', '#f2f8ff'];

    return Array.from({ length: flowerCount }, (_, index) => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.3 + Math.random() * 2.8;

      return {
        key: `flower-${index}`,
        position: [Math.cos(angle) * radius, -2.44, Math.sin(angle) * radius],
        rotationY: Math.random() * Math.PI * 2,
        scale: 0.9 + Math.random() * 0.35,
        petalColor: petalPalette[Math.floor(Math.random() * petalPalette.length)],
      };
    });
  }, []);

  return (
    <group>
      <mesh
        position={[0, -2.45, 0]}
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[9.5, 96]} />
        <meshStandardMaterial color="#2f6f3a" metalness={0.02} roughness={0.95} />
      </mesh>

      <mesh
        position={[0, -2.44, 0]}
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[6.2, 96]} />
        <meshStandardMaterial color="#3f8c45" metalness={0.01} roughness={0.9} />
      </mesh>

      {flowers.map((flower) => (
        <Flower
          key={flower.key}
          petalColor={flower.petalColor}
          position={flower.position}
          rotationY={flower.rotationY}
          scale={flower.scale}
        />
      ))}
    </group>
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
            <GrassGround />
            <WeatherSystem />
            <Moai />
          </Suspense>
        </Canvas>
      </div>
    </ErrorBoundary>
  );
}
