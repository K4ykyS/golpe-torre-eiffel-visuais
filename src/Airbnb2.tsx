// "O alemão do Airbnb", de 12 s ao fim: sala, mãe, noite, partida e a cobrança. Tempos em segundos globais.
import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import * as THREE from 'three';
import {Box, Cyl} from './kit';
import {drawCharacter2, DW2, DH2, Light, LIGHT_DAY} from './toon2';
import {Look, State} from './toon';
import {Glow} from './Film';
import {Cam, blink, glide, key, keyv, lerp, pick, ramp} from './story';
import {Tex3} from './paint3';
import {KLAUS, LIGHT_QUARTO, PROTAGONISTA, Person, Quarto, S, talk} from './Airbnb';

type V3 = [number, number, number];
type Shot = {id: string; a: number; b: number; cam: (T: number) => Cam};

export const MAE: Look = {
  skin: '#c48a62', hair: '#3a2420', suit: '#c4587a', suitDark: '#9a3e5c', shirt: '#c4587a', tie: '#c4587a', trousers: '#5a3a5a',
  build: 1.12, mustache: 'nenhuma', hairStyle: 'coque', casual: 'camiseta', earrings: true,
};
const LIGHT_NOITE: Light = {key: '#8aa0ff', keyAmt: 0.12, from: [-0.5, -1], amb: '#141a4a', ambAmt: 0.42};
const LIGHT_SALA: Light = {key: '#ffc890', keyAmt: 0.2, from: [0.5, -1], amb: '#26306a', ambAmt: 0.2};

const NIGHT_A = 61.2;
const NIGHT_B = 65.5;
export const isNight = (T: number) => (T >= NIGHT_A && T < NIGHT_B ? 1 : 0);

// ---------- câmera
const pc = (a: number, b: number, f: Cam, t: Cam) => (T: number): Cam => {
  const u = glide((T - a) / (b - a));
  const m = (x: number[], y: number[]) => x.map((v, i) => lerp(v, y[i], u));
  return {p: m(f.p, t.p) as V3, l: m(f.l, t.l) as V3, fov: lerp(f.fov, t.fov, u), roll: lerp(f.roll, t.roll, u)};
};
// close num rosto (h = centro da cabeça), com um pouco de peito
const cl = (a: number, b: number, h: V3, d0 = 1.9, fov0 = 26, dx = 0.25, roll = 1): Shot['cam'] => {
  const d = d0 * 1.35, fov = fov0 + 4;
  const l: V3 = [h[0], h[1] - 0.1, h[2]];
  return pc(a, b, {p: [h[0] + dx, h[1] - 0.05, h[2] + d], l, fov, roll}, {p: [h[0] + dx * 0.5, h[1] - 0.06, h[2] + d * 0.86], l, fov: fov * 0.9, roll: -roll});
};
const wd = (a: number, b: number, p: V3, l: V3, fov = 46, dp: V3 = [-0.2, 0, -0.3], roll = 1): Shot['cam'] =>
  pc(a, b, {p, l, fov, roll}, {p: [p[0] + dp[0], p[1] + dp[1], p[2] + dp[2]], l, fov: fov * 0.94, roll: -roll});

const head = (hip: V3): V3 => [hip[0], hip[1] + 0.83, hip[2]];

// ---------- posições
// quarto (cópias de Airbnb.tsx: importar valores aqui cria ciclo na carga)
const PROT_HIP: V3 = [-1.5, 0.82, -2.45];
const KLAUS_HIP: V3 = [-0.6, 0.5, -1.78];
const Q_MAE: V3 = [1.05, 0.55, -1.45];
const Q_PROT_PE: V3 = [1.15, 0.55, -1.3];
const Q_KLAUS_DEITA: V3 = PROT_HIP;
// sala
const SOFA_Z = -2.25;
const S_PROT_SOFA: V3 = [-0.75, 0.5, SOFA_Z + 0.1];
const S_KLAUS_FOTO: V3 = [1.9, 0.55, -1.1];
const S_DOOR_BATH: V3 = [-2.45, 0.55, -2.4];
const S_DOOR_FRONT: V3 = [2.75, 0.55, -2.4];
const S_MAE_SALA: V3 = [0.55, 0.55, -1.55];

// ---------- planos 12 → fim
export const SHOTS2: Shot[] = [
  {id: 'caraiu-dois', a: 12.0, b: 15.0, cam: wd(12.0, 15.0, [1.1, 1.3, 2.3], [-1.0, 1.25, -2.2], 44)},
  {id: 'mae-aparece', a: 15.0, b: 17.4, cam: wd(15.0, 17.4, [0.2, 1.3, 2.8], [0.3, 1.15, -2.0], 50, [0.1, 0, -0.4])},
  {id: 'mae-filho', a: 17.4, b: 19.4, cam: cl(17.4, 19.4, head(Q_MAE), 1.9, 27, -0.3)},
  {id: 'klaus-acena', a: 19.4, b: 20.6, cam: cl(19.4, 20.6, head(KLAUS_HIP), 1.8, 27, 0.3)},
  {id: 'mae-airbnb', a: 20.6, b: 22.0, cam: cl(20.6, 22.0, head(Q_MAE), 1.7, 25, -0.2, -1)},
  {id: 'ah-pronto', a: 22.0, b: 23.4, cam: cl(22.0, 23.4, head(PROT_HIP), 1.7, 24, -0.3)},
  {id: 'hospede', a: 23.4, b: 26.1, cam: wd(23.4, 26.1, [1.0, 1.4, 2.9], [0.3, 1.0, -2.0], 54)},
  {id: 'pacote', a: 26.1, b: 28.6, cam: cl(26.1, 28.6, head(KLAUS_HIP), 1.9, 28, 0.35)},
  {id: 'dia-na-vida', a: 28.6, b: 31.4, cam: wd(28.6, 31.4, [1.6, 1.35, 1.6], [-0.4, 1.2, -1.9], 40, [-0.2, 0, -0.25])},
  // sala: segue pra todo canto
  {id: 'segue', a: 31.4, b: 35.0, cam: pc(31.4, 35.0, {p: [2.0, 1.3, 2.6], l: [1.5, 1.0, -2.0], fov: 52, roll: 1}, {p: [-0.6, 1.3, 2.4], l: [-1.4, 1.0, -2.0], fov: 50, roll: -1})},
  {id: 'banheiro', a: 35.0, b: 37.0, cam: wd(35.0, 37.0, [-1.0, 1.35, 0.9], [-2.1, 1.2, -2.2], 40, [0.1, 0, -0.2])},
  {id: 'costumes', a: 37.0, b: 39.0, cam: cl(37.0, 39.0, head([-1.55, 0.55, -1.85]), 1.8, 26, 0.3)},
  {id: 'costumes-locais', a: 39.0, b: 40.8, cam: cl(39.0, 40.8, head([-2.25, 0.55, -2.2]), 1.7, 24, -0.25)},
  {id: 'vontade', a: 40.8, b: 44.6, cam: cl(40.8, 44.6, head([-2.25, 0.55, -2.2]), 1.5, 22, -0.2, 2)},
  // quarto: tranca, chave
  {id: 'tranca', a: 44.6, b: 47.4, cam: wd(44.6, 47.4, [0.6, 1.35, 2.9], [0.6, 1.1, -1.9], 50)},
  {id: 'chave', a: 47.4, b: 49.2, cam: cl(47.4, 49.2, head(Q_MAE), 1.8, 28, -0.35)},
  {id: 'simpatico', a: 49.2, b: 51.6, cam: cl(49.2, 51.6, head(Q_MAE), 1.6, 24, -0.2, -1)},
  {id: 'experiencia', a: 51.6, b: 53.8, cam: wd(51.6, 53.8, [0.9, 1.3, 2.3], [0.6, 1.15, -1.7], 44)},
  // sala: propaganda
  {id: 'tv', a: 53.8, b: 57.0, cam: pc(53.8, 57.0, {p: [0.6, 1.3, 0.6], l: [0.75, 1.3, -2.9], fov: 38, roll: 0}, {p: [0.7, 1.3, 0.0], l: [0.75, 1.3, -2.9], fov: 34, roll: 0})},
  {id: 'enganosa', a: 57.0, b: 59.2, cam: cl(57.0, 59.2, head(S_PROT_SOFA), 1.6, 25, -0.25)},
  {id: 'a-venda', a: 59.2, b: 61.2, cam: wd(59.2, 61.2, [0.1, 1.3, 2.6], [0.1, 1.0, -1.8], 56)},
  // noite
  {id: 'klaus-cama', a: 61.2, b: 63.4, cam: wd(61.2, 63.4, [-0.9, 1.4, 0.6], [-2.1, 0.9, -2.4], 40, [-0.1, 0, -0.2])},
  {id: 'sofa', a: 63.4, b: 65.5, cam: cl(63.4, 65.5, head(S_PROT_SOFA), 1.9, 30, 0.3)},
  // dia seguinte: vai embora
  {id: 'embora', a: 65.5, b: 69.3, cam: wd(65.5, 69.3, [0.2, 1.35, 2.5], [1.6, 1.1, -2.0], 48, [0.3, 0, -0.3])},
  {id: 'obrigado', a: 69.3, b: 71.3, cam: cl(69.3, 71.3, head([2.3, 0.55, -1.9]), 1.8, 27, -0.3)},
  {id: 'estrelas', a: 71.3, b: 72.6, cam: cl(71.3, 72.6, [2.3, 1.15, -1.9], 1.5, 26, 0.2, 0)},
  {id: 'acabou', a: 72.6, b: 74.8, cam: wd(72.6, 74.8, [0.4, 1.2, 1.6], [-0.75, 1.1, -2.1], 38, [-0.1, 0, -0.25])},
  {id: 'cobranca', a: 74.8, b: 78.3, cam: wd(74.8, 78.3, [0.5, 1.3, 2.4], [-0.1, 1.05, -1.9], 46)},
  {id: 'ue-filho', a: 78.3, b: 80.7, cam: cl(78.3, 80.7, head(S_MAE_SALA), 1.7, 25, 0.25, -1)},
  {id: 'nao-e-de-graca', a: 80.7, b: 99, cam: cl(80.7, 83.2, head(S_PROT_SOFA), 1.5, 23, -0.2, 1.5)},
];

// ---------- sala
function useTvCanvas() {
  return useMemo(() => {
    const W = 512, H = 300;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const g = c.getContext('2d')!;
    const sky = g.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#5fc4f0');
    sky.addColorStop(0.62, '#bfeaf6');
    sky.addColorStop(0.62, '#2a9ac8');
    sky.addColorStop(0.72, '#3fb0d8');
    sky.addColorStop(0.72, '#f3d9a0');
    sky.addColorStop(1, '#e8c47a');
    g.fillStyle = sky;
    g.fillRect(0, 0, W, H);
    g.fillStyle = '#ffe680';
    g.beginPath();
    g.arc(420, 60, 34, 0, 7);
    g.fill();
    // coqueiro
    g.strokeStyle = '#7a5232';
    g.lineWidth = 12;
    g.beginPath();
    g.moveTo(70, 260);
    g.quadraticCurveTo(60, 150, 100, 70);
    g.stroke();
    g.fillStyle = '#2f8a4a';
    for (const a of [-2.6, -2.0, -1.2, -0.5, 0.2]) {
      g.beginPath();
      g.ellipse(100 + Math.cos(a) * 40, 70 + Math.sin(a) * 22, 46, 12, a, 0, 7);
      g.fill();
    }
    // brasileiro feliz da propaganda (sorriso, polegar pra cima)
    const ch = document.createElement('canvas');
    ch.width = DW2 * 0.4;
    ch.height = DH2 * 0.4;
    const st: State = S({expr: 'sorriso', look: [0, 0], aR: [-60, -150], aL: [-20, -6]});
    drawCharacter2(ch.getContext('2d')!, {...PROTAGONISTA, suit: '#f2c84a', suitDark: '#d9a92a', shirt: '#f2c84a'}, st, 0.4, LIGHT_DAY);
    g.drawImage(ch, 150, -10, ch.width * 0.72, ch.height * 0.72);
    // brilho de tela
    const v = g.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, 320);
    v.addColorStop(0, 'rgba(255,255,255,0.08)');
    v.addColorStop(1, 'rgba(0,0,20,0.35)');
    g.fillStyle = v;
    g.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 3) {
      g.fillStyle = 'rgba(0,0,0,0.06)';
      g.fillRect(0, y, W, 1);
    }
    return c;
  }, []);
}

function Door({x, open = 0, color = '#7a5232'}: {x: number; open?: number; color?: string}) {
  return (
    <group position={[x, 0, -2.96]}>
      <Box size={[1.1, 2.2, 0.06]} position={[0, 1.1, 0]} color="#efe9d6" />
      <group position={[-0.47, 0, 0.05]} rotation={[0, -open * 1.3, 0]}>
        <Box size={[0.94, 2.05, 0.05]} position={[0.47, 1.03, 0]} color={color} />
        <Cyl r={0.035} h={0.06} position={[0.84, 1.0, 0.05]} color="#d9b45a" noInk />
      </group>
    </group>
  );
}

function Sala({tx, T}: {tx: Tex3; T: number}) {
  const tv = useTvCanvas();
  const tvTex = useMemo(() => {
    const t = new THREE.CanvasTexture(tv);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [tv]);
  const night = isNight(T);
  const bathOpen = ramp(T, 34.6, 35.1) * (1 - ramp(T, 38.8, 39.0));
  const frontOpen = ramp(T, 66.0, 66.5) * (1 - ramp(T, 68.4, 68.7));
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.5]}>
        <planeGeometry args={[14, 10]} />
        <meshToonMaterial map={tx.piso} />
      </mesh>
      <mesh position={[0, 1.5, -3]}>
        <planeGeometry args={[14, 3]} />
        <meshToonMaterial color="#8fa58a" />
      </mesh>
      <mesh position={[-3.4, 1.5, -0.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 3]} />
        <meshToonMaterial color="#869c82" />
      </mesh>
      <mesh position={[4.6, 1.5, -0.5]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[10, 3]} />
        <meshToonMaterial color="#869c82" />
      </mesh>
      <mesh position={[0, 3, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 10]} />
        <meshToonMaterial color="#d9d2bc" />
      </mesh>
      <Box size={[14, 0.16, 0.06]} position={[0, 0.08, -2.97]} color="#efe9d6" noInk />
      {/* portas: banheiro (esq.) e entrada (dir.) */}
      <Door x={S_DOOR_BATH[0]} open={bathOpen} color="#e9e4d4" />
      <Door x={S_DOOR_FRONT[0] + 0.1} open={frontOpen} />
      {/* sofá */}
      <Box size={[2.4, 0.42, 0.9]} position={[-0.75, 0.21, SOFA_Z]} color="#a2463a" />
      <Box size={[2.4, 0.75, 0.25]} position={[-0.75, 0.62, SOFA_Z - 0.4]} color="#8e3a30" />
      <Box size={[0.25, 0.62, 0.9]} position={[-2.0, 0.31, SOFA_Z]} color="#8e3a30" />
      <Box size={[0.25, 0.62, 0.9]} position={[0.5, 0.31, SOFA_Z]} color="#8e3a30" />
      {night > 0 && <Box size={[1.6, 0.12, 0.7]} position={[-0.95, 0.48, SOFA_Z + 0.05]} color="#6a86b8" />}
      {/* rack e TV */}
      <Box size={[1.5, 0.5, 0.45]} position={[0.95, 0.25, -2.7]} color="#6a4528" />
      <Box size={[1.25, 0.76, 0.08]} position={[0.95, 1.3, -2.92]} color="#1a1820" />
      <mesh position={[0.95, 1.3, -2.87]}>
        <planeGeometry args={[1.12, 0.65]} />
        <meshBasicMaterial map={tvTex} color={T >= 53.8 && T < 61.2 ? '#ffffff' : '#30323c'} />
      </mesh>
      {/* quadro, planta, luminária */}
      <Box size={[0.7, 0.5, 0.04]} position={[-0.75, 1.75, -2.95]} color="#d9b45a" />
      <Box size={[0.6, 0.4, 0.02]} position={[-0.75, 1.75, -2.92]} color="#5a7aa8" noInk />
      <Cyl r={0.18} rb={0.14} h={0.4} position={[1.95, 0.2, -2.6]} color="#b8643a" />
      <Cyl r={0.04} h={0.6} position={[1.95, 0.7, -2.6]} color="#2f6b4a" noInk />
      <Cyl r={0.3} h={0.3} position={[1.95, 1.05, -2.6]} color="#3a8a52" />
      <Cyl r={0.03} h={1.5} position={[-2.15, 0.75, -2.6]} color="#c9a65a" />
      <Cyl r={0.14} rb={0.22} h={0.26} position={[-2.15, 1.55, -2.6]} color="#ffd890" emissive={night ? '#000000' : '#ffc070'} />
    </group>
  );
}

function SalaLuz({T}: {T: number}) {
  const night = isNight(T);
  const tvOn = T >= 53.8 && T < 61.2;
  return (
    <>
      <pointLight position={[-2.15, 1.6, -2.3]} intensity={night ? 0 : 6} distance={6} color="#ffc880" />
      <pointLight position={[0.2, 2.6, 0.2]} intensity={night ? 1.5 : 7} distance={9} color={night ? '#8aa0ff' : '#ffe0b0'} />
      {tvOn && <pointLight position={[0.95, 1.3, -2.4]} intensity={4} distance={4} color="#8ad0ff" />}
      {!night && <Glow pos={[-2.15, 1.55, -2.5]} size={1.4} color="#ffc880" amt={0.7} />}
      {tvOn && <Glow pos={[0.95, 1.3, -2.8]} size={2.0} color="#9ad8ff" amt={0.35} />}
    </>
  );
}

// ---------- atores
type A = {look: Look; state: State; hip: V3; roll?: number; flip?: boolean};
const walkTo = (T: number, a: number, b: number, from: V3, to: V3): {hip: V3; walk?: number} => {
  const u = ramp(T, a, b);
  const moving = T > a && T < b;
  return {hip: [lerp(from[0], to[0], u), from[1], lerp(from[2], to[2], u)], walk: moving ? T * 9 : undefined};
};

function cast(T: number): {set: 'quarto' | 'sala'; actors: A[]} {
  const bl = (s: number, p = 2.6) => blink(T, s, p);
  const klausTalk = talk(T, 35.0, 36.9) || talk(T, 37.0, 38.6) || talk(T, 69.4, 71.2) || talk(T, 71.4, 72.3);
  const maeTalk = talk(T, 17.5, 21.6) || talk(T, 49.3, 53.2) || talk(T, 78.4, 83.2);

  // ---- quarto, manhã (15 → 31,4)
  if (T < 31.4) {
    const maeIn = walkTo(T, 15.0, 16.2, [2.6, 0.55, -1.3], Q_MAE);
    const protUp = T >= 23.4;
    const actors: A[] = [];
    actors.push({
      look: PROTAGONISTA,
      hip: protUp ? Q_PROT_PE : PROT_HIP,
      state: S({
        expr: pick(T, [[15, 'surpreso'], [17.4, 'preocupado'], [22.0, 'neutro'], [26.1, 'neutro'], [28.6, 'preocupado'], [30.2, 'surpreso']] as any),
        look: protUp ? [-0.8, 0.2] : T < 22 ? [0.9, 0.2] : [0, 0.1],
        blink: T >= 22.0 && T < 23.4 ? 0.55 : bl(1.3, 2.9),
        seated: !protUp,
        turn: protUp ? -0.3 : 0.3,
        aL: protUp ? [-10, -2] : [-38, 24],
        aR: protUp ? [10, 2] : [40, -20],
        sweat: T >= 28.6 ? ramp(T, 28.8, 29.2) : T < 17 ? 0.6 : 0,
        bob: Math.sin(T * 2) * 2,
        headTilt: T >= 22 && T < 23.4 ? -4 : 0,
      }),
    });
    // Klaus sentado na beirada da cama
    actors.push({
      look: KLAUS,
      hip: KLAUS_HIP,
      flip: true,
      state: S({
        expr: pick(T, [[15, 'sorriso'], [19.4, 'encantado'], [20.6, 'sorriso'], [26.1, 'encantado'], [28.6, 'sorriso']] as any),
        look: T < 23.4 ? [0.6, 0] : [0.9, 0.3],
        blink: bl(0.5, 3.3),
        seated: true,
        turn: 0.2,
        aR: T >= 19.4 && T < 20.8 ? [-150 + Math.sin(T * 14) * 18, -40] : T >= 26.1 && T < 28.6 ? [40, -80] : T >= 28.6 ? [70, -128] : [30, 20],
        aL: T >= 28.6 ? [-60, 105] : [-14, -6],
        prop: T >= 26.1 && T < 28.6 ? 'celular' : T >= 28.6 ? 'camera' : null,
        propHand: 'R',
        bob: Math.sin(T * 2.2 + 1) * 2,
        headTilt: T >= 26.1 && T < 28.6 ? -6 : 0,
      }),
    });
    if (T >= 15.0 && T < 23.4) {
      actors.push({
        look: MAE,
        hip: maeIn.hip,
        state: S({
          expr: pick(T, [[15, 'sorriso'], [17.4, 'encantado'], [19.0, 'sorriso'], [20.6, 'encantado']] as any),
          look: T < 18.4 ? [-0.8, 0.2] : [-0.4, 0],
          blink: bl(2.1, 3.0),
          walk: maeIn.walk,
          talk: maeTalk,
          turn: -0.2,
          aL: T >= 18.2 && T < 19.6 ? [-110, -10] : [-14, -6],
          aR: T >= 20.6 ? [60, -110] : [14, 6],
          bob: Math.sin(T * 2.4) * 2,
          headTilt: T >= 20.6 ? 5 : 0,
        }),
      });
    }
    return {set: 'quarto', actors};
  }

  // ---- sala: segue, banheiro, costumes (31,4 → 44,6)
  if (T < 44.6) {
    const pFrom: V3 = [2.2, 0.55, -1.6];
    const pTo: V3 = [-2.25, 0.55, -2.2];
    const p = walkTo(T, 31.6, 34.8, pFrom, pTo);
    const kTo: V3 = [-1.55, 0.55, -1.85];
    const k = walkTo(T, 31.9, 35.0, [2.9, 0.55, -1.3], kTo);
    return {
      set: 'sala',
      actors: [
        {
          look: PROTAGONISTA, hip: p.hip,
          state: S({
            expr: pick(T, [[31.4, 'neutro'], [33.5, 'preocupado'], [36.0, 'surpreso'], [39.0, 'bravo']] as any),
            look: T < 35 ? [-0.9, 0] : [0.9, 0.2],
            blink: bl(1.8, 2.7),
            walk: p.walk,
            turn: T < 35 ? -0.5 : 0.4,
            prop: 'escova', propHand: 'R',
            aR: [30, -60],
            sweat: T >= 36 && T < 39 ? 0.8 : 0,
            browPump: T >= 40.8 ? 0.6 + Math.sin(T * 6) * 0.2 : 0,
            headTilt: T >= 40.8 ? -6 : 0,
            bob: Math.sin(T * 2) * 2,
          }),
        },
        {
          look: KLAUS, hip: k.hip, flip: true,
          state: S({
            expr: pick(T, [[31.4, 'sorriso'], [35.0, 'encantado'], [37.0, 'sorriso']] as any),
            look: [-0.9, 0.1],
            blink: bl(0.6, 3.1),
            walk: k.walk,
            talk: klausTalk,
            turn: -0.4,
            prop: 'camera', propHand: 'R',
            aR: T >= 37.0 && T < 39.0 ? [70, -128] : [30, -40],
            aL: T >= 37.0 && T < 39.0 ? [-60, 105] : [-14, -6],
            bob: Math.sin(T * 2.2 + 1) * 2,
            headTilt: T >= 35 && T < 37 ? -7 : 0,
          }),
        },
      ],
    };
  }

  // ---- quarto: tranca, chave, simpático (44,6 → 53,8)
  if (T < 53.8) {
    const k = walkTo(T, 47.6, 48.8, [3.2, 0.55, -1.2], [2.3, 0.55, -1.4]);
    return {
      set: 'quarto',
      actors: [
        {
          look: PROTAGONISTA, hip: [0.0, 0.55, -1.75],
          state: S({
            expr: pick(T, [[44.6, 'neutro'], [46.2, 'astuto'], [47.4, 'surpreso'], [49.2, 'preocupado']] as any),
            look: [0.9, 0.1], blink: bl(1.1, 2.8), turn: 0.4,
            aR: T < 46.4 ? [-110, -20] : [10, 4],
            sweat: T >= 47.6 ? 0.8 : 0,
            bob: Math.sin(T * 2) * 2,
          }),
        },
        {
          look: MAE, hip: Q_MAE,
          state: S({
            expr: pick(T, [[44.6, 'sorriso'], [49.2, 'confiante'], [51.7, 'sorriso']] as any),
            look: [-0.8, 0.1], blink: bl(2.4, 3.1), talk: maeTalk, turn: -0.3,
            prop: T >= 47.4 && T < 49.4 ? 'chave' : null, propHand: 'L',
            aL: T >= 47.4 && T < 49.4 ? [-80, -60 + Math.sin(T * 9) * 6] : T >= 49.2 && T < 51.6 ? [-120, -40] : [-14, -6],
            aR: [14, 6],
            bob: Math.sin(T * 2.4) * 2,
            headTilt: T >= 49.2 && T < 51.6 ? -6 : 0,
          }),
        },
        ...(T >= 47.4
          ? [{
              look: KLAUS, hip: k.hip, flip: true,
              state: S({
                expr: 'encantado' as const, look: [-0.8, 0.1], blink: bl(0.8, 3.0), walk: k.walk, turn: -0.3,
                prop: 'camera' as const, propHand: 'R' as const, aR: [70, -128], aL: [-60, 105], bob: Math.sin(T * 2.2) * 2,
              }),
            }]
          : []),
      ],
    };
  }

  // ---- sala: propaganda e "à venda" (53,8 → 61,2)
  if (T < NIGHT_A) {
    return {
      set: 'sala',
      actors: [
        {
          look: PROTAGONISTA, hip: S_PROT_SOFA,
          state: S({
            expr: pick(T, [[53.8, 'neutro'], [56.0, 'preocupado'], [57.0, 'bravo'], [59.2, 'neutro']] as any),
            look: T < 59.2 ? [0.8, -0.1] : [0.9, 0.2], blink: T < 57 ? 0.5 : bl(1.2, 2.8), seated: true, turn: 0.3,
            aL: [-30, 30], aR: [30, -30], browPump: T >= 57 && T < 59.2 ? 0.7 : 0,
            bob: Math.sin(T * 1.6) * 1.5,
          }),
        },
        {
          look: KLAUS, hip: T < 59.2 ? S_KLAUS_FOTO : [0.75, 0.55, -1.15], flip: true,
          state: S({
            expr: pick(T, [[53.8, 'sorriso'], [59.6, 'encantado']] as any),
            look: [-0.9, 0.2], blink: bl(0.7, 3.2), turn: -0.4,
            prop: 'camera', propHand: 'R', aR: [70, -128], aL: [-60, 105],
            lean: T >= 59.5 ? -6 : 0, bob: Math.sin(T * 2.2) * 2,
          }),
        },
      ],
    };
  }

  // ---- noite
  if (T < 63.4) {
    return {
      set: 'quarto',
      actors: [{
        look: KLAUS, hip: Q_KLAUS_DEITA, roll: 1.45,
        state: S({expr: 'sorriso', blink: 1, seated: true, turn: 0.3, aL: [-10, -4], aR: [12, 6], bob: Math.sin(T * 1.4) * 3}),
      }],
    };
  }
  if (T < NIGHT_B) {
    return {
      set: 'sala',
      actors: [{
        look: PROTAGONISTA, hip: S_PROT_SOFA,
        state: S({expr: 'preocupado', look: [0.2, 0.6], blink: bl(0.9, 3.5) * 0.6, seated: true, turn: 0.1, aL: [-38, 24], aR: [40, -20], sweat: 0.6, bob: Math.sin(T * 1.2) * 1.5}),
      }],
    };
  }

  // ---- dia seguinte: Klaus vai embora (65,5 → 74,8)
  if (T < 74.8) {
    const k = walkTo(T, 65.7, 67.6, [0.6, 0.55, -1.5], [2.3, 0.55, -1.9]);
    const gone = T >= 72.6;
    const actors: A[] = [
      {
        look: PROTAGONISTA, hip: S_PROT_SOFA,
        state: S({
          expr: pick(T, [[65.5, 'neutro'], [72.6, 'sorriso']] as any),
          look: T < 72.6 ? [0.9, 0.1] : [0, 0.3], blink: T >= 72.6 ? 1 - ramp(T, 74.2, 74.5) : bl(1.0, 3.0) * 0.5 + 0.35, seated: true, turn: 0.3,
          aL: T >= 72.6 ? [-150, -60] : [-30, 30], aR: T >= 72.6 ? [150, 60] : [30, -30], lean: T >= 72.6 ? -4 : 0,
          headTilt: T >= 72.6 ? -8 : 0, bob: Math.sin(T * 1.4) * 2,
        }),
      },
    ];
    if (!gone) {
      actors.push({
        look: {...KLAUS}, hip: k.hip, flip: true,
        state: S({
          expr: pick(T, [[65.5, 'sorriso'], [69.3, 'encantado'], [70.4, 'sorriso']] as any),
          look: [-0.9, 0.1], blink: bl(0.6, 3.0), walk: k.walk, talk: klausTalk, turn: -0.4,
          prop: T >= 70.8 ? 'celular' : null, propHand: 'R',
          aR: T >= 70.8 ? [20, -95] : T >= 68.0 && T < 69.3 ? [-150 + Math.sin(T * 14) * 18, -40] : [30, 20],
          aL: [-14, -6], bob: Math.sin(T * 2.2) * 2,
        }),
      });
    }
    return {set: 'sala', actors};
  }

  // ---- a cobrança (74,8 → fim)
  const m = walkTo(T, 74.9, 76.0, [2.6, 0.55, -1.8], S_MAE_SALA);
  return {
    set: 'sala',
    actors: [
      {
        look: PROTAGONISTA, hip: S_PROT_SOFA,
        state: S({
          expr: pick(T, [[74.8, 'neutro'], [76.4, 'surpreso'], [78.3, 'preocupado'], [80.7, 'surpreso']] as any),
          look: [0.9, 0.2], blink: T < 75.6 ? 0.6 : bl(1.4, 3.0), seated: true, turn: 0.3,
          aL: [-38, 24], aR: [40, -20], sweat: ramp(T, 76.5, 77.0), browPump: T >= 80.7 ? 0.8 : 0,
          bob: Math.sin(T * 2) * 2,
        }),
      },
      {
        look: MAE, hip: m.hip,
        state: S({
          expr: pick(T, [[74.8, 'sorriso'], [78.3, 'confiante'], [80.7, 'sorriso']] as any),
          look: [-0.8, 0.1], blink: bl(2.2, 3.0), walk: m.walk, talk: maeTalk, turn: -0.3,
          prop: 'papel', propHand: 'L', aL: T >= 76.2 ? [-90, -70] : [-30, -20], aR: [14, 6],
          bob: Math.sin(T * 2.4) * 2, headTilt: T >= 78.3 ? -5 : 0,
        }),
      },
    ],
  };
}

export function Cena2({T, cam, tx}: {T: number; cam: Cam; tx: Tex3}) {
  const {set, actors} = cast(T);
  const night = isNight(T);
  const light = night ? LIGHT_NOITE : set === 'sala' ? LIGHT_SALA : LIGHT_QUARTO;
  return (
    <>
      {set === 'quarto' ? (
        <>
          <Quarto tx={tx} T={T} />
          <Door x={3.45} open={ramp(T, 14.6, 15.0) * (T < 44.6 ? 1 : 1 - ramp(T, 45.6, 46.2))} />
        </>
      ) : (
        <>
          <Sala tx={tx} T={T} />
          <SalaLuz T={T} />
        </>
      )}
      {actors.map((a, i) => (
        <Person key={i} look={a.look} state={a.state} hip={a.hip} cam={cam.p} roll={a.roll} flip={a.flip} light={light} />
      ))}
    </>
  );
}

// ---------- acabamento: noite, flashes, fim
export function Grade2({T}: {T: number}) {
  const fl = (t0: number) => (T >= t0 ? Math.exp(-(T - t0) * 9) : 0);
  const flash = Math.min(1, (fl(30.2) + fl(59.8) + fl(60.35)) * 0.9);
  const night = isNight(T);
  const end = ramp(T, 82.5, 83.1);
  return (
    <>
      {night > 0 && <AbsoluteFill style={{background: 'rgba(10,14,60,0.35)', mixBlendMode: 'multiply'}} />}
      <AbsoluteFill style={{background: '#fffbe8', opacity: flash}} />
      <AbsoluteFill style={{background: '#000', opacity: end}} />
    </>
  );
}
