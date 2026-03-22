import { Canvas } from '@react-three/fiber';
import { Suspense, Component } from 'react';
import Moai from './Moai.jsx';
import WeatherSystem from './WeatherSystem.jsx';

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

function HeroSceneContent() {
  console.log('HeroScene: Rendering...');
  
  return (
    <>
      <SceneLighting />
      <WeatherSystem />
      <Moai />
    </>
  );
}

export default function HeroScene() {
  console.log('HeroScene: Component mounted');
  
  return (
    <ErrorBoundary>
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
            width: '100%',
            height: '100%'
          }}
          gl={{ 
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
          }}
          onCreated={({ gl }) => {
            console.log('HeroScene: Canvas created');
            gl.setClearColor(0x0A0E27, 1);
            console.log('HeroScene: Clear color set');
          }}
          onWebGLContextCreated={(gl) => {
            console.log('HeroScene: WebGL context created');
          }}
        >
          <Suspense fallback={null}>
            <HeroSceneContent />
          </Suspense>
        </Canvas>
      </div>
    </ErrorBoundary>
  );
}
