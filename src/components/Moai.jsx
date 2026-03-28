import { Suspense, useEffect, useMemo, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { Box3, Vector3 } from 'three';

const MODEL_SCALE_RATIO = 0.7;
const EXTERNAL_MODEL_PATH = '/models/moai/angelito-moai.glb';
const EXTERNAL_TARGET_HEIGHT = 4.6 * MODEL_SCALE_RATIO;
const EXTERNAL_BASELINE_Y = -2.12;

function removeBackHeadArtifact(root) {
  root.updateMatrixWorld(true);

  const box = new Box3().setFromObject(root);
  const center = box.getCenter(new Vector3());
  const size = box.getSize(new Vector3());
  const yCut = box.min.y + size.y * 0.62;
  const zCut = box.min.z + size.z * 0.22;
  const xBand = size.x * 0.22;

  const v0 = new Vector3();
  const v1 = new Vector3();
  const v2 = new Vector3();
  const triCenter = new Vector3();

  root.traverse((child) => {
    if (!child.isMesh || !child.geometry?.index || !child.geometry?.attributes?.position) {
      return;
    }

    const geometry = child.geometry.clone();
    child.geometry = geometry;

    const positions = geometry.attributes.position;
    const indexArray = geometry.index.array;
    const keep = [];

    for (let i = 0; i < indexArray.length; i += 3) {
      const a = indexArray[i];
      const b = indexArray[i + 1];
      const c = indexArray[i + 2];

      v0.fromBufferAttribute(positions, a).applyMatrix4(child.matrixWorld);
      v1.fromBufferAttribute(positions, b).applyMatrix4(child.matrixWorld);
      v2.fromBufferAttribute(positions, c).applyMatrix4(child.matrixWorld);

      triCenter.copy(v0).add(v1).add(v2).multiplyScalar(1 / 3);

      const isBackHeadArtifact =
        triCenter.y >= yCut &&
        triCenter.z <= zCut &&
        Math.abs(triCenter.x - center.x) <= xBand;

      if (!isBackHeadArtifact) {
        keep.push(a, b, c);
      }
    }

    if (keep.length > 0 && keep.length < indexArray.length) {
      geometry.setIndex(keep);
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
    }
  });
}

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

    removeBackHeadArtifact(clone);

    return clone;
  }, [scene]);

  return (
    <group>
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
      <Suspense fallback={null}>
        <ExternalMoai />
      </Suspense>
    );
  }

  return null;
}
