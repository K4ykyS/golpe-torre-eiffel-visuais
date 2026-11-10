// Vídeo "O alemão do Airbnb": cenário do apartamento, elenco e planos. Tempos em segundos globais da narração.
import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {loadFont as loadPlayfair} from '@remotion/google-fonts/PlayfairDisplay';
import {loadFont as loadElite} from '@remotion/google-fonts/SpecialElite';
import {Billboard, Box, Cyl} from './kit';
import {drawCharacter2, DW2, DH2, Light} from './toon2';
import {Look, State} from './toon';
import {Rig} from './Pilot';
import {Dust, Glow} from './Film';
import {Cam, FPS, blink, glide, key, keyv, lerp, pick, ramp, sm} from './story';
import {Tex3, makeTextures3} from './paint3';
import PALAVRAS from '../voz/palavras-airbnb.json';

export const AIRBNB_LEN = 83.1478;
export const AIRBNB_FRAMES = Math.ceil(AIRBNB_LEN * FPS);

type V3 = [number, number, number];
const SCALE = 2.0;
const CARD_H = 1.8;
const HIP_UP = 0.302; // centro do cartão acima do quadril

export const LIGHT_QUARTO: Light = {key: '#ffc070', keyAmt: 0.24, from: [-0.5, -1], amb: '#26306a', ambAmt: 0.22};

// ---------- elenco
export const PROTAGONISTA: Look = {
  skin: '#b98258', hair: '#1c1418', suit: '#8d93a8', suitDark: '#6f7589', shirt: '#8d93a8', tie: '#8d93a8', trousers: '#3b3f55',
  build: 1.0, mustache: 'nenhuma', hairStyle: 'liso', casual: 'camiseta',
};
export const KLAUS: Look = {
  skin: '#f3c3a0', hair: '#e6c258', suit: '#c9b98a', suitDark: '#a8975f', shirt: '#f4f0e2', tie: '#c9b98a', vest: '#9aa77a',
  trousers: '#7a6a45', build: 1.08, mustache: 'nenhuma', hairStyle: 'liso', casual: 'colete', strap: true, hat: 'bucket',
};

const S = (o: Partial<State> = {}): State => ({expr: 'neutro', look: [0, 0], turn: 0, blink: 0, aL: [-8, -4], aR: [8, 4], lean: 0, bob: 0, ...o});

// boca falando: abre e fecha dentro de cada palavra da narração
const WORDS = PALAVRAS as {w: string; s: number; e: number}[];
export function talk(T: number, from: number, to: number): number {
  for (let i = 0; i < WORDS.length; i++) {
    const w = WORDS[i];
    if (w.s < from - 0.02 || w.e > to + 0.02) continue;
    if (T >= w.s - 0.03 && T <= w.e) return 0.3 + 0.7 * Math.abs(Math.sin(T * 17 + i * 1.7));
  }
  return 0;
}

// ---------- ator: cartão 2D com pivô no quadril (permite deitar e sentar)
function useCanvas() {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = DW2 * SCALE;
    c.height = DH2 * SCALE;
    return c;
  }, []);
}
const yawTo = (cam: V3, p: V3) => Math.atan2(cam[0] - p[0], cam[2] - p[2]);

function Person({look, state, hip, cam, roll = 0, flip = false}: {look: Look; state: State; hip: V3; cam: V3; roll?: number; flip?: boolean}) {
  const canvas = useCanvas();
  const ctx = canvas.getContext('2d')!;
  drawCharacter2(ctx, look, state, SCALE, LIGHT_QUARTO);
  return (
    <group position={hip} rotation={[0, 0, roll]}>
      <Billboard canvas={canvas} position={[0, HIP_UP, 0]} height={CARD_H * 1.2} yaw={yawTo(cam, hip)} flip={flip} tint="#ffffff" />
    </group>
  );
}

// ---------- cenário: quarto
const BED_Z = -2.45;
export const PROT_HIP: V3 = [-1.5, 0.82, BED_Z];
export const KLAUS_HIP: V3 = [-0.6, 0.5, -1.78];

function Quarto({tx, T}: {tx: Tex3; T: number}) {
  return (
    <group>
      {/* piso, paredes, teto */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.5]}>
        <planeGeometry args={[14, 10]} />
        <meshToonMaterial map={tx.piso} />
      </mesh>
      <mesh position={[0, 1.5, -3]}>
        <planeGeometry args={[14, 3]} />
        <meshToonMaterial map={tx.parede} />
      </mesh>
      <mesh position={[-3.4, 1.5, -0.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 3]} />
        <meshToonMaterial map={tx.parede} />
      </mesh>
      <mesh position={[4.6, 1.5, -0.5]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[10, 3]} />
        <meshToonMaterial map={tx.parede} />
      </mesh>
      <mesh position={[0, 3, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 10]} />
        <meshToonMaterial color="#d9d2bc" />
      </mesh>
      <Box size={[14, 0.16, 0.06]} position={[0, 0.08, -2.97]} color="#efe9d6" noInk />

      {/* janela com persiana + raios de sol */}
      <group position={[-1.35, 1.85, -2.98]}>
        <mesh>
          <planeGeometry args={[1.0, 1.5]} />
          <meshBasicMaterial map={tx.janela} />
        </mesh>
        <Box size={[1.2, 0.1, 0.08]} position={[0, 0.8, 0.03]} color="#e9e4d4" />
        <Box size={[1.2, 0.1, 0.12]} position={[0, -0.8, 0.05]} color="#e9e4d4" />
        <Box size={[0.1, 1.7, 0.08]} position={[-0.55, 0, 0.03]} color="#e9e4d4" />
        <Box size={[0.1, 1.7, 0.08]} position={[0.55, 0, 0.03]} color="#e9e4d4" />
      </group>
      <mesh position={[-1.0, 0.95, -2.96]}>
        <planeGeometry args={[2.0, 1.5]} />
        <meshBasicMaterial map={tx.raios} transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* cama */}
      <Box size={[2.8, 0.3, 1.15]} position={[-1.3, 0.15, BED_Z]} color="#7a5232" />
      <Box size={[0.14, 1.0, 1.2]} position={[-2.75, 0.6, BED_Z]} color="#6a4528" />
      <Box size={[2.7, 0.26, 1.1]} position={[-1.3, 0.41, BED_Z]} color="#e4e0ee" />
      <Box size={[0.55, 0.14, 0.6]} position={[-2.3, 0.62, BED_Z]} color="#f4f2fa" />
      {/* edredom sobre o protagonista */}
      <Box size={[1.5, 0.5, 1.0]} position={[-1.1, 0.79, BED_Z]} color="#4a78b8" />
      <Box size={[1.52, 0.1, 1.02]} position={[-1.1, 1.04, BED_Z]} color="#e4e0ee" noInk />

      {/* criado-mudo, despertador, abajur */}
      <Box size={[0.6, 0.6, 0.5]} position={[0.5, 0.3, -2.6]} color="#8a5a3a" />
      <Box size={[0.32, 0.17, 0.14]} position={[0.42, 0.685, -2.55]} color="#d8d4c8" />
      <mesh position={[0.42, 0.685, -2.478]}>
        <planeGeometry args={[0.26, 0.11]} />
        <meshBasicMaterial map={tx.relogio} />
      </mesh>
      <Cyl r={0.05} h={0.3} position={[0.64, 0.75, -2.65]} color="#c9a65a" />
      <Cyl r={0.1} rb={0.16} h={0.2} position={[0.64, 1.0, -2.65]} color="#ffd890" emissive="#ffc070" />

      {/* bandeira do Brasil na parede */}
      <mesh position={[0.25, 1.75, -2.97]}>
        <planeGeometry args={[0.8, 0.56]} />
        <meshBasicMaterial map={tx.bandeira} />
      </mesh>

      {/* guarda-roupa */}
      <Box size={[1.5, 2.35, 0.7]} position={[2.1, 1.175, -2.62]} color="#8d6a48" />
      <Box size={[0.03, 2.2, 0.04]} position={[2.1, 1.175, -2.26]} color="#5a3a22" noInk />
      <Cyl r={0.025} h={0.1} position={[2.05, 1.2, -2.22]} color="#d9b45a" noInk />
      <Cyl r={0.025} h={0.1} position={[2.15, 1.2, -2.22]} color="#d9b45a" noInk />

      {/* mochila e chinelos do hóspede */}
      <Box size={[0.55, 0.75, 0.38]} position={[0.55, 0.375, -1.3]} color="#2f6b4a" />
      <Box size={[0.4, 0.3, 0.1]} position={[0.55, 0.28, -1.08]} color="#255a3e" />
      <Box size={[0.22, 0.04, 0.09]} position={[-0.1, 0.02, -1.4]} color="#d9382c" noInk />
      <Box size={[0.22, 0.04, 0.09]} position={[0.2, 0.02, -1.45]} color="#d9382c" noInk />

    </group>
  );
}

function Luz() {
  return (
    <>
      <color attach="background" args={['#1d1b34']} />
      <fog attach="fog" args={['#3a3050', 9, 22]} />
      <ambientLight intensity={0.7} color="#a9b4ee" />
      <hemisphereLight args={['#ffe0a8', '#2a2a58', 0.5]} />
      <pointLight position={[-1.3, 2.1, -1.8]} intensity={9} distance={8} color="#ffd48a" />
      <pointLight position={[0.64, 1.1, -2.2]} intensity={7} distance={4} color="#ffc070" />
      <directionalLight position={[2, 3, 6]} intensity={0.55} color="#d8d8ff" />
      <Glow pos={[-1.35, 1.85, -2.9]} size={3.0} color="#ffd88a" amt={0.22} />
      <Glow pos={[0.64, 1.0, -2.5]} size={1.3} color="#ffc880" amt={0.8} />
    </>
  );
}

// ---------- planos (piloto: 0 a 11,2 s)
type Shot = {id: string; a: number; b: number; cam: (T: number) => Cam};
const pushCam = (a: number, b: number, f: Cam, t: Cam) => (T: number): Cam => {
  const u = glide((T - a) / (b - a));
  const m = (x: number[], y: number[]) => x.map((v, i) => lerp(v, y[i], u));
  return {p: m(f.p, t.p) as V3, l: m(f.l, t.l) as V3, fov: lerp(f.fov, t.fov, u), roll: lerp(f.roll, t.roll, u)};
};

export const SHOTS: Shot[] = [
  {id: 'quarto', a: 0, b: 1.12, cam: pushCam(0, 1.12, {p: [1.0, 1.15, 2.5], l: [-1.3, 1.05, -2.4], fov: 52, roll: 1.5}, {p: [0.8, 1.15, 2.2], l: [-1.3, 1.05, -2.4], fov: 50, roll: 0.5})},
  {id: 'klaus-camera', a: 1.12, b: 2.1, cam: pushCam(1.12, 2.1, {p: [0.4, 1.35, 0.5], l: [-0.65, 1.3, -1.9], fov: 32, roll: -2}, {p: [0.2, 1.35, 0.3], l: [-0.65, 1.3, -1.9], fov: 29, roll: -1})},
  {id: 'dois', a: 2.1, b: 3.02, cam: pushCam(2.1, 3.02, {p: [0.9, 1.35, 2.6], l: [-1.0, 1.2, -2.4], fov: 46, roll: -1.5}, {p: [0.7, 1.35, 2.3], l: [-1.0, 1.2, -2.4], fov: 43, roll: -0.5})},
  {id: 'lente', a: 3.02, b: 3.72, cam: pushCam(3.02, 3.72, {p: [-0.2, 1.3, -0.1], l: [-0.85, 1.2, -1.9], fov: 28, roll: 2}, {p: [-0.35, 1.28, -0.4], l: [-0.85, 1.2, -1.9], fov: 24, roll: 1})},
  {id: 'ele-acordado', a: 3.72, b: 5.16, cam: pushCam(3.72, 5.16, {p: [-0.7, 1.6, 0.6], l: [-1.5, 1.52, -2.45], fov: 27, roll: 1.5}, {p: [-0.9, 1.58, 0.3], l: [-1.5, 1.52, -2.45], fov: 23, roll: 0.5})},
  {id: 'klaus-olha', a: 5.16, b: 7.42, cam: pushCam(5.16, 7.42, {p: [-0.1, 1.3, 1.0], l: [-0.65, 1.3, -1.9], fov: 36, roll: -1}, {p: [-0.3, 1.32, 0.5], l: [-0.65, 1.32, -1.9], fov: 31, roll: 1})},
  {id: 'pergunta', a: 7.42, b: 9.3, cam: pushCam(7.42, 9.3, {p: [-0.35, 1.36, 0.2], l: [-0.65, 1.36, -1.9], fov: 24, roll: 1}, {p: [-0.5, 1.38, -0.2], l: [-0.65, 1.38, -1.9], fov: 19, roll: -1})},
  {id: 'dois-lado', a: 9.3, b: 10.4, cam: pushCam(9.3, 10.4, {p: [1.9, 1.25, 1.3], l: [-1.0, 1.25, -2.2], fov: 42, roll: -2}, {p: [1.6, 1.25, 1.0], l: [-1.0, 1.25, -2.2], fov: 39, roll: 0})},
  {id: 'reacao', a: 10.4, b: 99, cam: pushCam(10.4, 11.3, {p: [-0.95, 1.6, 0.4], l: [-1.5, 1.52, -2.45], fov: 25, roll: 1}, {p: [-1.1, 1.58, 0.1], l: [-1.5, 1.52, -2.45], fov: 21, roll: -1})},
];
export const shotAt = (T: number) => SHOTS.find((s) => T >= s.a && T < s.b) ?? SHOTS[SHOTS.length - 1];

// ---------- atores no tempo global T
function Cena({T, cam, tx}: {T: number; cam: Cam; tx: Tex3}) {
  const bl = (s: number, p = 2.6) => blink(T, s, p);
  const wake = ramp(T, 0.35, 0.8);
  const sitting = ramp(T, 2.0, 2.7);
  const roll = lerp(1.45, 0, sitting);

  const prot: State = S({
    expr: pick(T, [[0, 'neutro'], [0.8, 'neutro'], [1.15, 'surpreso'], [2.3, 'preocupado'], [3.4, 'neutro'], [4.3, 'neutro'], [10.4, 'surpreso']] as any),
    look: keyv(T, [[0, [0, 0]], [0.9, [0, 0.2]], [1.2, [0, 1]], [2.0, [0, 1]], [2.8, [0.9, 0.4]], [3.7, [0.9, 0.4]], [4.4, [0.7, 0.2]], [10.4, [0.9, 0.3]]]) as any,
    blink: Math.max(1 - wake, bl(0.7, 3.1)) * (T < 0.9 ? 1 : 1),
    turn: 0.3,
    aL: keyv(T, [[0, [-10, -4]], [2.0, [-10, -4]], [2.6, [-38, 24]]]) as any,
    aR: keyv(T, [[0, [12, 6]], [2.0, [12, 6]], [2.6, [40, -20]]]) as any,
    lean: key(T, [[0, 0], [2.0, 0], [2.4, -6], [2.9, 0]]),
    bob: Math.sin(T * 2) * 2 + (T < 0.8 ? Math.sin(T * 3) * 3 : 0),
    sweat: ramp(T, 10.45, 10.8),
    browPump: ramp(T, 10.4, 10.55) * 0.8,
    headTilt: key(T, [[0, 0], [2.5, -3], [3.7, 4], [4.4, 0], [10.4, 0]]),
  });

  const flash1 = Math.exp(-Math.max(0, T - 3.45) * 12) * (T >= 3.45 ? 1 : 0);
  const lowering = ramp(T, 5.0, 5.6);
  const klaus: State = S({
    expr: pick(T, [[0, 'sorriso'], [3.0, 'encantado'], [3.9, 'sorriso'], [10.4, 'sorriso']] as any),
    look: keyv(T, [[0, [0.9, 0.5]], [2.4, [0.9, 0.5]], [3.7, [0.9, 0.5]], [5.2, [0.9, 0.5]], [5.5, [0, 0]], [9.0, [0, 0]], [10.4, [-0.3, 0]]]) as any,
    blink: bl(0.5, 3.3),
    turn: key(T, [[0, 0.5], [5.0, 0.5], [5.6, 0.1], [10.4, 0.1]]),
    talk: talk(T, 8.3, 8.8) || talk(T, 9.3, 10.9),
    aR: keyv(T, [[0, [70, -128]], [5.0, [70, -128]], [5.6, [30, 20]], [10.4, [30, 20]]]) as any,
    aL: keyv(T, [[0, [-60, 105]], [5.0, [-60, 105]], [5.6, [-14, -6]], [10.4, [-14, -6]]]) as any,
    lean: key(T, [[0, 0], [3.4, -3], [3.5, -5], [5.6, 2]]),
    bob: Math.sin(T * 2.2 + 1) * 2 - flash1 * 4,
    seated: true,
    prop: lowering < 1 ? 'camera' : null,
    propHand: 'R',
    headTilt: key(T, [[0, 0], [5.6, 0], [7.4, -5], [8.3, -6], [10.4, -6]]),
    browPump: ramp(T, 3.4, 3.5) * 0.6 + ramp(T, 8.3, 8.4) * 0.7 - ramp(T, 8.9, 9.1) * 0.7,
  });

  return (
    <>
      <Quarto tx={tx} T={T} />
      <Person look={PROTAGONISTA} state={prot} hip={PROT_HIP} cam={cam.p} roll={roll} />
      <Person look={KLAUS} state={klaus} hip={KLAUS_HIP} cam={cam.p} flip />
    </>
  );
}

// ---------- acabamento
function Grade({T}: {T: number}) {
  const f1 = T >= 3.45 ? Math.exp(-(T - 3.45) * 9) : 0;
  const f2 = T >= 4.2 ? Math.exp(-(T - 4.2) * 9) : 0;
  const flash = Math.min(1, f1 * 0.95 + f2 * 0.95);
  return (
    <>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 44%, rgba(0,0,0,0) 40%, rgba(6,4,22,0.78) 100%)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(110,120,200,0.14), rgba(70,40,120,0.08))', mixBlendMode: 'multiply'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%, rgba(255,200,110,0.10), rgba(0,0,0,0) 65%)', mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{background: '#fffbe8', opacity: flash}} />
    </>
  );
}

export const Airbnb: React.FC = () => {
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
  const tx = useMemo<Tex3 | null>(() => (ready ? makeTextures3() : null), [ready]);
  if (!tx) return <AbsoluteFill style={{background: '#1b1220'}} />;
  const cam = shotAt(T).cam(T);
  return (
    <AbsoluteFill style={{background: '#150f1c'}}>
      <ThreeCanvas width={720} height={1280} camera={{position: cam.p, fov: cam.fov}} gl={{antialias: true, toneMapping: THREE.NoToneMapping}} style={{background: '#150f1c'}}>
        <Rig cam={cam} />
        <Luz />
        <Cena T={T} cam={cam} tx={tx} />
        <Dust T={T} cam={cam} />
      </ThreeCanvas>
      <Grade T={T} />
    </AbsoluteFill>
  );
};
