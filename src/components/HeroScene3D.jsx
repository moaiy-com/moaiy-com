import { Canvas, useFrame } from '@react-three/fiber';
import { Component, Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import {
  ACESFilmicToneMapping,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  DynamicDrawUsage,
  InstancedBufferAttribute,
  Matrix4,
  MeshStandardMaterial,
  PCFShadowMap,
  PlaneGeometry,
  Quaternion,
  Vector3,
} from 'three';
import { createDayState, sampleDay } from './daycycle/keyframes.js';
import { useDayTime } from './daycycle/useDayTime.js';

const Moai = lazy(() => import('./Moai.jsx'));
const DayCycleSystem = lazy(() => import('./daycycle/DayCycleSystem.jsx'));

const GROUND_Y = -2.14;
const MOAI_OFFSET_X = 1.35;
const MOAI_OFFSET_Z = 0.0;
const SHOW_MOAI = true;
const SHOW_DAY_CYCLE = true;
const DAY_LIGHT_TARGET = [MOAI_OFFSET_X, GROUND_Y, MOAI_OFFSET_Z];
const GRASS_BLADE_COUNT = 22000;

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
        <div
          style={{
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
            padding: '20px',
          }}
        >
          <div>
            <h1 style={{ color: '#03256c' }}>Error Loading 3D Scene</h1>
            <pre style={{ fontSize: '12px', color: '#2541b2', maxWidth: '600px', overflow: 'auto' }}>
              {this.state.error?.message || 'Unknown error'}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Deterministic pseudo-random generator so the meadow layout is stable across renders.
 */
function createSeededRandom(seed = 1337) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Shared Rapa Nui hillside heightfield.
 * Gently rises around the Moai statue base so the stone torso sits naturally embedded
 * in the volcanic meadow, with soft rolling undulations across the foreground and horizon.
 */
function getTerrainHeight(x, z) {
  const dxMoai = x - MOAI_OFFSET_X;
  const dzMoai = z - MOAI_OFFSET_Z;
  const distMoaiSq = dxMoai * dxMoai + dzMoai * dzMoai;

  // Gentle mound supporting the Moai statue base (peaks around -2.07 so the statue base at -2.12 is embedded)
  const moaiMound = 0.085 * Math.exp(-distMoaiSq / 7.5);

  // Soft foreground knoll on the left to balance the composition
  const dxLeft = x + 2.4;
  const dzLeft = z - 0.6;
  const leftKnoll = 0.055 * Math.exp(-(dxLeft * dxLeft + dzLeft * dzLeft) / 11.0);

  // Multi-octave natural ground undulation
  const rolling =
    Math.sin(x * 0.42 + z * 0.31) * 0.042 +
    Math.cos(x * 0.27 - z * 0.48 + 0.8) * 0.034 +
    Math.sin(x * 0.85 - z * 0.72 + 1.9) * 0.014;

  // Gradual slope falloff toward the distant horizon so the meadow edge blends into fog
  const radialDist = Math.sqrt(x * x + z * z);
  const edgeDrop = Math.max(0, radialDist - 6.5) * 0.038;

  return GROUND_Y + moaiMound + leftKnoll + rolling - edgeDrop;
}

/**
 * Builds a single 5-segment curved, tapering 3D grass blade geometry.
 * Root is at y = 0, tip is at y = 1.
 */
function createGrassBladeGeometry() {
  const segments = 5;
  const baseHalfWidth = 0.022;
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i < segments; i += 1) {
    const t = i / segments;
    const widthScale = Math.pow(1 - t, 0.72);
    const halfW = baseHalfWidth * widthScale;
    const naturalBendZ = 0.095 * t * t;
    const midArchZ = 0.004 * (1 - t);

    // Left and right vertices at this height step
    positions.push(-halfW, t, naturalBendZ);
    positions.push(halfW, t, naturalBendZ + midArchZ);

    uvs.push(0, t);
    uvs.push(1, t);
  }

  // Pointed blade tip at t = 1.0
  const tipIndex = segments * 2;
  positions.push(0, 1.0, 0.095);
  uvs.push(0.5, 1.0);

  for (let i = 0; i < segments - 1; i += 1) {
    const bl = i * 2;
    const br = bl + 1;
    const tl = bl + 2;
    const tr = bl + 3;

    indices.push(bl, br, tl);
    indices.push(br, tr, tl);
  }

  const lastL = (segments - 1) * 2;
  const lastR = lastL + 1;
  indices.push(lastL, lastR, tipIndex);

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
  geometry.setIndex(indices);

  // Tilt normals upward so hemisphere + directional lights shade both sides smoothly without harsh dark flips
  const vertCount = positions.length / 3;
  const normals = new Float32Array(vertCount * 3);
  for (let i = 0; i < vertCount; i += 1) {
    const side = i === tipIndex ? 0 : i % 2 === 0 ? -0.18 : 0.18;
    const nx = side;
    const ny = 0.78;
    const nz = 0.6;
    const len = Math.hypot(nx, ny, nz);
    normals[i * 3] = nx / len;
    normals[i * 3 + 1] = ny / len;
    normals[i * 3 + 2] = nz / len;
  }
  geometry.setAttribute('normal', new BufferAttribute(normals, 3));
  geometry.computeBoundingSphere();

  return geometry;
}

/**
 * Rolling volcanic grass mound beneath the instanced grass blades.
 */
function TerrainMound() {
  const terrainGeo = useMemo(() => {
    const geo = new PlaneGeometry(30, 30, 112, 112);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    const soilDark = new Color('#1c2a17');
    const turfMid = new Color('#2b4222');
    const turfWarm = new Color('#364f27');
    const tmpColor = new Color();

    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = getTerrainHeight(x, z);
      pos.setY(i, y);

      const dxMoai = x - MOAI_OFFSET_X;
      const dzMoai = z - MOAI_OFFSET_Z;
      const distMoai = Math.hypot(dxMoai, dzMoai);

      // Subtle contact darkening directly under the Moai statue + organic moss/turf variation
      const moaiContactAo = Math.min(1, Math.max(0, (distMoai - 0.55) / 1.45));
      const noiseTone = 0.5 + 0.5 * Math.sin(x * 0.7 + z * 0.9);
      tmpColor.copy(turfMid).lerp(turfWarm, noiseTone * 0.65);
      tmpColor.lerp(soilDark, 1 - moaiContactAo * 0.82);

      colors[i * 3] = tmpColor.r;
      colors[i * 3 + 1] = tmpColor.g;
      colors[i * 3 + 2] = tmpColor.b;
    }

    geo.setAttribute('color', new BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={terrainGeo} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.96} metalness={0.01} />
    </mesh>
  );
}

/**
 * GPU-instanced 3D grass meadow with vertex-shader traveling wind waves,
 * root ambient occlusion, and day-cycle responsive breeze.
 */
function InstancedGrassMeadow() {
  const meshRef = useRef(null);
  const timeRef = useDayTime(0);
  const dayState = useMemo(() => createDayState(), []);
  const shaderUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uWindStrength: { value: 1.0 },
    }),
    [],
  );

  const { geometry, matrices } = useMemo(() => {
    const rand = createSeededRandom(20261020);
    const bladeGeo = createGrassBladeGeometry();

    // Pre-generate tussock cluster centers (especially around the Moai base and foreground)
    const clusterCenters = [
      // Ring of lush tussocks hugging the Moai base
      { x: MOAI_OFFSET_X - 0.92, z: 0.58, radius: 0.95, heightBoost: 1.28 },
      { x: MOAI_OFFSET_X + 0.88, z: 0.46, radius: 0.9, heightBoost: 1.22 },
      { x: MOAI_OFFSET_X - 0.45, z: 0.82, radius: 0.85, heightBoost: 1.18 },
      { x: MOAI_OFFSET_X + 0.35, z: -0.78, radius: 0.95, heightBoost: 1.25 },
      { x: MOAI_OFFSET_X - 0.85, z: -0.62, radius: 0.9, heightBoost: 1.2 },
      // Foreground & mid-ground natural meadow tussocks
      { x: -0.55, z: 1.85, radius: 1.35, heightBoost: 1.24 },
      { x: -2.25, z: 1.15, radius: 1.45, heightBoost: 1.2 },
      { x: 2.85, z: 1.35, radius: 1.3, heightBoost: 1.18 },
      { x: -1.45, z: -1.35, radius: 1.5, heightBoost: 1.15 },
      { x: 0.25, z: -1.85, radius: 1.4, heightBoost: 1.15 },
      { x: -3.35, z: -0.35, radius: 1.5, heightBoost: 1.12 },
      { x: 3.45, z: -0.85, radius: 1.4, heightBoost: 1.12 },
    ];

    const matArray = new Float32Array(GRASS_BLADE_COUNT * 16);
    // vec4(phase, windWeight, leanAngle, colorMix)
    const bladeMeta = new Float32Array(GRASS_BLADE_COUNT * 4);

    const dummyMat = new Matrix4();
    const pos = new Vector3();
    const quat = new Quaternion();
    const scale = new Vector3();
    const yAxis = new Vector3(0, 1, 0);
    const xAxis = new Vector3(1, 0, 0);
    const tiltQuat = new Quaternion();

    let placed = 0;
    let attempts = 0;

    while (placed < GRASS_BLADE_COUNT && attempts < GRASS_BLADE_COUNT * 3) {
      attempts += 1;

      let x;
      let z;
      let clusterBoost = 1.0;

      // 42% of blades spawn in natural tussock clusters, 58% across the continuous meadow
      if (rand() < 0.42) {
        const c = clusterCenters[Math.floor(rand() * clusterCenters.length)];
        const angle = rand() * Math.PI * 2;
        const r = Math.pow(rand(), 0.68) * c.radius;
        x = c.x + Math.cos(angle) * r;
        z = c.z + Math.sin(angle) * r;
        clusterBoost = c.heightBoost * (1 - (r / c.radius) * 0.28);
      } else {
        const angle = rand() * Math.PI * 2;
        // Bias density toward the visible foreground and mid-ground
        const r = Math.pow(rand(), 0.62) * 10.8;
        x = Math.cos(angle) * r * 1.12 + 0.15;
        z = Math.sin(angle) * r * 0.92 - 0.35;
      }

      // Exclude the interior footprint of the Moai statue's stone body so blades don't poke through the chest
      const dxMoai = (x - MOAI_OFFSET_X) / 0.64;
      const dzMoai = (z - MOAI_OFFSET_Z) / 0.48;
      const moaiFootprint = dxMoai * dxMoai + dzMoai * dzMoai;
      if (moaiFootprint < 0.92) {
        continue;
      }

      const distFromOrigin = Math.hypot(x, z);
      const distanceFade = Math.max(0.42, 1 - Math.max(0, distFromOrigin - 4.8) / 8.5);

      // Natural tussock height variation around the statue base & across the slope
      const ringNearMoai = moaiFootprint < 2.4 ? 1.16 : 1.0;
      const baseHeight = (0.19 + Math.pow(rand(), 1.45) * 0.31) * clusterBoost * ringNearMoai * distanceFade;
      const bladeWidth = (0.78 + rand() * 0.56) * Math.min(1.15, 0.8 + baseHeight * 0.7);

      const y = getTerrainHeight(x, z) - 0.012;
      pos.set(x, y, z);

      const yaw = rand() * Math.PI * 2;
      const naturalPitch = (rand() - 0.35) * 0.26;
      quat.setFromAxisAngle(yAxis, yaw);
      tiltQuat.setFromAxisAngle(xAxis, naturalPitch);
      quat.multiply(tiltQuat);

      scale.set(bladeWidth, baseHeight, bladeWidth);
      dummyMat.compose(pos, quat, scale);
      dummyMat.toArray(matArray, placed * 16);

      // Per-blade shader attributes:
      // x: random phase (0..2pi)
      // y: wind flexibility (taller blades sway slightly more)
      // z: dry/golden meadow tint factor (0..1)
      // w: brightness variation (0.82..1.18)
      const isGoldenTuft = rand() < 0.18 ? 0.55 + rand() * 0.45 : rand() * 0.35;
      bladeMeta[placed * 4] = rand() * Math.PI * 2;
      bladeMeta[placed * 4 + 1] = (0.65 + rand() * 0.55) * Math.min(1.35, baseHeight * 2.4);
      bladeMeta[placed * 4 + 2] = isGoldenTuft;
      bladeMeta[placed * 4 + 3] = 0.84 + rand() * 0.32;

      placed += 1;
    }

    bladeGeo.setAttribute('aBladeMeta', new InstancedBufferAttribute(bladeMeta, 4));

    return {
      geometry: bladeGeo,
      matrices: matArray,
    };
  }, []);

  const material = useMemo(() => {
    const mat = new MeshStandardMaterial({
      color: '#ffffff',
      roughness: 0.76,
      metalness: 0.02,
      side: DoubleSide,
    });

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = shaderUniforms.uTime;
      shader.uniforms.uWindStrength = shaderUniforms.uWindStrength;

      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          /* glsl */ `
          #include <common>
          attribute vec4 aBladeMeta;
          uniform float uTime;
          uniform float uWindStrength;
          varying float vHeightFrac;
          varying vec3 vBladeTint;
          varying float vWindBend;
          `,
        )
        .replace(
          '#include <begin_vertex>',
          /* glsl */ `
          #include <begin_vertex>
          vHeightFrac = clamp(uv.y, 0.0, 1.0);

          // World-space root position of this blade instance
          vec3 worldRoot = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
          float phase = aBladeMeta.x;
          float flex = aBladeMeta.y;
          float goldenMix = aBladeMeta.z;
          float lumVar = aBladeMeta.w;

          // Root stays 100% anchored (bendWeight = 0 at uv.y = 0)
          float bendWeight = pow(vHeightFrac, 1.65) * flex * uWindStrength;

          // Traveling coastal wind wave + secondary cross ripple + individual blade flutter
          float wavePrimary = sin(worldRoot.x * 0.52 + worldRoot.z * 0.38 - uTime * 1.65 + phase * 0.35);
          float waveGust = sin(worldRoot.x * 0.24 - worldRoot.z * 0.29 - uTime * 0.92 + 1.7) * 0.65;
          float flutter = sin(uTime * 3.1 + phase * 2.0) * 0.18;

          float windX = (0.095 + 0.085 * wavePrimary + 0.055 * waveGust + flutter * 0.04) * bendWeight;
          float windZ = (0.045 * cos(worldRoot.z * 0.46 - uTime * 1.35 + phase) + 0.035 * waveGust) * bendWeight;

          // Transform world-space wind vector into the blade's local XZ orientation
          vec3 rightAxis = normalize(vec3(instanceMatrix[0][0], instanceMatrix[0][1], instanceMatrix[0][2]));
          vec3 forwardAxis = normalize(vec3(instanceMatrix[2][0], instanceMatrix[2][1], instanceMatrix[2][2]));
          float localWindX = dot(vec3(windX, 0.0, windZ), rightAxis);
          float localWindZ = dot(vec3(windX, 0.0, windZ), forwardAxis);

          transformed.x += localWindX;
          transformed.z += localWindZ;
          // Subtle arc-length conservation: as a blade bends sideways, its tip dips slightly
          transformed.y -= min(0.22, (localWindX * localWindX + localWindZ * localWindZ) * 0.55);

          vWindBend = clamp((wavePrimary * 0.5 + 0.5) * vHeightFrac, 0.0, 1.0);

          // Natural Rapa Nui coastal meadow palette (root AO -> lush mid -> warm sun-kissed tip)
          vec3 rootCol = vec3(0.10, 0.17, 0.08);
          vec3 lushMid = vec3(0.22, 0.40, 0.16);
          vec3 dryMid  = vec3(0.34, 0.42, 0.18);
          vec3 lushTip = vec3(0.44, 0.62, 0.26);
          vec3 goldTip = vec3(0.64, 0.66, 0.31);

          vec3 midCol = mix(lushMid, dryMid, goldenMix);
          vec3 tipCol = mix(lushTip, goldTip, goldenMix);

          vec3 gradCol = mix(rootCol, midCol, smoothstep(0.0, 0.48, vHeightFrac));
          gradCol = mix(gradCol, tipCol, smoothstep(0.42, 1.0, vHeightFrac));
          vBladeTint = gradCol * lumVar;
          `,
        );

      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          /* glsl */ `
          #include <common>
          varying float vHeightFrac;
          varying vec3 vBladeTint;
          varying float vWindBend;
          `,
        )
        .replace(
          'vec4 diffuseColor = vec4( diffuse, opacity );',
          /* glsl */ `
          // Subtle wind-wave sheen across swaying tips + root ambient occlusion
          vec3 bladeColor = vBladeTint + vec3(0.05, 0.07, 0.02) * vWindBend * smoothstep(0.35, 1.0, vHeightFrac);
          vec4 diffuseColor = vec4( bladeColor, opacity );
          `,
        );
    };

    mat.customProgramCacheKey = () => 'moaiy-instanced-grass-v1';
    return mat;
  }, [shaderUniforms]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }

    mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    mesh.instanceMatrix.array.set(matrices);
    mesh.instanceMatrix.needsUpdate = true;
  }, [matrices]);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;
    sampleDay(timeRef.current, dayState);

    // Stronger gusts during stormy weather, calmer breeze at dawn/night
    const stormBoost = 1.0 + dayState.rain * 0.55 + dayState.cloudiness * 0.22;
    shaderUniforms.uTime.value = elapsed * (0.95 + dayState.rain * 0.35);
    shaderUniforms.uWindStrength.value = stormBoost;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, GRASS_BLADE_COUNT]}
      castShadow={false}
      receiveShadow
      frustumCulled={false}
    />
  );
}

/**
 * Subtle weathered volcanic stones nestled in the grass near the Moai statue.
 */
function VolcanicStones() {
  const stones = useMemo(
    () => [
      { key: 'stone-1', x: MOAI_OFFSET_X - 1.05, z: 0.62, scale: [0.22, 0.11, 0.17], rotY: 0.4, color: '#4c545c' },
      { key: 'stone-2', x: MOAI_OFFSET_X + 0.92, z: 0.48, scale: [0.16, 0.08, 0.14], rotY: 1.2, color: '#586068' },
      { key: 'stone-3', x: -1.15, z: 1.45, scale: [0.18, 0.09, 0.15], rotY: 2.1, color: '#515962' },
    ],
    [],
  );

  return stones.map((stone) => {
    const y = getTerrainHeight(stone.x, stone.z) + stone.scale[1] * 0.35;
    return (
      <mesh
        key={stone.key}
        position={[stone.x, y, stone.z]}
        rotation={[0.08, stone.rotY, -0.05]}
        scale={stone.scale}
        castShadow
        receiveShadow
      >
        <dodecahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color={stone.color} roughness={0.92} metalness={0.04} />
      </mesh>
    );
  });
}

function GrassGround() {
  return (
    <group>
      <TerrainMound />
      <InstancedGrassMeadow />
      <VolcanicStones />
    </group>
  );
}

export default function HeroScene3D() {
  const dprRange = useAdaptiveDprRange();

  return (
    <ErrorBoundary>
      <div
        style={{
          position: 'absolute',
          inset: 0,
        }}
      >
        <Canvas
          dpr={dprRange}
          performance={{ min: 0.5 }}
          shadows={{ type: PCFShadowMap }}
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
            {SHOW_DAY_CYCLE ? <DayCycleSystem target={DAY_LIGHT_TARGET} /> : null}
            <GrassGround />
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
