// Vídeo "O barbeiro e a sobrancelha": barbearia, elenco e planos. Tempos em segundos globais da narração (85,16 s).
import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame} from 'remotion';
import {loadFont as loadElite} from '@remotion/google-fonts/SpecialElite';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {Billboard} from './kit';
import {drawCharacter2, DW2, DH2, INK2, Light} from './toon2';
import {Brow, Look, State} from './toon';
import {Rig} from './Pilot';
import {Dust, Glow} from './Film';
import {Cam, FPS, blink, glide, key, keyv, lerp, pick, ramp} from './story';
import PALAVRAS from '../voz/palavras-barbeiro.json';

export const BARB_LEN = 85.159125;
export const BARB_FRAMES = Math.ceil(BARB_LEN * FPS);

type V3 = [number, number, number];
const SCALE = 2.0;
const CARD = 1.8 * 1.2;
const HIP_UP = 0.302;
const LIGHT_BARB: Light = {key: '#ffbf70', keyAmt: 0.22, from: [0.4, -1], amb: '#283070', ambAmt: 0.22};

// ---------- elenco
const CLIENTE: Look = {
  skin: '#c08a60', hair: '#1c1418', suit: '#3f6f9a', suitDark: '#2f5577', shirt: '#3f6f9a', tie: '#3f6f9a', trousers: '#2e3448',
  build: 1.0, mustache: 'nenhuma', hairStyle: 'liso', casual: 'capa', fringeUp: 46,
};
const BARBEIRO: Look = {
  skin: '#9a6440', hair: '#18121a', suit: '#2c2a36', suitDark: '#1e1c28', shirt: '#2c2a36', tie: '#2c2a36', vest: '#8a5432',
  trousers: '#2a2a3a', build: 1.12, mustache: 'farta', hairStyle: 'calvo', casual: 'avental', beard: true,
};
const OUTRO: Look = {
  skin: '#e2b088', hair: '#6a3a22', suit: '#c45a3a', suitDark: '#9a4228', shirt: '#c45a3a', tie: '#c45a3a', trousers: '#3a3f5a',
  build: 0.95, mustache: 'nenhuma', hairStyle: 'liso', casual: 'camiseta',
};
const VELHO: Look = {
  skin: '#d9a47e', hair: '#e8e2d4', suit: '#6a7a5a', suitDark: '#55644a', shirt: '#d8d2c0', tie: '#8a3a3a', trousers: '#4a4a52',
  build: 1.05, mustache: 'farta', hairStyle: 'grisalho', glasses: true,
};

const S = (o: Partial<State> = {}): State => ({expr: 'neutro', look: [0, 0], turn: 0, blink: 0, aL: [-8, -4], aR: [8, 4], lean: 0, bob: 0, ...o});

const WORDS = PALAVRAS as {w: string; s: number; e: number}[];
function talk(T: number, from: number, to: number): number {
  for (let i = 0; i < WORDS.length; i++) {
    const w = WORDS[i];
    if (w.s < from - 0.02 || w.e > to + 0.02) continue;
    if (T >= w.s - 0.03 && T <= w.e) return 0.3 + 0.7 * Math.abs(Math.sin(T * 17 + i * 1.7));
  }
  return 0;
}
// boca mexendo sem fala própria (o narrador conta o que ele diz)
const mumble = (T: number, a: number, b: number) => (T >= a && T < b ? 0.25 + 0.6 * Math.abs(Math.sin(T * 13)) : 0);

// ---------- posições (pivô no quadril; em pé o quadril fica a 0,55 × tamanho)
const CLI_HIP: V3 = [0, 0.68, -1.3];
const BARB_SIZE = 1.12;
const BARB_HIP: V3 = [0.78, 0.55 * BARB_SIZE, -1.15];
const OUTRO_HIP: V3 = [-1.75, 0.55, -2.15];
const VELHO_HIP: V3 = [-2.55, 0.55, -2.45];
const head = (hip: V3, size = 1): V3 => [hip[0], hip[1] + 0.83 * size, hip[2]];
const CLI_HEAD = head(CLI_HIP);
const BARB_HEAD = head(BARB_HIP, BARB_SIZE);
const OUTRO_HEAD = head(OUTRO_HIP);

// ---------- câmera
type Shot = {id: string; a: number; b: number; cam: (T: number) => Cam};
const pc = (a: number, b: number, f: Cam, t: Cam) => (T: number): Cam => {
  const u = glide((T - a) / (b - a));
  const m = (x: number[], y: number[]) => x.map((v, i) => lerp(v, y[i], u));
  return {p: m(f.p, t.p) as V3, l: m(f.l, t.l) as V3, fov: lerp(f.fov, t.fov, u), roll: lerp(f.roll, t.roll, u)};
};
const cl = (a: number, b: number, h: V3, d0 = 1.9, fov0 = 26, dx = 0.25, roll = 1): Shot['cam'] => {
  const d = d0 * 1.35, fov = fov0 + 4;
  const l: V3 = [h[0], h[1] - 0.1, h[2]];
  return pc(a, b, {p: [h[0] + dx, h[1] - 0.05, h[2] + d], l, fov, roll}, {p: [h[0] + dx * 0.5, h[1] - 0.06, h[2] + d * 0.86], l, fov: fov * 0.9, roll: -roll});
};
const wd = (a: number, b: number, p: V3, l: V3, fov = 46, dp: V3 = [-0.2, 0, -0.3], roll = 1): Shot['cam'] =>
  pc(a, b, {p, l, fov, roll}, {p: [p[0] + dp[0], p[1] + dp[1], p[2] + dp[2]], l, fov: fov * 0.94, roll: -roll});
const MID: V3 = [0.4, 1.3, -1.25]; // entre cliente e barbeiro

export const SHOTS: Shot[] = [
  {id: 'abre', a: 0, b: 1.6, cam: wd(0, 1.6, [0.2, 1.45, 2.6], [-0.3, 1.15, -1.8], 52, [0.1, 0, -0.35])},
  {id: 'metade', a: 1.6, b: 3.96, cam: cl(1.6, 3.96, CLI_HEAD, 1.75, 25, -0.15)},
  {id: 'desculpa', a: 3.96, b: 6.5, cam: cl(3.96, 6.5, BARB_HEAD, 1.8, 26, 0.3)},
  {id: 'olha', a: 6.5, b: 8.1, cam: wd(6.5, 8.1, [0.9, 1.45, 1.5], MID, 34, [-0.1, 0, -0.2])},
  {id: 'ideia', a: 8.1, b: 9.2, cam: cl(8.1, 9.2, BARB_HEAD, 1.5, 23, 0.2, -1)},
  {id: 'igualzinho', a: 9.2, b: 12.2, cam: wd(9.2, 12.2, [0.3, 1.45, 1.2], MID, 36, [-0.05, 0, -0.25])},
  {id: 'caralho', a: 12.2, b: 13.76, cam: cl(12.2, 13.76, CLI_HEAD, 1.65, 24, 0.1, 2)},
  {id: 'pontinhas', a: 13.76, b: 16.54, cam: wd(13.76, 16.54, [-0.4, 1.4, 1.6], MID, 38, [0.1, 0, -0.2])},
  {id: 'maquina', a: 16.54, b: 19.26, cam: cl(16.54, 19.26, [0.12, 1.5, -1.3], 1.5, 24, 0.15, -1)},
  {id: 'escorregou', a: 19.26, b: 22.5, cam: cl(19.26, 22.5, BARB_HEAD, 2.0, 28, 0.35)},
  {id: 'calma', a: 22.5, b: 26.4, cam: wd(22.5, 26.4, [0.8, 1.45, 1.4], MID, 36, [-0.15, 0, -0.25])},
  {id: 'caderno', a: 26.4, b: 30.4, cam: cl(26.4, 30.4, CLI_HEAD, 1.7, 25, -0.2)},
  {id: 'risco', a: 30.4, b: 33.4, cam: wd(30.4, 33.4, [0.3, 1.5, 1.3], [0.25, 1.42, -1.3], 34, [-0.05, 0, -0.25], 2)},
  {id: 'julgando', a: 33.4, b: 35.6, cam: cl(33.4, 35.6, CLI_HEAD, 1.7, 25, 0.15)},
  {id: 'salao', a: 35.6, b: 37.2, cam: wd(35.6, 37.2, [0.9, 1.5, 2.8], [-1.0, 1.15, -2.0], 54, [-0.3, 0, -0.3])},
  {id: 'foi-mal', a: 37.2, b: 39.66, cam: cl(37.2, 39.66, OUTRO_HEAD, 1.8, 27, 0.5)},
  {id: 'ameacando', a: 39.66, b: 43.28, cam: cl(39.66, 43.28, CLI_HEAD, 1.6, 24, -0.2, -1)},
  {id: 'apagar', a: 43.28, b: 45.5, cam: wd(43.28, 45.5, [-0.3, 1.45, 1.5], MID, 36, [0.1, 0, -0.2])},
  {id: 'esfrega', a: 45.5, b: 50.86, cam: wd(45.5, 50.86, [0.35, 1.5, 0.9], [0.3, 1.45, -1.25], 38, [-0.05, 0, -0.25])},
  {id: 'prova-dagua', a: 50.86, b: 53.6, cam: cl(50.86, 53.6, BARB_HEAD, 1.6, 24, 0.25)},
  {id: 'puta', a: 53.6, b: 55.7, cam: cl(53.6, 55.7, CLI_HEAD, 1.6, 24, 0, 2)},
  {id: 'semana', a: 55.7, b: 62.3, cam: pc(55.7, 62.3, {p: [0.2, 1.5, 2.2], l: [0, 1.3, -1.3], fov: 44, roll: 0}, {p: [0.05, 1.47, 0.6], l: [0, 1.42, -1.3], fov: 30, roll: 1})},
  {id: 'maquininha', a: 62.3, b: 64.86, cam: wd(62.3, 64.86, [0.9, 1.4, 1.4], MID, 38, [-0.15, 0, -0.2])},
  {id: 'oitenta', a: 64.86, b: 69.2, cam: cl(64.86, 69.2, BARB_HEAD, 1.9, 28, 0.2)},
  {id: 'design', a: 69.2, b: 71.9, cam: cl(69.2, 71.9, CLI_HEAD, 1.7, 25, -0.15, -1)},
  {id: 'reforma', a: 71.9, b: 74.66, cam: wd(71.9, 74.66, [0.4, 1.45, 2.0], MID, 42, [-0.1, 0, -0.3])},
  {id: 'reclama', a: 74.66, b: 77.36, cam: wd(74.66, 77.36, [-0.3, 1.45, 1.4], MID, 36, [0.1, 0, -0.2])},
  {id: 'de-graca', a: 77.36, b: 80.0, cam: cl(77.36, 80.0, BARB_HEAD, 1.6, 24, 0.25, -1)},
  {id: 'parcelas', a: 80.0, b: 99, cam: pc(80.0, BARB_LEN, {p: [0.15, 1.48, 1.0], l: [0.05, 1.42, -1.3], fov: 34, roll: 1}, {p: [0.05, 1.47, 0.55], l: [0.02, 1.42, -1.3], fov: 29, roll: -1})},
];
const shotAt = (T: number) => SHOTS.find((s) => T >= s.a && T < s.b) ?? SHOTS[SHOTS.length - 1];

// ---------- cartões
function useCanvas(w = DW2, h = DH2) {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = w * SCALE;
    c.height = h * SCALE;
    return c;
  }, [w, h]);
}
const yawTo = (cam: V3, p: V3) => Math.atan2(cam[0] - p[0], cam[2] - p[2]);
// desloca um ponto para trás, na direção contrária à câmera
const behind = (p: V3, cam: V3, d: number): V3 => {
  const v = [p[0] - cam[0], 0, p[2] - cam[2]];
  const n = Math.hypot(v[0], v[2]) || 1;
  return [p[0] + (v[0] / n) * d, p[1], p[2] + (v[2] / n) * d];
};

function Person({look, state, hip, cam, size = 1, flip = false}: {look: Look; state: State; hip: V3; cam: V3; size?: number; flip?: boolean}) {
  const canvas = useCanvas();
  drawCharacter2(canvas.getContext('2d')!, look, state, SCALE, LIGHT_BARB);
  return <Billboard canvas={canvas} position={[hip[0], hip[1] + HIP_UP * size, hip[2]]} height={CARD * size} yaw={yawTo(cam, hip)} flip={flip} />;
}

// cadeira de barbeiro desenhada no traço dos personagens, no mesmo enquadre do cartão (cx = 300, quadril em 668)
function drawCadeira(g: CanvasRenderingContext2D) {
  const c = g.canvas;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, c.width, c.height);
  g.setTransform(SCALE, 0, 0, SCALE, 200 * SCALE, 100 * SCALE);
  g.lineJoin = 'round';
  g.lineCap = 'round';
  g.strokeStyle = INK2;
  const cx = 300;
  // coluna cromada e base redonda
  g.lineWidth = 12;
  g.fillStyle = '#b8bcc8';
  g.beginPath();
  g.roundRect(cx - 34, 860, 68, 120, 8);
  g.fill();
  g.stroke();
  g.fillStyle = '#9a9eaa';
  g.beginPath();
  g.ellipse(cx, 1000, 150, 26, 0, 0, 7);
  g.fill();
  g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.5)';
  g.fillRect(cx - 22, 870, 8, 100);
  // apoio dos pés
  g.fillStyle = '#c9ccd6';
  g.beginPath();
  g.roundRect(cx - 120, 955, 240, 20, 8);
  g.fill();
  g.stroke();
  // encosto de couro vinho com capitonê
  g.fillStyle = '#7a2230';
  g.beginPath();
  g.roundRect(cx - 160, 300, 320, 420, 40);
  g.fill();
  g.stroke();
  g.fillStyle = 'rgba(0,0,0,0.25)';
  for (let y = 360; y < 700; y += 70) for (let x = -110; x <= 110; x += 73) { g.beginPath(); g.arc(cx + x, y, 6, 0, 7); g.fill(); }
  g.fillStyle = 'rgba(255,200,180,0.18)';
  g.fillRect(cx - 140, 320, 26, 380);
  // braços da cadeira (cromados) dos dois lados
  for (const s of [-1, 1]) {
    g.fillStyle = '#7a2230';
    g.beginPath();
    g.roundRect(cx + s * 175 - 30, 640, 60, 60, 16);
    g.fill();
    g.stroke();
    g.fillStyle = '#b8bcc8';
    g.beginPath();
    g.roundRect(cx + s * 175 - 12, 700, 24, 150, 8);
    g.fill();
    g.stroke();
  }
}
function Cadeira({cam}: {cam: V3}) {
  const canvas = useCanvas();
  useMemo(() => drawCadeira(canvas.getContext('2d')!), [canvas]);
  const p = behind(CLI_HIP, cam, 0.08);
  return <Billboard canvas={canvas} position={[p[0], p[1] + HIP_UP, p[2]]} height={CARD} yaw={yawTo(cam, CLI_HIP)} />;
}

// ---------- texturas da barbearia
function cvs(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}
function tex(c: HTMLCanvasElement, rep?: [number, number]) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (rep) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rep[0], rep[1]);
  }
  return t;
}
function rnd(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}
function inkG(g: CanvasRenderingContext2D, w: number) {
  g.strokeStyle = INK2;
  g.lineWidth = w;
  g.lineJoin = 'round';
  g.lineCap = 'round';
}

function pisoXadrez() {
  const c = cvs(512, 512);
  const g = c.getContext('2d')!;
  const n = 8, s = 512 / n;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    g.fillStyle = (x + y) % 2 ? '#2a2a36' : '#d9d2bc';
    g.fillRect(x * s, y * s, s, s);
  }
  const r = rnd(3);
  for (let i = 0; i < 500; i++) {
    g.fillStyle = `rgba(80,60,40,${0.04 + r() * 0.06})`;
    g.fillRect(r() * 512, r() * 512, 3 + r() * 10, 2 + r() * 6);
  }
  return tex(c, [7, 5]);
}

// parede do fundo: azulejo embaixo, verde-garrafa em cima, prateleira, poste de barbeiro, quadro, tabela, relógio
function paredeFundo() {
  const W = 2800, H = 600; // 14 m × 3 m
  const c = cvs(W, H);
  const g = c.getContext('2d')!;
  const px = (m: number) => (m + 7) * 200; // x em metros → px
  const py = (m: number) => (3 - m) * 200; // altura em metros → px
  g.fillStyle = '#2f5a4e';
  g.fillRect(0, 0, W, H);
  const r = rnd(9);
  for (let i = 0; i < 2500; i++) {
    g.fillStyle = `rgba(${r() > 0.5 ? '255,250,220' : '10,20,20'},${0.03 + r() * 0.05})`;
    g.fillRect(r() * W, r() * H, 3 + r() * 10, 3 + r() * 10);
  }
  // azulejo branco até 1,1 m
  g.fillStyle = '#e6e2d6';
  g.fillRect(0, py(1.1), W, H - py(1.1));
  g.strokeStyle = 'rgba(60,70,80,0.35)';
  g.lineWidth = 2;
  for (let x = 0; x < W; x += 40) { g.beginPath(); g.moveTo(x, py(1.1)); g.lineTo(x, H); g.stroke(); }
  for (let y = py(1.1); y < H; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  g.fillStyle = '#1e3a32';
  g.fillRect(0, py(1.1) - 10, W, 14);

  // espelho grande atrás da cadeira (reflete só brilho, nada de figura)
  const mx0 = px(-0.9), mx1 = px(0.9), my0 = py(2.35), my1 = py(1.15);
  inkG(g, 10);
  g.fillStyle = '#b8892e';
  g.fillRect(mx0 - 18, my0 - 18, mx1 - mx0 + 36, my1 - my0 + 36);
  g.strokeRect(mx0 - 18, my0 - 18, mx1 - mx0 + 36, my1 - my0 + 36);
  const mg = g.createLinearGradient(mx0, my0, mx1, my1);
  mg.addColorStop(0, '#7d95a8');
  mg.addColorStop(0.5, '#a9bccb');
  mg.addColorStop(1, '#5c7084');
  g.fillStyle = mg;
  g.fillRect(mx0, my0, mx1 - mx0, my1 - my0);
  g.strokeRect(mx0, my0, mx1 - mx0, my1 - my0);
  g.fillStyle = 'rgba(255,255,255,0.35)';
  g.beginPath();
  g.moveTo(mx0 + 40, my0);
  g.lineTo(mx0 + 110, my0);
  g.lineTo(mx0 + 20, my1);
  g.lineTo(mx0 - 50 < mx0 ? mx0 : mx0, my1);
  g.closePath();
  g.fill();

  // bancada com frascos, pente no copo de desinfetante
  g.fillStyle = '#6a4228';
  g.fillRect(px(-1.3), py(1.12), px(1.3) - px(-1.3), 26);
  g.strokeRect(px(-1.3), py(1.12), px(1.3) - px(-1.3), 26);
  const bottles: [number, number, number, string][] = [[-1.15, 0.22, 0.09, '#3a8acb'], [-0.98, 0.3, 0.07, '#d9a43a'], [-0.84, 0.18, 0.1, '#c84a5a'], [0.82, 0.26, 0.09, '#5ab08a'], [1.0, 0.2, 0.08, '#e8e2d0'], [1.16, 0.32, 0.07, '#8a5ac8']];
  for (const [x, h, w, col] of bottles) {
    g.fillStyle = col;
    g.beginPath();
    g.roundRect(px(x) - w * 100, py(1.12 + h), w * 200, h * 200, 10);
    g.fill();
    g.stroke();
    g.fillStyle = INK2;
    g.fillRect(px(x) - 10, py(1.12 + h) - 22, 20, 24);
    g.fillStyle = 'rgba(255,255,255,0.4)';
    g.fillRect(px(x) - w * 100 + 8, py(1.12 + h) + 10, 6, h * 120);
  }

  // poste de barbeiro (listras vermelho/azul/branco) à esquerda do espelho
  const pxl = px(-1.6), pw = 50, pt = py(2.2), pb = py(1.3);
  g.save();
  g.beginPath();
  g.roundRect(pxl - pw / 2, pt, pw, pb - pt, 20);
  g.clip();
  g.fillStyle = '#f2eee4';
  g.fillRect(pxl - pw, pt, pw * 2, pb - pt);
  for (let y = pt - 100; y < pb + 60; y += 44) {
    g.fillStyle = (y / 44) % 2 < 1 ? '#c8283a' : '#2a52a8';
    g.beginPath();
    g.moveTo(pxl - pw, y);
    g.lineTo(pxl + pw, y + 50);
    g.lineTo(pxl + pw, y + 66);
    g.lineTo(pxl - pw, y + 16);
    g.closePath();
    g.fill();
  }
  g.restore();
  inkG(g, 9);
  g.strokeRect(pxl - pw / 2, pt, pw, pb - pt);
  g.fillStyle = '#c9a04a';
  g.fillRect(pxl - 34, pt - 24, 68, 26);
  g.strokeRect(pxl - 34, pt - 24, 68, 26);
  g.fillRect(pxl - 34, pb, 68, 26);
  g.strokeRect(pxl - 34, pb, 68, 26);

  // tabela de preços (madeira, giz)
  const tx0 = px(1.35), ty0 = py(2.45);
  g.fillStyle = '#7a5232';
  g.fillRect(tx0 - 12, ty0 - 12, 344, 284);
  g.strokeRect(tx0 - 12, ty0 - 12, 344, 284);
  g.fillStyle = '#23302a';
  g.fillRect(tx0, ty0, 320, 260);
  g.fillStyle = '#efe8d6';
  g.textAlign = 'left';
  g.font = 'bold 40px "Special Elite", monospace';
  g.fillText('TABELA', tx0 + 90, ty0 + 52);
  g.font = '30px "Special Elite", monospace';
  const lines: [string, string][] = [['Corte', 'R$ 40'], ['Barba', 'R$ 25'], ['Pezinho', 'R$ 10'], ['Sobrancelha', 'R$ 15']];
  lines.forEach(([a, b], i) => {
    g.fillText(a, tx0 + 18, ty0 + 108 + i * 40);
    g.fillText(b, tx0 + 210, ty0 + 108 + i * 40);
  });

  // quadro de cortes antigos (pôster) à esquerda
  const qx = px(-3.9), qy = py(2.5);
  g.fillStyle = '#e8dcc0';
  g.fillRect(qx, qy, 300, 340);
  g.strokeRect(qx, qy, 300, 340);
  for (let k = 0; k < 4; k++) {
    const hx = qx + 75 + (k % 2) * 150, hy = qy + 90 + Math.floor(k / 2) * 160;
    g.fillStyle = '#d9a47e';
    g.beginPath();
    g.arc(hx, hy, 46, 0, 7);
    g.fill();
    g.stroke();
    g.fillStyle = ['#1c1418', '#5a3a22', '#2a2030', '#7a5a3a'][k];
    g.beginPath();
    g.arc(hx, hy - 6, 48, Math.PI * 1.05, Math.PI * 1.95);
    g.fill();
  }

  // relógio
  const rx = px(4.0), ry = py(2.45);
  g.fillStyle = '#f2ecdc';
  g.beginPath();
  g.arc(rx, ry, 70, 0, 7);
  g.fill();
  inkG(g, 12);
  g.stroke();
  inkG(g, 8);
  g.beginPath();
  g.moveTo(rx, ry);
  g.lineTo(rx + 30, ry - 24);
  g.moveTo(rx, ry);
  g.lineTo(rx - 6, ry - 52);
  g.stroke();

  // janela com persiana (noite lá fora) na ponta direita
  const jx = px(4.6), jy = py(2.5);
  g.fillStyle = '#1a2148';
  g.fillRect(jx, jy, 380, 300);
  g.fillStyle = 'rgba(255,220,140,0.5)';
  for (let k = 0; k < 6; k++) g.fillRect(jx + 30 + k * 58, jy + 160 + (k % 3) * 30, 18, 24);
  g.fillStyle = '#d8d2c0';
  for (let y = jy; y < jy + 140; y += 20) g.fillRect(jx, y, 380, 12);
  inkG(g, 10);
  g.strokeRect(jx, jy, 380, 300);

  // espelho e bancada de um segundo posto, vazio, à direita
  const m2 = px(2.2);
  g.fillStyle = '#b8892e';
  g.fillRect(m2 - 10, py(2.2) - 10, 280, 220);
  g.fillStyle = mg;
  g.fillRect(m2, py(2.2), 260, 200);
  inkG(g, 10);
  g.strokeRect(m2, py(2.2), 260, 200);
  return tex(c);
}

function paredeLado() {
  const c = cvs(1600, 480);
  const g = c.getContext('2d')!;
  g.fillStyle = '#2f5a4e';
  g.fillRect(0, 0, 1600, 480);
  g.fillStyle = '#e6e2d6';
  g.fillRect(0, 304, 1600, 176);
  g.fillStyle = '#1e3a32';
  g.fillRect(0, 300, 1600, 10);
  return tex(c);
}

// banco de espera (madeira) desenhado como cartão de frente
function drawBanco(g: CanvasRenderingContext2D) {
  const c = g.canvas;
  g.clearRect(0, 0, c.width, c.height);
  g.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  inkG(g, 10);
  g.fillStyle = '#8a5a34';
  g.beginPath();
  g.roundRect(20, 40, 760, 60, 12);
  g.fill();
  g.stroke();
  g.fillStyle = '#6a4228';
  for (const x of [60, 700]) {
    g.beginPath();
    g.roundRect(x, 100, 40, 120, 6);
    g.fill();
    g.stroke();
  }
  g.fillStyle = 'rgba(255,230,190,0.25)';
  g.fillRect(36, 50, 720, 10);
}
function Banco({cam}: {cam: V3}) {
  const canvas = useCanvas(800, 240);
  useMemo(() => drawBanco(canvas.getContext('2d')!), [canvas]);
  const p: V3 = [-2.15, 0.22, -2.75];
  const t = useMemo(() => {
    const x = new THREE.CanvasTexture(canvas);
    x.colorSpace = THREE.SRGBColorSpace;
    return x;
  }, [canvas]);
  return (
    <mesh position={p} rotation={[0, yawTo(cam, p) * 0.3, 0]}>
      <planeGeometry args={[1.8, 0.54]} />
      <meshBasicMaterial map={t} transparent alphaTest={0.35} side={THREE.DoubleSide} />
    </mesh>
  );
}

type TexB = {piso: THREE.Texture; fundo: THREE.Texture; lado: THREE.Texture};

function Salao({tx}: {tx: TexB}) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.5]}>
        <planeGeometry args={[14, 10]} />
        <meshToonMaterial map={tx.piso} />
      </mesh>
      <mesh position={[0, 1.5, -3]}>
        <planeGeometry args={[14, 3]} />
        <meshToonMaterial map={tx.fundo} />
      </mesh>
      <mesh position={[-4.2, 1.5, -0.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 3]} />
        <meshToonMaterial map={tx.lado} />
      </mesh>
      <mesh position={[4.6, 1.5, -0.5]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[10, 3]} />
        <meshToonMaterial map={tx.lado} />
      </mesh>
      <mesh position={[0, 3, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 10]} />
        <meshToonMaterial color="#cfc6ae" />
      </mesh>
    </group>
  );
}

function Luz() {
  return (
    <>
      <color attach="background" args={['#1d1b34']} />
      <fog attach="fog" args={['#3a3050', 9, 22]} />
      <ambientLight intensity={0.68} color="#a9b4ee" />
      <hemisphereLight args={['#ffe0a8', '#2a2a58', 0.5]} />
      <pointLight position={[0.2, 2.6, -1.0]} intensity={10} distance={7} color="#ffd48a" />
      <pointLight position={[-2.2, 2.6, -1.8]} intensity={5} distance={5} color="#ffc070" />
      <directionalLight position={[2, 3, 6]} intensity={0.5} color="#d8d8ff" />
      <Glow pos={[0.2, 2.75, -1.0]} size={1.4} color="#ffd890" amt={0.9} />
      <Glow pos={[-2.2, 2.75, -1.8]} size={1.1} color="#ffc880" amt={0.7} />
    </>
  );
}

// lâmpadas penduradas desenhadas (fio + cúpula)
function Lampada({pos}: {pos: V3}) {
  return (
    <group position={pos}>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.4, 6]} />
        <meshBasicMaterial color={INK2} />
      </mesh>
      <mesh>
        <coneGeometry args={[0.16, 0.14, 20, 1, true]} />
        <meshBasicMaterial color="#2f5a4e" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <sphereGeometry args={[0.05, 12, 8]} />
        <meshBasicMaterial color="#fff2c0" />
      </mesh>
    </group>
  );
}

// sombra de contato no chão
function Sombra({p, r = 0.36}: {p: V3; r?: number}) {
  const t = useMemo(() => {
    const c = cvs(128, 128);
    const g = c.getContext('2d')!;
    const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62);
    gr.addColorStop(0, 'rgba(8,4,20,0.6)');
    gr.addColorStop(1, 'rgba(8,4,20,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
  return (
    <mesh position={[p[0], 0.005, p[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[r * 2, r * 1.2]} />
      <meshBasicMaterial map={t} transparent depthWrite={false} />
    </mesh>
  );
}

// ---------- atores no tempo T
function Cena({T, cam}: {T: number; cam: Cam}) {
  const bl = (s: number, p = 2.6) => blink(T, s, p);
  const flash = T >= 13.76 && T < 16.54; // lembrança: as duas sobrancelhas ainda inteiras
  const right: Brow = flash ? 'normal' : T < 32.7 ? 'raspada' : 'desenhada';
  const left: Brow = 'normal';

  const cli = S({
    expr: pick(T, [[0, 'surpreso'], [3.96, 'preocupado'], [9.6, 'surpreso'], [12.2, 'bravo'], [13.76, 'neutro'], [16.54, 'surpreso'], [19.26, 'bravo'], [24.0, 'preocupado'], [26.4, 'bravo'], [30.4, 'surpreso'], [33.4, 'neutro'], [37.2, 'neutro'], [43.28, 'bravo'], [45.5, 'preocupado'], [53.6, 'surpreso'], [55.7, 'neutro'], [62.3, 'neutro'], [65.5, 'surpreso'], [69.2, 'bravo'], [74.66, 'bravo'], [77.4, 'preocupado'], [80.0, 'surpreso'], [81.6, 'bravo']] as any),
    look: keyv(T, [[0, [0, 0]], [6.5, [0.9, -0.2]], [8.1, [0.9, -0.2]], [12.2, [0, 0]], [13.76, [0, 0.4]], [16.54, [0.3, -0.6]], [19.26, [0.9, -0.2]], [26.4, [0, 0]], [33.4, [-0.9, 0]], [34.4, [0.9, 0]], [35.4, [-0.9, 0.1]], [37.2, [-0.9, 0.1]], [39.66, [0, 0]], [43.28, [0.9, -0.2]], [53.6, [0, 0]], [56.5, [-0.8, 0.2]], [59.5, [0.8, 0.1]], [61.3, [0, 0]], [62.3, [0.9, 0]], [69.2, [0, 0]], [74.66, [0.9, -0.2]], [80.0, [0, 0]]]) as any,
    blink: bl(0.4, 3.0),
    turn: key(T, [[0, 0], [6.4, 0], [6.8, 0.25], [12.0, 0.25], [12.3, 0], [33.4, 0], [33.8, -0.3], [34.4, 0.3], [35.4, -0.35], [39.6, -0.2], [40.0, 0], [43.2, 0], [43.5, 0.3], [53.5, 0.3], [53.7, 0], [62.3, 0.25], [69.1, 0.25], [69.3, 0], [74.6, 0], [74.9, 0.3], [80.0, 0.3], [80.2, 0]]),
    lean: key(T, [[0, 0], [30.6, 0], [31.2, -7], [32.0, 0]]),
    bob: Math.sin(T * 1.9) * 1.5 + key(T, [[30.4, 0], [31.0, -14], [32.2, 0]]),
    sweat: T >= 53.6 && T < 56 ? 1 : T >= 80 ? 1 : 0,
    browPump: key(T, [[0, 0], [12.2, 0.4], [13.6, 0]]),
    headTilt: key(T, [[0, 0], [55.7, 0], [57, -4], [60, 4], [62.3, 0]]),
    talk: mumble(T, 43.4, 45.3) || mumble(T, 74.9, 77.2) || (T >= 39.7 && T < 40.4 ? mumble(T, 39.7, 40.4) : 0),
    seated: true,
    brows: [left, right],
  });

  // barbeiro: braço do lado esquerdo da tela vai até o rosto do cliente
  const reach: [number, number] = [-112, -140];
  const rest: [number, number] = [-14, -6];
  const near: [number, number] = [-98, -168]; // mão na sobrancelha do lado direito da tela
  const barbAL = keyv(T, [
    [0, reach], [1.4, reach], [2.2, rest], [9.6, rest], [10.4, [-100, -150]], [12.0, [-100, -150]], [12.4, rest],
    [13.76, [-140, -170]], [16.4, [-140, -170]], [16.54, reach], [19.2, reach], [19.26, rest],
    [24.8, rest], [25.6, [-60, -130]], [26.3, [-60, -130]], [30.4, [-60, -130]], [31.0, near], [33.3, near], [33.4, rest],
    [45.6, rest], [46.2, near], [50.7, near], [50.86, rest],
    [62.3, rest], [63.6, [-50, -100]], [69.1, [-50, -100]], [69.2, rest],
    [77.4, rest], [78.4, [-100, -150]], [80.0, [-100, -150]], [80.2, [-110, -150]],
  ]) as [number, number];
  const rub = T >= 46.4 && T < 50.8 ? Math.sin(T * 22) * (6 + 6 * ramp(T, 46.4, 49.5)) : 0;
  const shrug = T >= 20.2 && T < 22.4;
  const prop = T < 2.2 || (T >= 9.6 && T < 12.4) || (T >= 13.76 && T < 19.26) || T >= 77.4 ? 'maquina' : T >= 24.8 && T < 33.4 ? 'lapis' : T >= 45.6 && T < 50.86 ? 'algodao' : T >= 62.3 && T < 69.2 ? 'maquininha' : null;
  const barb = S({
    expr: pick(T, [[0, 'surpreso'], [3.96, 'preocupado'], [8.1, 'astuto'], [9.2, 'sorriso'], [12.2, 'preocupado'], [13.76, 'neutro'], [16.54, 'preocupado'], [19.26, 'neutro'], [22.5, 'confiante'], [26.4, 'confiante'], [33.4, 'encantado'], [36.0, 'neutro'], [45.5, 'preocupado'], [53.6, 'preocupado'], [62.3, 'sorriso'], [69.2, 'neutro'], [74.66, 'preocupado'], [77.36, 'sorriso']] as any),
    look: keyv(T, [[0, [-0.9, -0.2]], [3.96, [0, 0.4]], [5.5, [0, 0.4]], [6.5, [-0.9, -0.1]], [8.1, [0.3, -0.5]], [9.2, [-0.9, -0.1]], [19.26, [0, 0]], [22.5, [-0.9, 0]], [33.4, [-0.9, 0]], [36.0, [0, 0]], [45.5, [-0.9, -0.1]], [50.86, [0, 0.3]], [53.6, [-0.9, 0]], [64.86, [0, 0]], [66.5, [-0.6, 0]], [69.2, [-0.9, 0]], [77.36, [0, 0]], [78.6, [-0.9, 0]]]) as any,
    blink: bl(1.1, 3.4),
    turn: key(T, [[0, -0.35], [3.9, -0.35], [4.2, 0], [6.4, 0], [6.8, -0.35], [8.0, -0.35], [8.2, 0], [9.2, 0], [9.5, -0.3], [19.2, -0.3], [19.4, 0], [22.5, 0], [22.8, -0.3], [50.8, -0.3], [51.0, 0], [53.6, -0.3], [64.8, -0.3], [65.0, 0], [69.2, -0.3], [77.3, -0.3], [77.5, 0], [78.6, -0.3]]),
    talk: talk(T, 9.2, 11.6) || talk(T, 22.52, 26.3) || talk(T, 50.88, 53.5) || talk(T, 64.88, 68.9) || talk(T, 77.38, 79.9) || mumble(T, 19.6, 22.3),
    aL: [barbAL[0] + rub * 0.5, barbAL[1] + rub] as [number, number],
    aR: shrug ? [80, 160] : [12, 6],
    lean: key(T, [[0, -6], [1.4, -6], [2.2, 0], [30.4, 0], [31.0, -9], [33.3, -9], [33.6, 0], [45.6, 0], [46.2, -8], [50.7, -8], [51.0, 0]]),
    bob: Math.sin(T * 2.1 + 1) * 2 + (shrug ? -10 : 0),
    sweat: (T >= 46 && T < 54) ? ramp(T, 46.5, 48.5) : (T >= 3.96 && T < 8.1) ? 0.7 : 0,
    browPump: (T >= 8.1 && T < 9.2 ? 0.9 : 0) + (shrug ? 0.6 : 0),
    headTilt: key(T, [[0, 0], [8.1, -6], [9.2, -4], [12.2, 0], [20.2, 5], [22.4, 0], [64.9, 4], [69.2, 0], [77.4, -6]]),
    prop: prop as any,
    propHand: 'L',
  });

  const outro = S({
    expr: pick(T, [[0, 'neutro'], [35.0, 'surpreso'], [37.2, 'preocupado'], [40.5, 'surpreso']] as any),
    look: keyv(T, [[0, [0.3, 0.5]], [34.6, [0.3, 0.5]], [35.0, [0.9, 0]]]) as any,
    blink: bl(0.9, 2.9),
    turn: key(T, [[0, 0], [34.6, 0], [35.0, 0.3]]),
    talk: talk(T, 37.2, 39.6),
    aL: T < 34.6 ? [20, 150] : [-30, 40],
    aR: T < 34.6 ? [-10, -150] : [40, -40],
    prop: T < 34.6 ? 'celular' : null,
    propHand: 'R',
    bob: Math.sin(T * 2) * 1.5,
    sweat: T >= 37.2 && T < 42 ? 0.6 : 0,
  });
  const velho = S({
    expr: pick(T, [[0, 'lendo'], [35.4, 'surpreso'], [39.0, 'lendo']] as any),
    look: keyv(T, [[0, [0, 1]], [35.2, [0, 1]], [35.5, [0.9, 0]], [39.0, [0, 1]]]) as any,
    blink: bl(1.7, 3.6),
    aL: [-30, 120],
    aR: [30, -120],
    prop: 'jornal',
    propHand: 'R',
    browPump: T >= 35.4 && T < 39 ? 0.7 : 0,
  });

  return (
    <>
      <Cadeira cam={cam.p} />
      <Person look={CLIENTE} state={cli} hip={CLI_HIP} cam={cam.p} />
      <Sombra p={CLI_HIP} r={0.45} />
      <Person look={BARBEIRO} state={barb} hip={BARB_HIP} cam={cam.p} size={BARB_SIZE} />
      <Sombra p={BARB_HIP} />
      <Person look={OUTRO} state={outro} hip={OUTRO_HIP} cam={cam.p} flip />
      <Sombra p={OUTRO_HIP} />
      <Person look={VELHO} state={velho} hip={VELHO_HIP} cam={cam.p} />
      <Sombra p={VELHO_HIP} />
      <Banco cam={cam.p} />
    </>
  );
}

function Grade() {
  return (
    <>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 44%, rgba(0,0,0,0) 40%, rgba(6,4,22,0.78) 100%)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(110,120,200,0.14), rgba(70,40,120,0.08))', mixBlendMode: 'multiply'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%, rgba(255,200,110,0.10), rgba(0,0,0,0) 65%)', mixBlendMode: 'screen'}} />
    </>
  );
}

export const Barbearia: React.FC = () => {
  const T = useCurrentFrame() / FPS;
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('fontes'));
  useEffect(() => {
    loadElite('normal', {subsets: ['latin']}).waitUntilDone().then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);
  const tx = useMemo<TexB | null>(() => (ready ? {piso: pisoXadrez(), fundo: paredeFundo(), lado: paredeLado()} : null), [ready]);
  if (!tx) return <AbsoluteFill style={{background: '#150f1c'}} />;
  const cam = shotAt(T).cam(T);
  // lembrança (pontinhas): tom sépia leve
  const memory = T >= 13.76 && T < 16.54;
  const fadeOut = ramp(T, BARB_LEN - 0.5, BARB_LEN);
  return (
    <AbsoluteFill style={{background: '#150f1c'}}>
      <ThreeCanvas width={720} height={1280} camera={{position: cam.p, fov: cam.fov}} gl={{antialias: true, toneMapping: THREE.NoToneMapping}} style={{background: '#150f1c', filter: memory ? 'sepia(0.55) brightness(1.05)' : undefined}}>
        <Rig cam={cam as any} />
        <Luz />
        <Salao tx={tx} />
        <Lampada pos={[0.2, 2.8, -1.0]} />
        <Lampada pos={[-2.2, 2.8, -1.8]} />
        <Cena T={T} cam={cam} />
        <Dust T={T} cam={cam} />
      </ThreeCanvas>
      <Grade />
      <AbsoluteFill style={{background: '#000', opacity: fadeOut}} />
    </AbsoluteFill>
  );
};
