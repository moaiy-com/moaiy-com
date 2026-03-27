import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Box3, MeshStandardMaterial, Vector3 } from 'three';

const MODEL_SCALE_RATIO = 0.7;
const EXTERNAL_MODEL_PATH = '/models/moai/angelito-moai.glb';
const EXTERNAL_TARGET_HEIGHT = 4.6 * MODEL_SCALE_RATIO;
const EXTERNAL_BASELINE_Y = -2.15;

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
    <group
      ref={moaiRef}
      position={[0, -0.35, 0]}
      scale={[MODEL_SCALE_RATIO, MODEL_SCALE_RATIO, MODEL_SCALE_RATIO]}
    >
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
    </group>
  );
}

function ExternalMoai() {
  const moaiRef = useRef();
  const { scene } = useGLTF(EXTERNAL_MODEL_PATH);

  const normalizedScene = useMemo(() => {
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

    return clone;
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
