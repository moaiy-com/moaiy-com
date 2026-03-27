import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import {
  Box3,
  CatmullRomCurve3,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Vector3,
} from 'three';

const EXTERNAL_MODEL_PATH = '/models/moai/angelito-moai.glb';
const EXTERNAL_TARGET_HEIGHT = 4.6;
const EXTERNAL_BASELINE_Y = -2.15;

function MoaiAccessories({
  eyeY,
  faceZ,
  lensWidth,
  lensHeight,
  lensGap,
  smileY,
  smileWidth,
}) {
  const glowRef = useRef();
  const smileRef = useRef();
  const glassesRef = useRef();

  const smileMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: 0x4ECDC4,
        emissive: 0x4ECDC4,
        emissiveIntensity: 0.35,
        roughness: 0.25,
        metalness: 0.12,
      }),
    [],
  );

  const lensMaterial = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: 0x63E4D8,
        roughness: 0.08,
        metalness: 0.2,
        transmission: 0.65,
        thickness: 0.3,
        transparent: true,
        opacity: 0.78,
      }),
    [],
  );

  const frameMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: 0x2B3345,
        roughness: 0.28,
        metalness: 0.65,
      }),
    [],
  );

  const glowMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        color: 0x4ECDC4,
        transparent: true,
        opacity: 0.09,
      }),
    [],
  );

  const smileCurve = useMemo(
    () =>
      new CatmullRomCurve3([
        new Vector3(-smileWidth, 0.07, 0),
        new Vector3(-smileWidth * 0.52, -0.02, 0.012),
        new Vector3(0, -0.06, 0.02),
        new Vector3(smileWidth * 0.52, -0.02, 0.012),
        new Vector3(smileWidth, 0.07, 0),
      ]),
    [smileWidth],
  );

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (glassesRef.current) {
      glassesRef.current.rotation.z = Math.sin(time * 0.4) * 0.012;
    }

    if (smileRef.current) {
      smileRef.current.material.emissiveIntensity = 0.3 + Math.sin(time * 1.35) * 0.12;
    }

    if (glowRef.current) {
      glowRef.current.material.opacity = 0.07 + Math.sin(time * 1.8) * 0.025;
    }
  });

  useEffect(() => {
    return () => {
      smileMaterial.dispose();
      lensMaterial.dispose();
      frameMaterial.dispose();
      glowMaterial.dispose();
    };
  }, [smileMaterial, lensMaterial, frameMaterial, glowMaterial]);

  return (
    <>
      <mesh
        castShadow
        ref={smileRef}
        position={[0, smileY, faceZ + 0.11]}
        material={smileMaterial}
      >
        <tubeGeometry
          args={[
            smileCurve,
            30,
            Math.max(0.02, lensWidth * 0.06),
            12,
            false,
          ]}
        />
      </mesh>

      <group ref={glassesRef} position={[0, eyeY, 0]}>
        <mesh
          castShadow
          position={[-lensGap, 0, faceZ]}
          material={lensMaterial}
        >
          <boxGeometry args={[lensWidth, lensHeight, 0.05]} />
        </mesh>

        <mesh
          castShadow
          position={[lensGap, 0, faceZ]}
          material={lensMaterial}
        >
          <boxGeometry args={[lensWidth, lensHeight, 0.05]} />
        </mesh>

        <mesh
          castShadow
          position={[0, lensHeight * 0.58, faceZ + 0.01]}
          material={frameMaterial}
        >
          <boxGeometry args={[lensWidth * 2.25 + lensGap * 0.8, 0.06, 0.05]} />
        </mesh>

        <mesh
          castShadow
          position={[0, 0, faceZ + 0.01]}
          material={frameMaterial}
        >
          <boxGeometry args={[Math.max(0.1, lensGap * 0.5), 0.1, 0.05]} />
        </mesh>
      </group>

      <mesh
        ref={glowRef}
        position={[0, eyeY - lensHeight * 2.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={glowMaterial}
      >
        <ringGeometry args={[2.35, 4.55, 72]} />
      </mesh>
    </>
  );
}

function ProceduralMoai() {
  const moaiRef = useRef();

  const stoneMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: 0x9099A7,
        roughness: 0.9,
        metalness: 0.03,
      }),
    [],
  );

  const stoneDetailMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: 0x818B99,
        roughness: 0.88,
        metalness: 0.04,
      }),
    [],
  );

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (moaiRef.current) {
      moaiRef.current.position.y = -0.35 + Math.sin(time * 0.52) * 0.05;
      moaiRef.current.rotation.y = Math.sin(time * 0.24) * 0.08;
    }
  });

  useEffect(() => {
    return () => {
      stoneMaterial.dispose();
      stoneDetailMaterial.dispose();
    };
  }, [stoneMaterial, stoneDetailMaterial]);

  return (
    <group ref={moaiRef} position={[0, -0.35, 0]}>
      <mesh
        castShadow
        position={[0, -2.15, 0]}
        receiveShadow
        material={stoneDetailMaterial}
      >
        <cylinderGeometry args={[1.45, 1.7, 0.78, 56]} />
      </mesh>

      <mesh
        castShadow
        position={[0, -0.64, 0]}
        receiveShadow
        material={stoneMaterial}
      >
        <cylinderGeometry args={[1.02, 1.25, 2.72, 56]} />
      </mesh>

      <mesh
        castShadow
        position={[0, 0.88, 0]}
        receiveShadow
        material={stoneMaterial}
      >
        <cylinderGeometry args={[0.88, 1.02, 0.34, 44]} />
      </mesh>

      <mesh
        castShadow
        position={[0, 2.02, 0]}
        receiveShadow
        scale={[1, 1.16, 0.94]}
        material={stoneMaterial}
      >
        <capsuleGeometry args={[0.84, 1.36, 14, 24]} />
      </mesh>

      <mesh
        castShadow
        position={[0, 2.24, 0.58]}
        receiveShadow
        material={stoneDetailMaterial}
      >
        <boxGeometry args={[1.14, 0.18, 0.44]} />
      </mesh>

      <mesh
        castShadow
        position={[0, 1.66, 0.67]}
        receiveShadow
        material={stoneDetailMaterial}
      >
        <boxGeometry args={[0.24, 0.6, 0.4]} />
      </mesh>

      <mesh
        castShadow
        position={[0, 1.28, 0.74]}
        receiveShadow
        material={stoneDetailMaterial}
      >
        <boxGeometry args={[0.3, 0.22, 0.45]} />
      </mesh>

      <mesh
        castShadow
        position={[-0.78, 1.96, 0.14]}
        receiveShadow
        material={stoneDetailMaterial}
        rotation={[0.02, 0, 0.1]}
      >
        <boxGeometry args={[0.18, 0.62, 0.26]} />
      </mesh>

      <mesh
        castShadow
        position={[0.78, 1.96, 0.14]}
        receiveShadow
        material={stoneDetailMaterial}
        rotation={[0.02, 0, -0.1]}
      >
        <boxGeometry args={[0.18, 0.62, 0.26]} />
      </mesh>

      <MoaiAccessories
        eyeY={2.03}
        faceZ={0.67}
        lensWidth={0.52}
        lensHeight={0.36}
        lensGap={0.35}
        smileY={1.38}
        smileWidth={0.28}
      />
    </group>
  );
}

function ExternalMoai() {
  const moaiRef = useRef();
  const { scene } = useGLTF(EXTERNAL_MODEL_PATH);

  const { normalizedScene, accessoryLayout } = useMemo(() => {
    const clone = scene.clone(true);
    const rawBox = new Box3().setFromObject(clone);
    const rawSize = new Vector3();
    const rawCenter = new Vector3();
    rawBox.getSize(rawSize);
    rawBox.getCenter(rawCenter);

    const rawHeight = Math.max(rawSize.y, 1);
    const scale = EXTERNAL_TARGET_HEIGHT / rawHeight;
    clone.scale.setScalar(scale);

    clone.position.set(
      -rawCenter.x * scale,
      EXTERNAL_BASELINE_Y - rawBox.min.y * scale,
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

        if (
          'metalness' in material &&
          typeof material.metalness === 'number'
        ) {
          material.metalness = Math.min(material.metalness, 0.08);
        }

        if (
          'roughness' in material &&
          typeof material.roughness === 'number'
        ) {
          material.roughness = Math.max(material.roughness, 0.74);
        }

        if (
          'envMapIntensity' in material &&
          typeof material.envMapIntensity === 'number'
        ) {
          material.envMapIntensity = Math.max(material.envMapIntensity, 0.42);
        }
      }
    });

    const scaledSize = rawSize.clone().multiplyScalar(scale);

    return {
      normalizedScene: clone,
      accessoryLayout: {
        eyeY: EXTERNAL_BASELINE_Y + scaledSize.y * 0.67,
        faceZ: Math.min(0.92, Math.max(0.45, scaledSize.z * 0.5)),
        lensWidth: Math.min(0.58, Math.max(0.4, scaledSize.x * 0.27)),
        lensHeight: Math.min(0.38, Math.max(0.26, scaledSize.y * 0.07)),
        lensGap: Math.min(0.41, Math.max(0.27, scaledSize.x * 0.18)),
        smileY: EXTERNAL_BASELINE_Y + scaledSize.y * 0.56,
        smileWidth: Math.min(0.34, Math.max(0.24, scaledSize.x * 0.16)),
      },
    };
  }, [scene]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (moaiRef.current) {
      moaiRef.current.position.y = Math.sin(time * 0.44) * 0.04;
      moaiRef.current.rotation.y = Math.sin(time * 0.22) * 0.07;
    }
  });

  return (
    <group ref={moaiRef}>
      <primitive object={normalizedScene} />
      <MoaiAccessories {...accessoryLayout} />
    </group>
  );
}

async function hasModelAsset(path) {
  try {
    const headResponse = await fetch(path, { method: 'HEAD', cache: 'no-store' });
    if (headResponse.ok) {
      return true;
    }
  } catch {
    // Fall through to GET probing for servers that do not support HEAD.
  }

  try {
    const getResponse = await fetch(path, { method: 'GET', cache: 'no-store' });
    return getResponse.ok;
  } catch {
    return false;
  }
}

export default function Moai() {
  const [isExternalModelEnabled, setIsExternalModelEnabled] = useState(false);
  const [modelCheckFinished, setModelCheckFinished] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const modelExists = await hasModelAsset(EXTERNAL_MODEL_PATH);
      if (cancelled) {
        return;
      }

      setIsExternalModelEnabled(modelExists);
      setModelCheckFinished(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (modelCheckFinished && isExternalModelEnabled) {
    return (
      <Suspense fallback={<ProceduralMoai />}>
        <ExternalMoai />
      </Suspense>
    );
  }

  return <ProceduralMoai />;
}
