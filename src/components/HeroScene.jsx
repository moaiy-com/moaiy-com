import { lazy, Suspense, useEffect, useState } from 'react';

let heroSceneModulePromise;

function loadHeroScene3D() {
  if (!heroSceneModulePromise) {
    heroSceneModulePromise = import('./HeroScene3D.jsx');
  }
  return heroSceneModulePromise;
}

const HeroScene3D = lazy(loadHeroScene3D);

function StaticFallback() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        background: [
          'radial-gradient(circle at 15% 20%, rgba(6, 190, 225, 0.16), transparent 35%)',
          'radial-gradient(circle at 80% 10%, rgba(23, 104, 172, 0.2), transparent 30%)',
          'linear-gradient(180deg, #ffffff 0%, #f4f8ff 56%, #e9f1ff 100%)',
        ].join(','),
      }}
    />
  );
}

function shouldDisable3D() {
  const connection =
    navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  if (connection?.saveData) {
    return true;
  }

  if (typeof connection?.effectiveType === 'string') {
    const isSlowNetwork =
      connection.effectiveType.includes('2g') ||
      connection.effectiveType === '3g';
    if (isSlowNetwork) {
      return true;
    }
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

function runWhenIdle(callback, timeout = 1800) {
  if (typeof window.requestIdleCallback === 'function') {
    const idleId = window.requestIdleCallback(callback, { timeout });
    return () => window.cancelIdleCallback(idleId);
  }

  const timerId = window.setTimeout(callback, 350);
  return () => window.clearTimeout(timerId);
}

export default function HeroScene() {
  const [isReady, setIsReady] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [shouldRender3D, setShouldRender3D] = useState(false);

  useEffect(() => {
    const evaluateEligibility = () => {
      const canRender3D = !shouldDisable3D() && supportsWebGL();
      setIsEligible(canRender3D);
      if (!canRender3D) {
        setShouldRender3D(false);
      }
    };

    evaluateEligibility();
    setIsReady(true);

    const connection =
      navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const handleChange = () => evaluateEligibility();

    if (connection && typeof connection.addEventListener === 'function') {
      connection.addEventListener('change', handleChange);
    }

    return () => {
      if (connection && typeof connection.removeEventListener === 'function') {
        connection.removeEventListener('change', handleChange);
      }
    };
  }, []);

  useEffect(() => {
    if (!isReady || !isEligible || shouldRender3D) {
      return;
    }

    return runWhenIdle(() => {
      setShouldRender3D(true);
      void loadHeroScene3D();
    }, 900);
  }, [isReady, isEligible, shouldRender3D]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
      }}
    >
      {!isReady || !shouldRender3D ? (
        <StaticFallback />
      ) : (
        <Suspense fallback={<StaticFallback />}>
          <HeroScene3D />
        </Suspense>
      )}
    </div>
  );
}
