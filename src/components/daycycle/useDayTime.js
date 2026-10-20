import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { DAY_LENGTH_SECONDS } from './keyframes.js';

const REDUCED_MOTION_FROZEN_T = 0.42;

/**
 * Returns a ref whose .current is the day time 0..1, advanced every frame.
 * `?t=0.55` in the URL pins the time (handy for screenshots / debugging).
 * prefers-reduced-motion freezes the cycle at a calm afternoon.
 */
export function useDayTime(startAt = 0) {
  const timeRef = useRef(startAt);
  const fixedRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const param = new URLSearchParams(window.location.search).get('t');
    const parsed = param === null ? NaN : Number.parseFloat(param);
    if (Number.isFinite(parsed)) {
      fixedRef.current = ((parsed % 1) + 1) % 1;
      timeRef.current = fixedRef.current;
      return undefined;
    }
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const apply = () => {
      fixedRef.current = mq?.matches ? REDUCED_MOTION_FROZEN_T : null;
    };
    apply();
    mq?.addEventListener?.('change', apply);
    return () => mq?.removeEventListener?.('change', apply);
  }, []);

  useFrame((_, delta) => {
    if (fixedRef.current !== null) {
      timeRef.current = fixedRef.current;
      return;
    }
    timeRef.current = (timeRef.current + Math.min(delta, 0.1) / DAY_LENGTH_SECONDS) % 1;
  });

  return timeRef;
}
