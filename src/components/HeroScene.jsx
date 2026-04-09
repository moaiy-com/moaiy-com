import { lazy, Suspense, useEffect, useRef, useState } from 'react';

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

  if (typeof connection?.effectiveType === 'string') {
    const isSlowNetwork =
      connection.effectiveType.includes('2g') ||
      connection.effectiveType === '3g';
    if (isSlowNetwork) {
      return true;
    }
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

function runWhenIdle(callback, timeout = 1800) {
  if (typeof window.requestIdleCallback === 'function') {
    const idleId = window.requestIdleCallback(callback, { timeout });
    return () => window.cancelIdleCallback(idleId);
  }

  const timerId = window.setTimeout(callback, 350);
  return () => window.clearTimeout(timerId);
}

export default function HeroScene() {
  const hostRef = useRef(null);

  const [isReady, setIsReady] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [shouldRender3D, setShouldRender3D] = useState(false);

  useEffect(() => {
    const canRender3D = !isLowPowerDevice() && supportsWebGL();
    setIsEligible(canRender3D);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isEligible) {
      return;
    }

    const node = hostRef.current;
    if (!node || typeof window.IntersectionObserver !== 'function') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '120px 0px',
        threshold: 0.15,
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [isEligible]);

  useEffect(() => {
    if (!isReady || !isEligible || !isInView || shouldRender3D) {
      return;
    }

    return runWhenIdle(() => {
      setShouldRender3D(true);
      void loadHeroScene3D();
    });
  }, [isReady, isEligible, isInView, shouldRender3D]);

  return (
    <div
      ref={hostRef}
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
