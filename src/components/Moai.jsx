import { Suspense, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { Box3, Vector3 } from 'three';

const MODEL_SCALE_RATIO = 0.7;
const EXTERNAL_MODEL_PATH = '/models/moai/angelito-moai.glb';
const EXTERNAL_TARGET_HEIGHT = 4.6 * MODEL_SCALE_RATIO;
const EXTERNAL_BASELINE_Y = -2.12;

function ExternalMoai() {
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

  return (
    <group>
      <primitive object={normalizedScene} />
    </group>
  );
}

function MoaiPlaceholder() {
  return (
    <group position={[0, EXTERNAL_BASELINE_Y, 0]}>
      <mesh castShadow receiveShadow position={[0, 2.18, 0]}>
        <boxGeometry args={[1.52, 4.36, 1.2]} />
        <meshStandardMaterial color="#96a4bf" roughness={0.92} metalness={0.02} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 4.55, 0.1]}>
        <boxGeometry args={[1.04, 0.44, 0.86]} />
        <meshStandardMaterial color="#a8b4cd" roughness={0.9} metalness={0.01} />
      </mesh>
    </group>
  );
}

useGLTF.preload(EXTERNAL_MODEL_PATH);

export default function Moai() {
  return (
    <Suspense fallback={<MoaiPlaceholder />}>
      <ExternalMoai />
    </Suspense>
  );
}
