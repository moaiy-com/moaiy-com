import { Canvas, useFrame } from '@react-three/fiber';
import { Clone, useGLTF } from '@react-three/drei';
import { Component, Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { ACESFilmicToneMapping, Box3, MathUtils, Vector3 } from 'three';

const Moai = lazy(() => import('./Moai.jsx'));
const WeatherSystem = lazy(() => import('./WeatherSystem.jsx'));
const GRASS_MODEL_PATH = '/models/moai/realistics_grass.glb';
const GROUND_Y = -2.45;
const GRASS_HEIGHT_RATIO = 0.18;
const GRASS_COVERAGE_XZ_RATIO = 1.26;
const GRASS_SINK_Y = -1.5;
const MOAI_OFFSET_X = 1.35;
const SHOW_MOAI = true;
const SHOW_WEATHER = true;

function resolveSafeDpr() {
  if (typeof window === 'undefined') {
    return 1.25;
  }

  const deviceDpr = window.devicePixelRatio || 1;
  const width = Math.max(1, window.innerWidth || 1);
  const height = Math.max(1, window.innerHeight || 1);
  const fullResPixels = width * height * deviceDpr * deviceDpr;

  if (fullResPixels > 9_000_000) {
    return 1.0;
  }

  if (fullResPixels > 6_000_000) {
    return 1.12;
  }

  if (fullResPixels > 4_000_000) {
    return 1.25;
  }

  return Math.min(deviceDpr, 1.5);
}

function useAdaptiveDprRange() {
  const [maxDpr, setMaxDpr] = useState(1.25);

  useEffect(() => {
    const update = () => setMaxDpr(resolveSafeDpr());
    update();

    window.addEventListener('resize', update, { passive: true });
    return () => window.removeEventListener('resize', update);
  }, []);

  return useMemo(() => [1, maxDpr], [maxDpr]);
}

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
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#1768ac',
          fontFamily: 'monospace',
          padding: '20px'
        }}>
          <div>
            <h1 style={{color: '#03256c'}}>Error Loading 3D Scene</h1>
            <pre style={{fontSize: '12px', color: '#2541b2', maxWidth: '600px', overflow: 'auto'}}>
              {this.state.error?.message || 'Unknown error'}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function SceneLighting({ weatherName = 'day' }) {
  const ambientRef = useRef(null);
  const hemisphereRef = useRef(null);
  const sunRef = useRef(null);
  const fillRef = useRef(null);
  const rimRef = useRef(null);

  useFrame((state, delta) => {
    const ambient = ambientRef.current;
    const hemisphere = hemisphereRef.current;
    const sun = sunRef.current;
    const fill = fillRef.current;
    const rim = rimRef.current;

    if (!ambient || !hemisphere || !sun || !fill || !rim) {
      return;
    }

    const isSunnyDay = weatherName === 'sunny';

    if (isSunnyDay) {
      const t = state.clock.elapsedTime * 0.12;
      const dayProgress = Math.sin(t) * 0.5 + 0.5;

      const targetX = MOAI_OFFSET_X + Math.sin(t * 1.6) * 4.2;
      const targetY = 5.1 + dayProgress * 3.3;
      const targetZ = 4.2 + Math.cos(t * 0.85) * 1.4;

      sun.position.x = MathUtils.damp(sun.position.x, targetX, 2.4, delta);
      sun.position.y = MathUtils.damp(sun.position.y, targetY, 2.4, delta);
      sun.position.z = MathUtils.damp(sun.position.z, targetZ, 2.4, delta);

      sun.intensity = MathUtils.damp(sun.intensity, 1.45 + dayProgress * 0.95, 2.8, delta);
      ambient.intensity = MathUtils.damp(ambient.intensity, 0.34 + dayProgress * 0.18, 2.6, delta);
      hemisphere.intensity = MathUtils.damp(hemisphere.intensity, 0.42 + dayProgress * 0.22, 2.4, delta);
      fill.intensity = MathUtils.damp(fill.intensity, 0.2 + dayProgress * 0.2, 2.6, delta);
      rim.intensity = MathUtils.damp(rim.intensity, 0.1 + (1 - dayProgress) * 0.1, 2.6, delta);
      return;
    }

    sun.position.x = MathUtils.damp(sun.position.x, 5, 2.4, delta);
    sun.position.y = MathUtils.damp(sun.position.y, 7, 2.4, delta);
    sun.position.z = MathUtils.damp(sun.position.z, 4, 2.4, delta);

    sun.intensity = MathUtils.damp(sun.intensity, 1.2, 2.8, delta);
    ambient.intensity = MathUtils.damp(ambient.intensity, 0.4, 2.4, delta);
    hemisphere.intensity = MathUtils.damp(hemisphere.intensity, 0.45, 2.4, delta);
    fill.intensity = MathUtils.damp(fill.intensity, 0.7, 2.4, delta);
    rim.intensity = MathUtils.damp(rim.intensity, 0.35, 2.4, delta);
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.4} />
      <hemisphereLight ref={hemisphereRef} args={['#bfe4ff', '#dbe9ff', 0.45]} />
      <directionalLight
        ref={sunRef}
        castShadow
        color="#fef6df"
        intensity={1.2}
        position={[5, 7, 4]}
        target-position={[MOAI_OFFSET_X, 0.8, 0]}
        shadow-mapSize-height={768}
        shadow-mapSize-width={768}
        shadow-camera-near={1}
        shadow-camera-far={24}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      <pointLight
        ref={fillRef}
        position={[-4, 2.5, 3]}
        intensity={0.7}
        color="#56d3ca"
      />
      <pointLight
        ref={rimRef}
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

function FlowerLayer() {
  const flowers = useMemo(() => {
    const flowerCount = Math.random() > 0.5 ? 1 : 0;
    const petalPalette = ['#f4e8cf', '#e9dfcb', '#f2e3d8'];

    return Array.from({ length: flowerCount }, (_, index) => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3.4 + Math.random() * 2.2;

      return {
        key: `flower-${index}`,
        position: [Math.cos(angle) * radius, GROUND_Y + 0.02, Math.sin(angle) * radius],
        rotationY: Math.random() * Math.PI * 2,
        scale: 0.58 + Math.random() * 0.22,
        petalColor: petalPalette[Math.floor(Math.random() * petalPalette.length)],
      };
    });
  }, []);

  return flowers.map((flower) => (
    <Flower
      key={flower.key}
      petalColor={flower.petalColor}
      position={flower.position}
      rotationY={flower.rotationY}
      scale={flower.scale}
    />
  ));
}

function ProceduralGrassGround() {
  return (
    <>
      <mesh
        position={[0, GROUND_Y, 0]}
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[9.5, 96]} />
        <meshStandardMaterial color="#2f6f3a" metalness={0.02} roughness={0.95} />
      </mesh>

      <mesh
        position={[0, GROUND_Y + 0.01, 0]}
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[6.2, 96]} />
        <meshStandardMaterial color="#3f8c45" metalness={0.01} roughness={0.9} />
      </mesh>
    </>
  );
}

function ExternalGrassGround() {
  const { scene } = useGLTF(GRASS_MODEL_PATH);
  const patchRefs = useRef([]);
  const coverageRefs = useRef([]);

  const normalizedPatch = useMemo(() => {
    const clone = scene.clone(true);
    const rawBox = new Box3().setFromObject(clone);
    const rawSize = new Vector3();
    const rawCenter = new Vector3();
    rawBox.getSize(rawSize);
    rawBox.getCenter(rawCenter);

    const span = Math.max(rawSize.x, rawSize.z, 1);
    const scale = 8.4 / span;
    clone.scale.setScalar(scale);
    clone.position.set(
      -rawCenter.x * scale,
      GROUND_Y - rawBox.min.y * scale,
      -rawCenter.z * scale,
    );

    clone.traverse((child) => {
      if (!child.isMesh) {
        return;
      }

      child.castShadow = true;
      child.receiveShadow = true;

      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];

      for (const material of materials) {
        if (!material) {
          continue;
        }

        if ('roughness' in material && typeof material.roughness === 'number') {
          material.roughness = Math.max(material.roughness, 0.78);
        }

        if ('metalness' in material && typeof material.metalness === 'number') {
          material.metalness = Math.min(material.metalness, 0.08);
        }

        if (material.color) {
          material.color.offsetHSL(0.01, -0.2, -0.12);
        }
      }
    });

    return clone;
  }, [scene]);

  const dryPatch = useMemo(() => {
    const clone = normalizedPatch.clone(true);

    clone.traverse((child) => {
      if (!child.isMesh) {
        return;
      }

      if (Array.isArray(child.material)) {
        child.material = child.material.map((material) => material?.clone());
      } else if (child.material) {
        child.material = child.material.clone();
      }

      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];

      for (const material of materials) {
        if (!material) {
          continue;
        }

        if ('roughness' in material && typeof material.roughness === 'number') {
          material.roughness = Math.max(material.roughness, 0.86);
        }

        if ('metalness' in material && typeof material.metalness === 'number') {
          material.metalness = Math.min(material.metalness, 0.06);
        }

        if (material.color) {
          material.color.offsetHSL(0.08, -0.42, -0.02);
        }
      }
    });

    return clone;
  }, [normalizedPatch]);

  const patchLayout = useMemo(
    () => [
      {
        key: 'grass-clump-a',
        variant: 'lush',
        position: [-0.75, GRASS_SINK_Y + 0.05, 0.92],
        rotationY: 0.52,
        scaleX: 0.76,
        scaleZ: 0.49,
        scaleY: 0.94,
        swaySpeed: 0.58,
        swayAmp: 0.045,
        yawAmp: 0.03,
        phase: 0.9,
      },
      {
        key: 'grass-clump-b',
        variant: 'lush',
        position: [0.95, GRASS_SINK_Y + 0.03, 0.08],
        rotationY: 1.34,
        scaleX: 0.63,
        scaleZ: 0.42,
        scaleY: 0.86,
        swaySpeed: 0.77,
        swayAmp: 0.054,
        yawAmp: 0.028,
        phase: 2.3,
      },
      {
        key: 'grass-clump-c',
        variant: 'dry',
        position: [0.22, GRASS_SINK_Y + 0.04, -0.96],
        rotationY: 2.6,
        scaleX: 0.58,
        scaleZ: 0.38,
        scaleY: 0.82,
        swaySpeed: 0.68,
        swayAmp: 0.05,
        yawAmp: 0.026,
        phase: 1.4,
      },
      {
        key: 'grass-front-left',
        variant: 'lush',
        position: [-2.85, GRASS_SINK_Y - 0.06, 2.16],
        rotationY: 1.98,
        scaleX: 0.52,
        scaleZ: 0.34,
        scaleY: 0.78,
        swaySpeed: 0.91,
        swayAmp: 0.06,
        yawAmp: 0.03,
        phase: 3.6,
      },
      {
        key: 'grass-front-right',
        variant: 'lush',
        position: [3.16, GRASS_SINK_Y - 0.07, 1.38],
        rotationY: 1.02,
        scaleX: 0.54,
        scaleZ: 0.35,
        scaleY: 0.8,
        swaySpeed: 0.82,
        swayAmp: 0.061,
        yawAmp: 0.031,
        phase: 4.2,
      },
      {
        key: 'grass-back-left',
        variant: 'dry',
        position: [-2.32, GRASS_SINK_Y - 0.09, -2.05],
        rotationY: 2.76,
        scaleX: 0.5,
        scaleZ: 0.32,
        scaleY: 0.74,
        swaySpeed: 0.66,
        swayAmp: 0.05,
        yawAmp: 0.028,
        phase: 5.4,
      },
      {
        key: 'grass-back-mid',
        variant: 'dry',
        position: [0.92, GRASS_SINK_Y - 0.1, -2.36],
        rotationY: 0.48,
        scaleX: 0.44,
        scaleZ: 0.29,
        scaleY: 0.7,
        swaySpeed: 0.58,
        swayAmp: 0.046,
        yawAmp: 0.024,
        phase: 0.3,
      },
      {
        key: 'grass-side-right',
        variant: 'dry',
        position: [3.42, GRASS_SINK_Y - 0.08, -0.58],
        rotationY: 1.64,
        scaleX: 0.42,
        scaleZ: 0.28,
        scaleY: 0.68,
        swaySpeed: 0.88,
        swayAmp: 0.048,
        yawAmp: 0.024,
        phase: 2.95,
      },
      {
        key: 'grass-side-left',
        variant: 'dry',
        position: [-3.52, GRASS_SINK_Y - 0.1, 0.25],
        rotationY: 2.1,
        scaleX: 0.4,
        scaleZ: 0.26,
        scaleY: 0.66,
        swaySpeed: 0.94,
        swayAmp: 0.044,
        yawAmp: 0.022,
        phase: 1.7,
      },
    ],
    [],
  );

  const coverageLayout = useMemo(
    () => [
      {
        key: 'coverage-core',
        variant: 'lush',
        position: [0.34, GRASS_SINK_Y - 0.18, -0.12],
        rotationY: 0.42,
        scaleX: 1.62,
        scaleZ: 1.04,
        scaleY: 0.48,
        swaySpeed: 0.42,
        swayAmp: 0.026,
        yawAmp: 0.014,
        phase: 1.1,
      },
      {
        key: 'coverage-right',
        variant: 'lush',
        position: [2.42, GRASS_SINK_Y - 0.2, 0.44],
        rotationY: 1.08,
        scaleX: 1.18,
        scaleZ: 0.82,
        scaleY: 0.42,
        swaySpeed: 0.51,
        swayAmp: 0.028,
        yawAmp: 0.015,
        phase: 2.9,
      },
      {
        key: 'coverage-left',
        variant: 'lush',
        position: [-2.54, GRASS_SINK_Y - 0.22, 0.22],
        rotationY: 2.34,
        scaleX: 1.12,
        scaleZ: 0.8,
        scaleY: 0.4,
        swaySpeed: 0.47,
        swayAmp: 0.027,
        yawAmp: 0.014,
        phase: 4.3,
      },
      {
        key: 'coverage-back',
        variant: 'dry',
        position: [0.12, GRASS_SINK_Y - 0.22, -2.42],
        rotationY: 2.76,
        scaleX: 1.24,
        scaleZ: 0.86,
        scaleY: 0.4,
        swaySpeed: 0.39,
        swayAmp: 0.024,
        yawAmp: 0.013,
        phase: 0.4,
      },
    ],
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const gust =
      0.6 +
      Math.sin(t * 0.19) * 0.2 +
      Math.sin(t * 0.11 + 1.4) * 0.18 +
      Math.sin(t * 0.07 + 2.1) * 0.12;

    coverageLayout.forEach((patch, index) => {
      const patchGroup = coverageRefs.current[index];
      if (!patchGroup) {
        return;
      }

      const swayFactor = patch.swayAmp * (0.8 + gust * 0.42);
      patchGroup.rotation.y =
        patch.rotationY + Math.sin(t * patch.swaySpeed + patch.phase) * patch.yawAmp;
      patchGroup.rotation.x =
        Math.sin(t * patch.swaySpeed * 1.18 + patch.phase * 1.7) * swayFactor;
      patchGroup.rotation.z =
        Math.cos(t * patch.swaySpeed * 1.04 + patch.phase * 1.2) * swayFactor * 0.76;
    });

    patchLayout.forEach((patch, index) => {
      const patchGroup = patchRefs.current[index];
      if (!patchGroup) {
        return;
      }

      const swayFactor = patch.swayAmp * (0.85 + gust * 0.55);
      patchGroup.rotation.y =
        patch.rotationY + Math.sin(t * patch.swaySpeed + patch.phase) * patch.yawAmp;
      patchGroup.rotation.x =
        Math.sin(t * patch.swaySpeed * 1.24 + patch.phase * 1.9) * swayFactor;
      patchGroup.rotation.z =
        Math.cos(t * patch.swaySpeed * 1.08 + patch.phase * 1.3) * swayFactor * 0.78;
    });
  });

  return (
    <>
      {coverageLayout.map((patch, index) => (
        <group
          key={patch.key}
          ref={(node) => {
            if (node) {
              coverageRefs.current[index] = node;
            }
          }}
          position={patch.position}
          rotation={[0, patch.rotationY, 0]}
          scale={[
            patch.scaleX * GRASS_COVERAGE_XZ_RATIO,
            patch.scaleY * GRASS_HEIGHT_RATIO,
            patch.scaleZ * GRASS_COVERAGE_XZ_RATIO,
          ]}
        >
          <Clone object={patch.variant === 'dry' ? dryPatch : normalizedPatch} />
        </group>
      ))}

      {patchLayout.map((patch, index) => (
        <group
          key={patch.key}
          ref={(node) => {
            if (node) {
              patchRefs.current[index] = node;
            }
          }}
          position={patch.position}
          rotation={[0, patch.rotationY, 0]}
          scale={[
            patch.scaleX * GRASS_COVERAGE_XZ_RATIO,
            patch.scaleY * GRASS_HEIGHT_RATIO,
            patch.scaleZ * GRASS_COVERAGE_XZ_RATIO,
          ]}
        >
          <Clone object={patch.variant === 'dry' ? dryPatch : normalizedPatch} />
        </group>
      ))}
    </>
  );
}

function BareSoilLayer() {
  const soilPatches = useMemo(
    () => [
      { key: 'soil-a', position: [-1.2, GROUND_Y - 0.002, 1.05], rotationY: 0.32, scaleX: 1.15, scaleZ: 0.82, color: '#385532' },
      { key: 'soil-b', position: [1.46, GROUND_Y - 0.003, 0.18], rotationY: 1.18, scaleX: 0.94, scaleZ: 0.66, color: '#2f472a' },
      { key: 'soil-c', position: [0.28, GROUND_Y - 0.004, -1.22], rotationY: 2.04, scaleX: 1.08, scaleZ: 0.71, color: '#3d5f37' },
      { key: 'soil-d', position: [-2.36, GROUND_Y - 0.005, -0.88], rotationY: 2.62, scaleX: 0.88, scaleZ: 0.6, color: '#324c2d' },
      { key: 'soil-e', position: [2.52, GROUND_Y - 0.006, -1.56], rotationY: 0.76, scaleX: 0.72, scaleZ: 0.5, color: '#2c4228' },
    ],
    [],
  );

  return soilPatches.map((patch) => (
    <mesh
      key={patch.key}
      position={patch.position}
      receiveShadow
      rotation={[-Math.PI / 2, patch.rotationY, 0]}
      scale={[patch.scaleX, 1, patch.scaleZ]}
    >
      <circleGeometry args={[1.12, 56]} />
      <meshStandardMaterial color={patch.color} roughness={0.98} metalness={0.01} />
    </mesh>
  ));
}

async function hasModelAsset(path) {
  try {
    const headResponse = await fetch(path, { method: 'HEAD', cache: 'no-store' });
    if (headResponse.ok) {
      return true;
    }
  } catch {
    // Continue to GET probing.
  }

  try {
    const getResponse = await fetch(path, { method: 'GET', cache: 'no-store' });
    return getResponse.ok;
  } catch {
    return false;
  }
}

function GrassGround() {
  const [isGrassModelEnabled, setIsGrassModelEnabled] = useState(false);
  const [modelCheckFinished, setModelCheckFinished] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const modelExists = await hasModelAsset(GRASS_MODEL_PATH);
      if (cancelled) {
        return;
      }

      setIsGrassModelEnabled(modelExists);
      setModelCheckFinished(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <group>
      {modelCheckFinished && isGrassModelEnabled ? (
        <ExternalGrassGround />
      ) : (
        <ProceduralGrassGround />
      )}
      {modelCheckFinished && isGrassModelEnabled ? null : <BareSoilLayer />}
      <FlowerLayer />
    </group>
  );
}

export default function HeroScene3D() {
  const [weatherName, setWeatherName] = useState('sunny');
  const dprRange = useAdaptiveDprRange();

  return (
    <ErrorBoundary>
      <div style={{
        position: 'absolute',
        inset: 0,
      }}>
        <Canvas
          dpr={dprRange}
          performance={{ min: 0.5 }}
          shadows
          camera={{ position: [0, 1.1, 6.4], fov: 42, near: 0.1, far: 60 }}
          style={{
            width: '100%',
            height: '100%',
          }}
          gl={{
            antialias: false,
            alpha: true,
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(0xffffff, 1);
            gl.toneMapping = ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.02;
          }}
        >
          <Suspense fallback={null}>
            <SceneLighting weatherName={weatherName} />
            <GrassGround />
            {SHOW_WEATHER ? <WeatherSystem onWeatherChange={setWeatherName} /> : null}
            {SHOW_MOAI ? (
              <group position={[MOAI_OFFSET_X, 0, 0]}>
                <Moai />
              </group>
            ) : null}
          </Suspense>
        </Canvas>
      </div>
    </ErrorBoundary>
  );
}
