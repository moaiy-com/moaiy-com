import { forwardRef, useMemo } from 'react';
import { BufferAttribute, BufferGeometry, Color } from 'three';

const RAIN_COUNT = 6000;

const rainVertex = /* glsl */ `
uniform float uTime;
uniform float uRain;
attribute vec4 aSeed;
attribute float aEnd;
varying float vAlpha;
void main() {
  float speed = 17.0 + aSeed.w * 7.0;
  float span = 12.0;
  float fall = mod(aSeed.z * span + uTime * speed, span);
  vec3 p = vec3(aSeed.x + fall * 0.16, 8.5 - fall, aSeed.y);
  // Streak tail points back up-wind so streaks are slightly slanted.
  p += vec3(-0.16, 1.0, 0.0) * aEnd * (0.38 + aSeed.w * 0.25);
  float on = step(aSeed.w, uRain);
  vAlpha = on * mix(1.0, 0.0, aEnd);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;

const rainFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vAlpha;
void main() {
  gl_FragColor = vec4(uColor, vAlpha * uOpacity);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

/** Single LineSegments draw call; all motion in the vertex shader. */
const RainLayer = forwardRef(function RainLayer(_, ref) {
  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    const pos = new Float32Array(RAIN_COUNT * 2 * 3);
    const seed = new Float32Array(RAIN_COUNT * 2 * 4);
    const end = new Float32Array(RAIN_COUNT * 2);
    for (let i = 0; i < RAIN_COUNT; i++) {
      const x = (Math.random() - 0.5) * 26;
      const z = -9 + Math.random() * 14;
      const ph = Math.random();
      const r = Math.random();
      for (let k = 0; k < 2; k++) {
        const v = i * 2 + k;
        seed.set([x, z, ph, r], v * 4);
        end[v] = k;
      }
    }
    g.setAttribute('position', new BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new BufferAttribute(seed, 4));
    g.setAttribute('aEnd', new BufferAttribute(end, 1));
    return g;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRain: { value: 0 },
      uOpacity: { value: 0.45 },
      uColor: { value: new Color('#c8d2e0') },
    }),
    [],
  );

  return (
    <lineSegments ref={ref} geometry={geometry} frustumCulled={false} renderOrder={3} visible={false}>
      <shaderMaterial
        transparent
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={rainVertex}
        fragmentShader={rainFragment}
      />
    </lineSegments>
  );
});

export default RainLayer;
