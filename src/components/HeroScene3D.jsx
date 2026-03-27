import { Canvas } from '@react-three/fiber';
import { Component, Suspense, lazy } from 'react';

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

export default function HeroScene3D() {
  return (
    <ErrorBoundary>
      <div style={{
        position: 'absolute',
        inset: 0,
      }}>
        <Canvas
          dpr={[1, 1.5]}
          performance={{ min: 0.5 }}
          camera={{ position: [0, 0, 5], fov: 75 }}
          style={{
            width: '100%',
            height: '100%',
          }}
          gl={{
            antialias: false,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x0A0E27, 1);
          }}
        >
          <Suspense fallback={null}>
            <SceneLighting />
            <WeatherSystem />
            <Moai />
          </Suspense>
        </Canvas>
      </div>
    </ErrorBoundary>
  );
}
