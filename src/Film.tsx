import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {loadFont as loadPlayfair} from '@remotion/google-fonts/PlayfairDisplay';
import {loadFont as loadElite} from '@remotion/google-fonts/SpecialElite';
import {Box, Cyl} from './kit';
import {Limb3D, Room, makeTextures, Tex} from './world';
import {ParisSet, ScrapSet, TrainSet, makeTextures2, Tex2} from './sets';
import {Actor, HotelPilot, LightCtx, Rig} from './Pilot';
import {LIGHT_DAY, LIGHT_DUSK, LIGHT_HOTEL, LIGHT_TRAIN} from './toon2';
import {
  EMPRESARIO_A, EMPRESARIO_C, EMPRESARIO_D, LUSTIG, LUSTIG_CHAPEU, OFICIAL_A, OFICIAL_B, POISSON, POISSON_CHAPEU, State,
} from './toon';
import {camAt, Cam, FPS, blink, clamp01, glide, key, keyv, lerp, lin, outCubic, pick, ramp, sm} from './story';

export const FILM_LEN = 62.5;
const PILOT_A = 29.95;
const PILOT_B = 40.45;

const S = (o: Partial<State> = {}): State => ({expr: 'neutro', look: [0, 0], turn: 0, blink: 0, aL: [-8, -4], aR: [8, 4], lean: 0, bob: 0, ...o});
const bl = (T: number, s: number) => blink(T, s, 2.6);
const breathe = (T: number, s = 0) => Math.sin(T * 2 + s) * 3;
type V3 = [number, number, number];

// brilho de lâmpada (sprite aditivo) e poeira flutuando no ar
const glowTex = (() => {
  let t: THREE.Texture | null = null;
  return () => {
    if (t) return t;
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d')!;
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(255,255,255,1)');
    r.addColorStop(0.25, 'rgba(255,255,255,0.45)');
    r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 128, 128);
    t = new THREE.CanvasTexture(c);
    return t;
  };
})();
function Glow({pos, size, color, amt}: {pos: V3; size: number; color: string; amt: number}) {
  return (
    <sprite position={pos} scale={[size, size, 1]}>
      <spriteMaterial map={glowTex()} color={color} opacity={amt} blending={THREE.AdditiveBlending} depthWrite={false} transparent fog={false} />
    </sprite>
  );
}
function Dust({T, cam}: {T: number; cam: Cam}) {
  const N = 70;
  const geo = useMemo(() => new THREE.BufferGeometry(), []);
  const pos = useMemo(() => new Float32Array(N * 3), []);
  const seeds = useMemo(() => {
    let s = 13;
    const r = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
    return Array.from({length: N}, () => [r(), r(), r(), r() * 0.5 + 0.2]);
  }, []);
  const dir = new THREE.Vector3(cam.l[0] - cam.p[0], cam.l[1] - cam.p[1], cam.l[2] - cam.p[2]).normalize();
  for (let i = 0; i < N; i++) {
    const [a, b, c, sp] = seeds[i];
    const d = 1.2 + c * 5.5;
    const lx = (a - 0.5) * d * 0.9;
    const ly = (b - 0.5) * d * 1.3 + Math.sin(T * sp + i) * 0.12 - ((T * sp * 0.05 + i) % 1) * 0.0;
    const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
    const up = new THREE.Vector3().crossVectors(right, dir).normalize();
    pos[i * 3] = cam.p[0] + dir.x * d + right.x * lx + up.x * ly + Math.sin(T * sp * 0.7 + i * 2) * 0.1;
    pos[i * 3 + 1] = cam.p[1] + dir.y * d + right.y * lx + up.y * ly - ((T * 0.03 * (sp + 0.3) + a) % 0.4);
    pos[i * 3 + 2] = cam.p[2] + dir.z * d + right.z * lx + up.z * ly + Math.cos(T * sp * 0.6 + i) * 0.1;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.attributes.position.needsUpdate = true;
  return (
    <points geometry={geo} frustumCulled={false}>
      <pointsMaterial color="#ffe6b8" size={0.035} transparent opacity={0.75} depthWrite={false} sizeAttenuation fog={false} />
    </points>
  );
}

// ---------- iluminação por cenário
function Lights({set}: {set: 'hotel' | 'paris' | 'scrap' | 'train'}) {
  if (set === 'hotel')
    return (
      <>
        <color attach="background" args={['#2a1b2e']} />
        <fog attach="fog" args={['#c9a07a', 9, 22]} />
        <ambientLight intensity={0.62} color="#c9c0ff" />
        <hemisphereLight args={['#ffcf9a', '#2a2050', 0.5]} />
        <pointLight position={[1.0, 3.2, 0.2]} intensity={19} distance={12} color="#ffc27a" />
        <pointLight position={[-1.6, 2.4, -3.2]} intensity={10} distance={9} color="#ff9a5a" />
        <pointLight position={[0.7, 1.4, -0.5]} intensity={5} distance={4} color="#ffd9a0" />
        <directionalLight position={[3, 3, 6]} intensity={0.45} color="#d8d0ff" />
        <Glow pos={[1.0, 3.62, -0.2]} size={3.2} color="#ffbf70" amt={0.8} />
        <Glow pos={[0.7, 1.2, -0.5]} size={1.3} color="#ffc880" amt={0.85} />
        <Glow pos={[3.15, 1.2, -0.3]} size={1.3} color="#ffc880" amt={0.85} />
        <Glow pos={[-1.6, 2.15, -4.3]} size={4.2} color="#ffb06a" amt={0.35} />
      </>
    );
  if (set === 'train')
    return (
      <>
        <fog attach="fog" args={['#3a2a2a', 6, 14]} />
        <ambientLight intensity={1.3} color="#ffe2b8" />
        <hemisphereLight args={['#ffe0b0', '#4a2a2a', 0.8]} />
        <pointLight position={[0, 2.4, -0.4]} intensity={10} distance={7} color="#ffd89a" />
        <directionalLight position={[1, 2, 5]} intensity={0.9} color="#fff0d6" />
      </>
    );
  const day = set === 'scrap';
  return (
    <>
      <color attach="background" args={['#ffd493']} />
      <fog attach="fog" args={[day ? '#ffe3b0' : '#ffcf9a', 70, 170]} />
      <ambientLight intensity={day ? 1.0 : 0.72} color={day ? '#fff2d6' : '#d8c8ff'} />
      <hemisphereLight args={['#ffcf9a', '#3a2a5a', 0.6]} />
      <directionalLight position={[22, 12, -12]} intensity={day ? 1.1 : 1.7} color="#ffa860" />
      <directionalLight position={[0, 8, 18]} intensity={0.55} color="#e8e0ff" />
    </>
  );
}

// ---------- adereços reutilizáveis
function HeldPaper({pos, map, size = [0.43, 0.59], T, hands = true, tilt = 0.08}: {pos: V3; map: THREE.Texture; size?: [number, number]; T: number; hands?: boolean; tilt?: number}) {
  const hw = size[0] / 2;
  const hh = size[1] / 2;
  return (
    <group position={pos} rotation={[tilt, Math.sin(T * 9) * 0.01, Math.sin(T * 13) * 0.008]}>
      <mesh>
        <planeGeometry args={size} />
        <meshBasicMaterial map={map} side={THREE.DoubleSide} />
      </mesh>
      {hands && (
        <>
          <Limb3D a={[-hw - 0.0, -hh - 0.0, 0]} b={[-hw * 0.5, -hh * 0.4, 0.02]} color="#7a5a3e" skin="#eab48e" r={0.04} />
          <Limb3D a={[hw + 0.0, -hh - 0.0, 0]} b={[hw * 0.5, -hh * 0.4, 0.02]} color="#7a5a3e" skin="#eab48e" r={0.04} />
        </>
      )}
    </group>
  );
}

function Flat({pos, size, map, rotY = 0, rotZ = 0, rotX = -Math.PI / 2, transparent = false, scale = 1}: {pos: V3; size: [number, number]; map: THREE.Texture; rotY?: number; rotZ?: number; rotX?: number; transparent?: boolean; scale?: number}) {
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={scale}>
      <mesh rotation={[rotX, 0, rotZ]}>
        <planeGeometry args={size} />
        <meshBasicMaterial map={map} transparent={transparent} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// carimbo caindo sobre um papel na mesa
function StampOn({base, T, tHit, map, sleeve = '#4a4f66', size = [0.36, 0.18], markPos = [0.08, 0.003, -0.02] as V3, up = 0.4}: {base: V3; T: number; tHit: number; map: THREE.Texture; sleeve?: string; size?: [number, number]; markPos?: V3; up?: number}) {
  const y = key(T, [[tHit - 0.45, 0.95], [tHit - 0.28, 0.95], [tHit, 0.09], [tHit + 0.15, 0.09], [tHit + 0.5, 0.7]]);
  const popped = T >= tHit;
  const pop = lerp(1.35, 1, ramp(T, tHit, tHit + 0.15));
  return (
    <group position={base}>
      {popped && (
        <mesh rotation={[-Math.PI / 2, 0, 0.08]} position={markPos} scale={[pop, pop, 1]}>
          <planeGeometry args={size} />
          <meshBasicMaterial map={map} transparent />
        </mesh>
      )}
      <group position={[markPos[0], y, markPos[2]]}>
        <Cyl r={0.07} h={0.05} position={[0, 0.025, 0]} color="#3b2a1a" />
        <Cyl r={0.03} h={0.16} position={[0, 0.13, 0]} color="#5a3a22" />
        <Box size={[0.1, 0.06, 0.1]} position={[0, 0.22, 0]} color="#5a3a22" />
        <Limb3D a={[-0.03, 1.2, 0.03]} b={[0, 0.27, 0]} color={sleeve} r={0.05} />
      </group>
    </group>
  );
}

function Suitcase({T}: {T: number}) {
  return (
    <group position={[0.1, 0.42, -0.55]} rotation={[0.25, 0, 0]} scale={0.8}>
      <Box size={[0.7, 0.14, 0.45]} color="#4a3220" line={0.01} />
      <group position={[0, 0.07, -0.22]} rotation={[-1.75, 0, 0]}>
        <Box size={[0.7, 0.05, 0.45]} position={[0, 0.02, 0.22]} color="#5a4028" line={0.01} />
      </group>
      {[-0.22, 0, 0.22].map((x, i) => (
        <Box key={i} size={[0.2, 0.08, 0.38]} position={[x, 0.09 + Math.sin(T * 2 + i) * 0.003, 0]} color="#c8b27a" line={0.007} />
      ))}
    </group>
  );
}

function MiniLetter({tx}: {tx: Tex}) {
  return (
    <mesh>
      <planeGeometry args={[0.2, 0.14]} />
      <meshBasicMaterial map={tx.envelope} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ---------- definição de planos
type Ctx = {T: number; tx: Tex; tx2: Tex2; cam: Cam};
type Shot = {id: string; a: number; b: number; cam: (T: number) => Cam; render: (c: Ctx) => React.ReactNode};

const hotel = (cam: Cam, children: React.ReactNode, tx: Tex) => (
  <>
    <Lights set="hotel" />
    <Room tx={tx} />
    {children}
  </>
);
const SEAT = {A: 0.1, P: 1.3, B: 2.5};
const seatPos = (x: number): V3 => [x, 0.58 - 0.9, -1.0];

const paris = (children: React.ReactNode, tx2: Tex2, scaffold = false) => (
  <>
    <Lights set="paris" />
    <ParisSet tx={tx2} scaffold={scaffold} />
    {children}
  </>
);

const SHOTS: Shot[] = [
  // ===== 0 – 9 s : Paris, 1925 — o comerciante e a "compra"
  {
    id: 'praca-aberta', a: 0, b: 2.1,
    cam: lin(0, 2.1, {p: [-2.6, 2.2, 14], l: [-2.2, 6, -20], fov: 54, roll: 1.2}, {p: [-1.8, 2.0, 12], l: [-1.6, 5.2, -20], fov: 50, roll: -0.5}),
    render: ({T, tx2, cam}) =>
      paris(
        <Actor look={POISSON_CHAPEU} pos={[lerp(-6, -1.4, ramp(T, 0.2, 2.1)), 0, 6.5]} cam={cam.p}
          state={S({expr: 'encantado', look: [0.5, -0.4], turn: 0.3, aR: [30, -10], aL: [-14, 10], lean: 3, bob: Math.abs(Math.sin(T * 7)) * 8, walk: T * 7, blink: bl(T, 0.3)})} />,
        tx2),
  },
  {
    id: 'contrato', a: 2.1, b: 4.8,
    cam: lin(2.1, 4.8, {p: [0.9, 1.5, 6.4], l: [-1.0, 1.55, 3], fov: 38, roll: 2}, {p: [0.2, 1.55, 5.6], l: [-1.1, 1.6, 3], fov: 33, roll: -1}),
    render: ({T, tx2, cam}) =>
      paris(
        <Actor look={POISSON_CHAPEU} pos={[-1.4, 0, 3]} cam={cam.p}
          state={S({expr: 'encantado', look: [0.3, 0], turn: 0.2, blink: bl(T, 0.3), lean: key(T, [[2.1, 0], [4.2, -5], [4.5, 2]]), bob: breathe(T),
            aR: keyv(T, [[2.1, [10, -140]], [4.0, [10, -140]], [4.35, [140, 168]]]) as any, aL: [-14, 10], prop: 'papel', propHand: 'R'})} />,
        tx2),
  },
  {
    id: 'torre-baixo', a: 4.8, b: 6.1,
    cam: lin(4.8, 6.1, {p: [0.5, 0.7, -12], l: [0, 9, -42], fov: 64, roll: 3}, {p: [0.5, 0.9, -14.5], l: [0, 15, -42], fov: 58, roll: 0}),
    render: ({tx2}) => paris(null, tx2),
  },
  {
    id: 'placa-torre', a: 6.1, b: 7.5,
    cam: lin(6.1, 7.5, {p: [1.6, 2.3, -17.0], l: [3.6, 2.2, -24], fov: 38, roll: -3}, {p: [2.6, 2.3, -18.6], l: [3.6, 2.2, -24], fov: 34, roll: -1}),
    render: ({tx2}) => paris(null, tx2),
  },
  {
    id: 'poisson-duvida', a: 7.5, b: 9.0,
    cam: lin(7.5, 9.0, {p: [-2.6, 1.3, 6.2], l: [-1.2, 1.5, 3], fov: 34, roll: -2}, {p: [-2.0, 1.45, 5.4], l: [-1.3, 1.55, 3], fov: 29, roll: 2}),
    render: ({T, tx2, cam}) => {
      const fall = clamp01((T - 8.1) / 0.9);
      return paris(
        <>
          <Actor look={POISSON_CHAPEU} pos={[-1.4, 0, 3]} cam={cam.p}
            state={S({expr: pick(T, [[0, 'encantado'], [7.8, 'surpreso'], [8.4, 'preocupado']] as any), look: [-0.6, 0.6], turn: -0.2, blink: bl(T, 0.3), sweat: ramp(T, 8.2, 8.9), bob: breathe(T),
              aR: keyv(T, [[7.5, [140, 168]], [8.1, [60, 80]], [8.5, [10, 5]]]) as any, aL: keyv(T, [[7.5, [-14, 10]], [8.2, [-60, -90]]]) as any, prop: T < 8.1 ? 'papel' : null, propHand: 'R'})} />
          {T >= 8.1 && <Flat pos={[-1.0 - fall * 0.3, 1.5 - fall * 1.45, 3.2]} size={[0.3, 0.42]} map={tx2.contrato} rotX={-0.5 - fall * 1.2} rotZ={fall * 2.4} />}
        </>,
        tx2);
    },
  },

  // ===== 9 – 27 s : a ideia do golpe
  {
    id: 'lustig-jornal', a: 9.0, b: 10.9,
    cam: lin(9.0, 10.9, {p: [1.0, 1.35, 2.4], l: [1.3, 1.25, -1], fov: 36, roll: -2}, {p: [1.4, 1.3, 1.9], l: [1.3, 1.25, -1], fov: 32, roll: 1}),
    render: ({T, tx, cam}) =>
      hotel(cam, <Actor look={LUSTIG} pos={seatPos(SEAT.P)} cam={cam.p}
        state={S({expr: T < 10.2 ? 'lendo' : 'confiante', look: T < 10.2 ? [0, 0.7] : [0, 0], turn: 0.1, blink: bl(T, 0.5), bob: breathe(T),
          aR: keyv(T, [[9.0, [10, -140]], [10.1, [10, -140]], [10.6, [14, 6]]]) as any, prop: T < 10.4 ? 'jornal' : null, propHand: 'R'})} />, tx),
  },
  {
    id: 'jornal-insert', a: 10.9, b: 13.0,
    cam: lin(10.9, 13.0, {p: [1.1, 1.1, 1.9], l: [1.3, 1.06, 0.1], fov: 38, roll: -1.5}, {p: [1.5, 1.12, 1.55], l: [1.3, 1.08, 0.1], fov: 31, roll: 1}),
    render: ({T, tx, tx2, cam}) => hotel(cam, <HeldPaper T={T} pos={[1.3, 1.1, 0.1]} map={tx2.jornal} size={[0.45, 0.62]} />, tx),
  },
  {
    id: 'autoridades', a: 13.0, b: 15.9,
    cam: lin(13.0, 15.9, {p: [-1.2, 1.2, -10.5], l: [2.0, 5, -33], fov: 56, roll: -3}, {p: [-0.6, 1.4, -12.5], l: [2.2, 6, -33], fov: 52, roll: 1}),
    render: ({T, tx2, cam}) =>
      paris(
        <>
          <Actor look={OFICIAL_A} pos={[-1.6, 0, -16]} cam={cam.p}
            state={S({expr: pick(T, [[0, 'preocupado'], [14.2, 'surpreso'], [15, 'preocupado']] as any), look: [0.7, -0.8], turn: 0.3, blink: bl(T, 0.1), sweat: ramp(T, 13.4, 14.2), bob: breathe(T),
              aR: keyv(T, [[13, [20, 10]], [13.6, [118, 150]], [15, [118, 150]]]) as any})} />
          <Actor look={OFICIAL_B} pos={[0.3, 0, -15.5]} cam={cam.p}
            state={S({expr: 'preocupado', look: [-0.5, -0.4], turn: -0.3, blink: bl(T, 0.9), sweat: ramp(T, 14.3, 15), bob: breathe(T, 1),
              aL: keyv(T, [[13, [-8, -4]], [14, [-8, -4]], [14.5, [-60, -150]]]) as any, aR: [12, 20]})} />
        </>,
        tx2, true),
  },
  {
    id: 'lustig-ideia', a: 15.9, b: 18.66,
    cam: lin(15.9, 18.66, {p: [-0.6, 1.6, 1.8], l: [-1.12, 1.6, 0], fov: 30, roll: -3}, {p: [-0.95, 1.62, 1.2], l: [-1.12, 1.62, 0], fov: 23, roll: 1.5}),
    render: ({T, tx, cam}) =>
      hotel(cam, <Actor look={LUSTIG} pos={[-1.15, 0.045, 0]} cam={cam.p}
        state={S({expr: pick(T, [[0, 'neutro'], [16.4, 'astuto'], [17.7, 'sorriso']] as any), look: keyv(T, [[15.9, [-0.8, 0.2]], [16.8, [0, 0]], [17.8, [0.9, -0.2]]]) as any, turn: key(T, [[15.9, -0.5], [17.8, 0.3]]), blink: bl(T, 0.4),
          browPump: ramp(T, 16.4, 16.6) - ramp(T, 17.4, 17.7), bob: breathe(T), headTilt: key(T, [[15.9, 3], [17.7, -4]])})} />, tx),
  },
  {
    id: 'carimbo-oficial', a: 18.66, b: 21.5,
    cam: lin(18.66, 21.5, {p: [0.0, 1.9, 1.7], l: [0.5, 0.78, 0.05], fov: 40, roll: 3}, {p: [0.3, 1.6, 1.3], l: [0.5, 0.78, 0.05], fov: 36, roll: 1}),
    render: ({T, tx, tx2, cam}) =>
      hotel(cam, (
        <group>
          <Flat pos={[0.5, 0.775, 0.12]} size={[0.62, 0.8]} map={tx.proposta} rotY={-0.16} />
          <StampOn base={[0.5, 0.775, 0.12]} T={T} tHit={19.9} map={tx2.oficial} size={[0.4, 0.18]} markPos={[0.0, 0.003, 0.24]} />
        </group>
      ), tx),
  },
  {
    id: 'correio', a: 21.5, b: 24.0,
    cam: lin(21.5, 24.0, {p: [-1.4, 1.4, 8.6], l: [-2.6, 1.3, 4.2], fov: 38, roll: -2}, {p: [-0.6, 1.5, 8.0], l: [-2.6, 1.6, 4.2], fov: 42, roll: 2}),
    render: ({T, tx, tx2, cam}) =>
      paris(
        <>
          <Actor look={LUSTIG_CHAPEU} pos={[-1.8, 0, 4.7]} cam={cam.p}
            state={S({expr: 'confiante', look: [-0.8, 0.2], turn: -0.5, blink: bl(T, 0.2), bob: breathe(T),
              aR: keyv(T, [[21.5, [60, 90]], [22.0, [-60, -100]], [22.4, [-40, -70]], [23.2, [10, 5]]]) as any, aL: [-10, -6]})} />
          {[0, 1, 2].map((i) => {
            const t0 = 22.1 + i * 0.35;
            const u = clamp01((T - t0) / 1.2);
            if (T < t0) return null;
            return (
              <group key={i} position={[-3 + u * 5 + i * 0.3, 1.5 + Math.sin(u * Math.PI) * 1.2 + u * 1.5, 4.5 - u * 3]} rotation={[0.3 * u, u * 5, u * 7]}>
                <MiniLetter tx={tx} />
              </group>
            );
          })}
        </>,
        tx2),
  },
  {
    id: 'ferro-velho', a: 24.0, b: 25.6,
    cam: lin(24.0, 25.6, {p: [0, 1.5, 6.4], l: [0, 1.6, -8], fov: 50, roll: 1.5}, {p: [0.3, 1.5, 5.4], l: [0, 1.7, -8], fov: 46, roll: -1}),
    render: ({T, tx2, cam}) => (
      <>
        <Lights set="scrap" />
        <ScrapSet tx={tx2} />
        <Actor look={EMPRESARIO_C} pos={[-0.7, 0, 1]} cam={cam.p}
          state={S({expr: pick(T, [[0, 'lendo'], [24.9, 'surpreso']] as any), look: [0, 0.8], blink: bl(T, 0.7), bob: breathe(T), aR: [10, -140], prop: 'papel', propHand: 'R'})} />
        <Actor look={EMPRESARIO_D} pos={[0.8, 0, 1.4]} cam={cam.p}
          state={S({expr: pick(T, [[0, 'lendo'], [25.1, 'encantado']] as any), look: [0, 0.8], blink: bl(T, 1.9), bob: breathe(T, 2), aR: [10, -140], prop: 'papel', propHand: 'R'})} />
      </>
    ),
  },
  {
    id: 'carta-secreta', a: 25.6, b: 27.0,
    cam: lin(25.6, 27.0, {p: [1.1, 1.1, 1.9], l: [1.3, 1.05, 0.1], fov: 38, roll: -2}, {p: [1.5, 1.12, 1.55], l: [1.3, 1.07, 0.1], fov: 31, roll: 1}),
    render: ({T, tx, tx2, cam}) =>
      hotel(cam, (
        <>
          <HeldPaper T={T} pos={[1.3, 1.1, 0.1]} map={tx.proposta} />
          <Flat pos={[1.3, 1.02, 0.12]} rotX={0} rotZ={-0.12} size={[0.34, 0.15]} map={tx2.sigilo} transparent scale={lerp(1.3, 1, ramp(T, 26.2, 26.35))} />
        </>
      ), tx),
  },

  // ===== 27 – 40,45 s : hotel de luxo (inclui o piloto aprovado)
  {
    id: 'hotel-fachada', a: 27.0, b: 28.4,
    cam: lin(27.0, 28.4, {p: [-18, 2.6, 8], l: [-22, 7, -6], fov: 54, roll: 1.5}, {p: [-19, 3.4, 6.5], l: [-22, 8.5, -6], fov: 50, roll: -0.5}),
    render: ({tx2}) => paris(null, tx2),
  },
  {
    id: 'hotel-grua', a: 28.4, b: PILOT_A,
    cam: lin(28.4, PILOT_A, {p: [0.4, 3.4, 8.4], l: [0.5, 2.1, -1], fov: 58, roll: 2.5}, {p: [0.4, 1.4, 6.6], l: [0.42, 1.1, -1], fov: 56, roll: 1.2}),
    render: ({cam, tx}) => <HotelPilot t={0} tx={tx} cam={cam} />,
  },
  {
    id: 'piloto', a: PILOT_A, b: PILOT_B,
    cam: () => ({p: [0, 0, 0], l: [0, 0, 0], fov: 50, roll: 0}),
    render: () => null,
  },

  // ===== 40,45 – 62,5 s : a fraude e o fim
  {
    id: 'poisson-pale', a: PILOT_B, b: 41.7,
    cam: lin(PILOT_B, 41.7, {p: [1.5, 1.32, 0.8], l: [1.3, 1.22, -1], fov: 29, roll: 3}, {p: [1.4, 1.3, 0.55], l: [1.3, 1.22, -1], fov: 25, roll: 1}),
    render: ({T, tx, cam}) =>
      hotel(cam, <Actor look={POISSON} pos={seatPos(SEAT.P)} cam={cam.p}
        state={S({expr: pick(T, [[0, 'surpreso'], [41.3, 'preocupado']] as any), look: [-0.4, 0.8], turn: 0, blink: bl(T, 0.3), sweat: ramp(T, 40.6, 41.4), bob: breathe(T), browPump: ramp(T, 40.9, 41.0),
          aR: [10, -140], aL: [-30, -48], prop: 'papel', propHand: 'R', headTilt: key(T, [[40.45, 0], [41.5, -4]])})} />, tx),
  },
  {
    id: 'carta-fraude', a: 41.7, b: 43.2,
    cam: lin(41.7, 43.2, {p: [1.1, 1.08, 1.9], l: [1.3, 1.05, 0.1], fov: 38, roll: 2}, {p: [1.45, 1.1, 1.55], l: [1.3, 1.06, 0.1], fov: 31, roll: -1}),
    render: ({T, tx, tx2, cam}) =>
      hotel(cam, (
        <>
          <HeldPaper T={T} pos={[1.3, 1.1, 0.1]} map={tx.proposta} />
          {T >= 42.3 && <Flat pos={[1.3, 1.02, 0.12]} rotX={0} rotZ={-0.15} size={[0.42, 0.19]} map={tx2.fraude} transparent scale={lerp(1.4, 1, ramp(T, 42.3, 42.45))} />}
        </>
      ), tx),
  },
  {
    id: 'trem', a: 43.2, b: 44.6,
    cam: lin(43.2, 44.6, {p: [0.5, 1.5, 1.5], l: [0, 1.1, -1.3], fov: 46, roll: 2}, {p: [0.3, 1.45, 1.1], l: [0, 1.15, -1.3], fov: 42, roll: -1}),
    render: ({T, tx2, cam}) => (
      <>
        <Lights set="train" />
        <TrainSet tx={tx2} t={T} />
        <Actor look={LUSTIG_CHAPEU} pos={[0, 0.58 - 0.9, -1.2]} cam={cam.p}
          state={S({expr: 'sorriso', look: [0, 0.8], turn: 0, blink: bl(T, 0.4), bob: breathe(T) + Math.sin(T * 17) * 2, aL: [-40, 20], aR: [40, -20], lean: 3})} />
        <Suitcase T={T} />
      </>
    ),
  },
  {
    id: 'trem-janela', a: 44.6, b: 46.3,
    cam: lin(44.6, 46.3, {p: [0.9, 1.4, 0.7], l: [0.1, 1.35, -1.5], fov: 44, roll: -2}, {p: [0.4, 1.4, 0.5], l: [0.0, 1.35, -1.5], fov: 38, roll: 1}),
    render: ({T, tx2, cam}) => (
      <>
        <Lights set="train" />
        <TrainSet tx={tx2} t={T} />
        <Actor look={LUSTIG_CHAPEU} pos={[0, 0.58 - 0.9, -1.2]} cam={cam.p}
          state={S({expr: pick(T, [[0, 'confiante'], [45.6, 'sorriso']] as any), look: keyv(T, [[44.6, [0.9, 0]], [45.5, [-0.9, -0.2]], [45.9, [0, 0.8]]]) as any, turn: 0.2, blink: bl(T, 0.4), bob: breathe(T) + Math.sin(T * 17) * 2, aL: [-40, 20], aR: [40, -20]})} />
        <Suitcase T={T} />
      </>
    ),
  },
  {
    id: 'delegacia-aberta', a: 46.3, b: 48.3,
    cam: lin(46.3, 48.3, {p: [-4.4, 1.7, 5], l: [-8.6, 2.6, -5], fov: 50, roll: 1.5}, {p: [-5.4, 1.6, 3.4], l: [-8.8, 2.4, -5], fov: 44, roll: -1}),
    render: ({T, tx2, cam}) =>
      paris(
        <Actor look={POISSON_CHAPEU} pos={[lerp(-2, -8.8, ramp(T, 46.4, 47.9)), 0, lerp(4, -3.6, ramp(T, 46.4, 47.9))]} cam={cam.p}
          state={S({expr: 'preocupado', look: [-0.3, -0.4], turn: -0.3, blink: bl(T, 0.3), sweat: ramp(T, 47, 48), lean: 4, bob: T < 47.9 ? Math.abs(Math.sin(T * 6)) * 8 : breathe(T), walk: T < 47.9 ? T * 6 : undefined, aL: [-10, -20], aR: [14, 24]})} />,
        tx2),
  },
  {
    id: 'poisson-vergonha', a: 48.3, b: 50.6,
    cam: lin(48.3, 50.6, {p: [-8.0, 1.6, -1.5], l: [-8.8, 1.6, -3.6], fov: 28, roll: 3}, {p: [-8.4, 1.6, -2.2], l: [-8.8, 1.6, -3.6], fov: 23, roll: 0}),
    render: ({T, tx2, cam}) =>
      paris(
        <Actor look={POISSON_CHAPEU} pos={[-8.8, 0, -3.6]} cam={cam.p}
          state={S({expr: pick(T, [[0, 'preocupado'], [49.5, 'lendo']] as any), look: keyv(T, [[48.3, [-0.2, 0.7]], [49.4, [0.9, 0.6]], [50.2, [0.9, 0.2]]]) as any, turn: key(T, [[48.3, -0.2], [49.9, 0.7]]), blink: bl(T, 0.5), sweat: 0.7 + Math.sin(T * 3) * 0.2, bob: breathe(T) - 4,
            headTilt: key(T, [[48.3, 4], [50.0, 10]]), aL: [-20, -50], aR: [20, 50]})} />,
        tx2),
  },
  {
    id: 'livro-vazio', a: 50.6, b: 53.0,
    cam: lin(50.6, 53.0, {p: [0.4, 1.95, 1.55], l: [0.5, 0.78, 0.1], fov: 40, roll: -2}, {p: [0.55, 1.7, 1.2], l: [0.5, 0.78, 0.1], fov: 34, roll: 1}),
    render: ({T, tx, tx2, cam}) =>
      hotel(cam, (
        <group>
          <Flat pos={[0.5, 0.775, 0.12]} size={[0.6, 0.82]} map={tx2.livro} rotY={0.1} />
          <Box size={[0.02, 0.02, 0.22]} position={[0.62, 0.79, 0.3]} color="#2a1a14" line={0.004} />
        </group>
      ), tx),
  },
  {
    id: 'lustig-volta', a: 53.0, b: 54.6,
    cam: lin(53.0, 54.6, {p: [5.5, 1.5, 4.2], l: [9.0, 1.7, -5.5], fov: 44, roll: 2}, {p: [3.0, 1.5, 6.0], l: [6.0, 1.7, -1], fov: 40, roll: -1}),
    render: ({T, tx2, cam}) => {
      const u = ramp(T, 53.0, 54.6);
      return paris(
        <Actor look={LUSTIG_CHAPEU} pos={[lerp(10.2, 5.2, u), 0, lerp(-6.0, 1.5, u)]} cam={cam.p}
          state={S({expr: 'confiante', look: [0, 0], turn: -0.3, blink: bl(T, 0.4), bob: Math.abs(Math.sin(T * 7)) * 9, walk: T * 7, lean: 4, aL: [-10, -4], aR: [20, 10]})} />,
        tx2);
    },
  },
  {
    id: 'paris-de-novo', a: 54.6, b: 56.2,
    cam: lin(54.6, 56.2, {p: [0, 2.4, 14], l: [1.5, 6, -40], fov: 54, roll: -1.5}, {p: [0.8, 2.2, 12.5], l: [1.5, 7, -40], fov: 52, roll: 1}),
    render: ({T, tx2, cam}) =>
      paris(
        <Actor look={LUSTIG_CHAPEU} pos={[lerp(5.2, 1.0, ramp(T, 54.6, 56.2)), 0, 5.5]} cam={cam.p}
          state={S({expr: 'confiante', turn: -0.5, blink: bl(T, 0.4), bob: Math.abs(Math.sin(T * 7)) * 9, walk: T * 7, lean: 4, aL: [-10, -4], aR: [20, 10], look: [-0.5, -0.3]})} />,
        tx2),
  },
  {
    id: 'novo-golpe', a: 56.2, b: 58.2,
    cam: lin(56.2, 58.2, {p: [-0.2, 1.5, 6.4], l: [0.4, 1.25, -1], fov: 52, roll: -1.5}, {p: [0.3, 1.45, 5.0], l: [0.6, 1.3, -1], fov: 46, roll: 1}),
    render: ({T, tx, cam}) =>
      hotel(cam, (
        <>
          <Actor look={LUSTIG} pos={[-1.15, 0.045, 0]} cam={cam.p}
            state={S({expr: 'confiante', look: [0.9, 0], turn: 0.6, blink: bl(T, 0.4), bob: breathe(T), aR: keyv(T, [[56.2, [10, 6]], [56.8, [112, 132]]]) as any, aL: [-40, 30], lean: -4})} />
          <Actor look={EMPRESARIO_A} pos={seatPos(SEAT.A)} cam={cam.p} state={S({expr: 'surpreso', look: [-0.8, 0], turn: -0.4, blink: bl(T, 1.1), bob: breathe(T, 1), aL: [-18, -30], aR: [20, 30]})} />
          <Actor look={EMPRESARIO_C} pos={seatPos(SEAT.P)} cam={cam.p} state={S({expr: 'astuto', look: [-0.8, 0], turn: -0.3, blink: bl(T, 0.2), bob: breathe(T, 2), aL: [-18, -30], aR: [20, 30]})} />
          <Actor look={EMPRESARIO_D} pos={seatPos(SEAT.B)} cam={cam.p} state={S({expr: 'neutro', look: [-0.8, 0], turn: -0.5, blink: bl(T, 2), bob: breathe(T, 3), aL: [-14, -26], aR: [14, 22]})} />
        </>
      ), tx),
  },
  {
    id: 'tentativa', a: 58.2, b: 60.06,
    cam: lin(58.2, 60.06, {p: [0.1, 1.95, 1.6], l: [0.5, 0.78, 0.05], fov: 40, roll: -3}, {p: [0.35, 1.65, 1.25], l: [0.52, 0.78, 0.05], fov: 36, roll: -1}),
    render: ({T, tx, cam}) =>
      hotel(cam, (
        <group>
          <Flat pos={[0.5, 0.775, 0.12]} size={[1.0, 0.72]} map={tx.planta} rotY={-0.16} />
          <StampOn base={[0.5, 0.775, 0.12]} T={T} tHit={59.45} map={tx.carimbo} size={[0.36, 0.18]} markPos={[0.08, 0.003, -0.02]} />
        </group>
      ), tx),
  },
  {
    id: 'furia', a: 60.06, b: 61.4,
    cam: lin(60.06, 61.4, {p: [1.9, 1.4, 3.6], l: [0.7, 1.2, -1], fov: 44, roll: 3}, {p: [1.5, 1.4, 3.1], l: [0.4, 1.2, -1], fov: 40, roll: -1}),
    render: ({T, tx, tx2, cam}) => {
      const rise = ramp(T, 60.1, 60.45);
      const slam = key(T, [[60.3, 0], [60.5, 18], [60.7, 0]]);
      return hotel(cam, (
        <>
          <Actor look={LUSTIG} pos={[-1.15, 0.045, 0]} cam={cam.p}
            state={S({expr: 'preocupado', look: [0.9, 0.2], turn: 0.5, blink: bl(T, 0.4), sweat: ramp(T, 60.2, 60.7), bob: breathe(T), aL: [-60, -80], aR: [60, 80], lean: -6})} />
          <Actor look={EMPRESARIO_C} pos={[SEAT.P, 0.58 - 0.9 + rise * 0.3, -1.0]} cam={cam.p}
            state={S({expr: 'bravo', look: [-0.9, 0.1], turn: -0.5, blink: 0, bob: slam * -1, browPump: -0.4, aL: [-20 - slam, -10], aR: keyv(T, [[60.06, [20, 30]], [60.4, [95, 105]]]) as any, lean: -6 * rise})} />
          <Actor look={EMPRESARIO_D} pos={seatPos(SEAT.B)} cam={cam.p} state={S({expr: 'surpreso', look: [0, 0], turn: -0.5, blink: bl(T, 2), bob: breathe(T, 3), aL: [-14, -26], aR: [14, 22]})} />
          <Flat pos={[lerp(1.0, -0.2, outCubic((T - 60.4) / 0.5)), 0.78, 0.15]} size={[0.6, 0.8]} map={tx.proposta} rotY={0.4} />
          {T >= 60.7 && <Flat pos={[-0.2, 0.785, 0.15]} size={[0.4, 0.2]} map={tx2.falso} transparent rotY={0.4} />}
        </>
      ), tx);
    },
  },
  {
    id: 'torre-final', a: 61.4, b: FILM_LEN,
    cam: lin(61.4, FILM_LEN, {p: [0.2, 1.7, -17.2], l: [1.0, 6, -42], fov: 56, roll: 1.5}, {p: [0.6, 1.8, -18.6], l: [1.0, 12, -42], fov: 54, roll: -1}),
    render: ({tx2}) => paris(null, tx2),
  },
];

const PARIS_IDS = ['praca-aberta', 'contrato', 'torre-baixo', 'placa-torre', 'poisson-duvida', 'autoridades', 'correio', 'hotel-fachada', 'delegacia-aberta', 'poisson-vergonha', 'lustig-volta', 'paris-de-novo', 'torre-final'];
const lightFor = (id: string) => (PARIS_IDS.includes(id) ? LIGHT_DUSK : id === 'ferro-velho' ? LIGHT_DAY : id.startsWith('trem') ? LIGHT_TRAIN : LIGHT_HOTEL);

export const shotFor = (T: number) => SHOTS.find((s) => T >= s.a && T < s.b) ?? SHOTS[SHOTS.length - 1];

function camFor(T: number): Cam {
  const s = shotFor(T);
  if (s.id === 'piloto') {
    // câmera do piloto aprovado (tempo local t = T - 29,95)
    return camAt(T - PILOT_A);
  }
  return s.cam(T);
}

// ---------- títulos em português + acabamento
function Titles({T}: {T: number}) {
  const items: {a: number; b: number; l1: string; l2: string}[] = [
    {a: 0.15, b: 2.1, l1: 'Paris', l2: '1925'},
    {a: 27.15, b: 29.7, l1: 'Hotel de luxo', l2: 'Paris · 1925'},
    {a: 54.7, b: 56.1, l1: 'Algum tempo depois', l2: 'Paris'},
  ];
  const it = items.find((i) => T >= i.a && T < i.b);
  if (!it) return null;
  const a = Math.min(1, (T - it.a) / 0.2) * (1 - ramp(T, it.b - 0.3, it.b));
  return (
    <div style={{position: 'absolute', left: 48, bottom: 150, opacity: a, color: '#f6ecd2', fontFamily: '"Playfair Display", serif', textShadow: '0 2px 8px rgba(10,4,16,0.85)'}}>
      <div style={{width: 56, height: 4, background: '#d9b45a', marginBottom: 14}} />
      <div style={{fontSize: 44, fontWeight: 700, letterSpacing: 1}}>{it.l1}</div>
      <div style={{fontSize: 30, opacity: 0.9, marginTop: 4}}>{it.l2}</div>
    </div>
  );
}

function Grade({T}: {T: number}) {
  const fadeOut = ramp(T, FILM_LEN - 0.4, FILM_LEN);
  return (
    <>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 44%, rgba(0,0,0,0) 38%, rgba(6,4,22,0.82) 100%)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(110,120,200,0.16), rgba(70,40,120,0.10))', mixBlendMode: 'multiply'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 60%, rgba(255,170,90,0.07), rgba(0,0,0,0) 65%)', mixBlendMode: 'screen'}} />
      <Titles T={T} />
      <AbsoluteFill style={{background: '#0d0814', opacity: fadeOut}} />
    </>
  );
}

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const T = frame / FPS;
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('fontes'));
  useEffect(() => {
    Promise.all([loadPlayfair('normal', {weights: ['400', '700'], subsets: ['latin', 'latin-ext']}).waitUntilDone(), loadElite('normal', {subsets: ['latin']}).waitUntilDone()]).then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);
  const tx = useMemo<Tex | null>(() => (ready ? makeTextures() : null), [ready]);
  const tx2 = useMemo<Tex2 | null>(() => (ready ? makeTextures2() : null), [ready]);
  if (!tx || !tx2) return <AbsoluteFill style={{background: '#1b1220'}} />;
  const shot = shotFor(T);
  const cam = camFor(T);
  return (
    <AbsoluteFill style={{background: '#150f1c'}}>
      <ThreeCanvas width={720} height={1280} camera={{position: cam.p, fov: cam.fov}} gl={{antialias: true, toneMapping: THREE.NoToneMapping}} style={{background: '#150f1c'}}>
        <Rig cam={cam} />
        <LightCtx.Provider value={lightFor(shot.id)}>
          {shot.id === 'piloto' ? <HotelPilot t={T - PILOT_A} tx={tx} cam={cam} /> : shot.render({T, tx, tx2, cam})}
        </LightCtx.Provider>
        <Dust T={T} cam={cam} />
      </ThreeCanvas>
      <Grade T={T} />
    </AbsoluteFill>
  );
};
