import { lazy, Suspense, useEffect, useState } from 'react';

const HeroScene3D = lazy(() => import('./HeroScene3D.jsx'));

function StaticFallback() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        background: [
          'radial-gradient(circle at 15% 20%, rgba(78, 205, 196, 0.16), transparent 35%)',
          'radial-gradient(circle at 80% 10%, rgba(69, 183, 209, 0.22), transparent 30%)',
          'linear-gradient(180deg, #0A0E27 0%, #151B3B 55%, #1E2545 100%)',
        ].join(','),
      }}
    />
  );
}

function isLowPowerDevice() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return true;
  }

  if (window.innerWidth < 768) {
    return true;
  }

  const connection =
    navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection?.saveData) {
    return true;
  }

  if (
    typeof navigator.deviceMemory === 'number' &&
    navigator.deviceMemory <= 4
  ) {
    return true;
  }

  if (
    typeof navigator.hardwareConcurrency === 'number' &&
    navigator.hardwareConcurrency <= 4
  ) {
    return true;
  }

  return false;
}

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function HeroScene() {
  const [shouldLoad3D, setShouldLoad3D] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const canRender3D = !isLowPowerDevice() && supportsWebGL();
    setShouldLoad3D(canRender3D);
    setIsReady(true);
  }, []);

  if (!isReady || !shouldLoad3D) {
    return <StaticFallback />;
  }

  return (
    <Suspense fallback={<StaticFallback />}>
      <HeroScene3D />
    </Suspense>
  );
}
