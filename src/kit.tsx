import React, {useMemo} from 'react';
import * as THREE from 'three';
import {mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const ramp = (() => {
  const d = new Uint8Array([70, 150, 215, 255]);
  const t = new THREE.DataTexture(d, 4, 1, THREE.RedFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
})();

const outlineMat = (t: number) =>
  new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {t: {value: t}},
    vertexShader: `uniform float t; void main(){ vec3 p = position + normalize(normal)*t; gl_Position = projectionMatrix*modelViewMatrix*vec4(p,1.0);} `,
    fragmentShader: `void main(){ gl_FragColor = vec4(0.141,0.086,0.153,1.0);} `,
    fog: false,
  });

function smooth(g: THREE.BufferGeometry) {
  const c = g.clone();
  c.deleteAttribute('normal');
  c.deleteAttribute('uv');
  const m = mergeVertices(c, 1e-4);
  m.computeVertexNormals();
  return m;
}

type P = {
  geo: THREE.BufferGeometry;
  color?: string;
  map?: THREE.Texture | null;
  emissive?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number] | number;
  line?: number;
  noInk?: boolean;
  opacity?: number;
  children?: React.ReactNode;
};

export function Inked({geo, color = '#999', map, emissive, position, rotation, scale, line = 0.012, noInk, children}: P) {
  const hull = useMemo(() => smooth(geo), [geo]);
  const om = useMemo(() => outlineMat(line), [line]);
  return (
    <group position={position} rotation={rotation as any} scale={scale as any}>
      <mesh geometry={geo}>
        <meshToonMaterial color={color} map={map ?? null} gradientMap={ramp} emissive={emissive ?? '#000'} emissiveIntensity={emissive ? 1 : 0} />
      </mesh>
      {!noInk && <mesh geometry={hull} material={om} />}
      {children}
    </group>
  );
}

export const boxGeo = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
export const cylGeo = (rt: number, rb: number, h: number, s = 24) => new THREE.CylinderGeometry(rt, rb, h, s);
export const sphGeo = (r: number) => new THREE.SphereGeometry(r, 24, 16);

export function Box({size, ...p}: Omit<P, 'geo'> & {size: [number, number, number]}) {
  const geo = useMemo(() => boxGeo(...size), [size[0], size[1], size[2]]);
  return <Inked geo={geo} {...p} />;
}
export function Cyl({r, rb, h, seg = 24, ...p}: Omit<P, 'geo'> & {r: number; rb?: number; h: number; seg?: number}) {
  const geo = useMemo(() => cylGeo(r, rb ?? r, h, seg), [r, rb, h, seg]);
  return <Inked geo={geo} {...p} />;
}
export function Sph({r, ...p}: Omit<P, 'geo'> & {r: number}) {
  const geo = useMemo(() => sphGeo(r), [r]);
  return <Inked geo={geo} {...p} />;
}

// "Cartão" 2D do personagem, sempre de frente para a câmera (rotação em Y).
export function Billboard({
  canvas,
  position,
  height,
  yaw,
  flip = false,
  tint = '#ffffff',
}: {
  canvas: HTMLCanvasElement;
  position: [number, number, number];
  height: number;
  yaw: number;
  flip?: boolean;
  tint?: string;
}) {
  const t = useMemo(() => {
    const tx = new THREE.CanvasTexture(canvas);
    tx.colorSpace = THREE.SRGBColorSpace;
    tx.anisotropy = 8;
    return tx;
  }, [canvas]);
  t.needsUpdate = true;
  const w = height * 0.6;
  return (
    <mesh position={position} rotation={[0, yaw, 0]} scale={[flip ? -1 : 1, 1, 1]}>
      <planeGeometry args={[w, height]} />
      <meshBasicMaterial map={t} transparent alphaTest={0.35} color={tint} side={THREE.DoubleSide} />
    </mesh>
  );
}
