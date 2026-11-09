import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Inked} from './kit';
import {INK, Look, State} from './toon';

const deg = (d: number) => (d * Math.PI) / 180;

// ---------- geometrias em cache (a geometria precisa ser estável entre quadros)
const cache = new Map<string, THREE.BufferGeometry>();
function G(key: string, make: () => THREE.BufferGeometry) {
  let g = cache.get(key);
  if (!g) cache.set(key, (g = make()));
  return g;
}
const ell = (rx: number, ry: number, rz: number) => G(`e${rx}_${ry}_${rz}`, () => new THREE.SphereGeometry(1, 28, 18).scale(rx, ry, rz));
const cap = (r: number, len: number, sx = 1, sz = 1) => G(`c${r}_${len}_${sx}_${sz}`, () => new THREE.CapsuleGeometry(r, len, 8, 16).scale(sx, 1, sz));
const cyl = (rt: number, rb: number, h: number) => G(`y${rt}_${rb}_${h}`, () => new THREE.CylinderGeometry(rt, rb, h, 28));
const box = (w: number, h: number, d: number) => G(`b${w}_${h}_${d}`, () => new THREE.BoxGeometry(w, h, d));
const dome = (rx: number, ry: number, rz: number, polar: number) => G(`d${rx}_${ry}_${rz}_${polar}`, () => new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, polar).scale(rx, ry, rz));
const torus = (r: number, t: number) => G(`t${r}_${t}`, () => new THREE.TorusGeometry(r, t, 8, 24));

// ---------- rosto pintado (textura equirretangular da cabeça; frente = x 512)
function drawFace(ctx: CanvasRenderingContext2D, L: Look, S: State) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = L.skin;
  ctx.fillRect(0, 0, W, H);
  // leve sombra nas bochechas
  const gr = ctx.createRadialGradient(512, 560, 40, 512, 560, 420);
  gr.addColorStop(0, 'rgba(255,200,170,0.22)');
  gr.addColorStop(1, 'rgba(255,200,170,0)');
  ctx.fillStyle = gr;
  ctx.fillRect(0, 0, W, H);

  ctx.setTransform(5, 0, 0, 3.6, 512, 512);
  const e = S.expr;
  const hw = 64;
  const eyeY = -1;
  const ex = hw * 0.42;
  const open = (e === 'surpreso' ? 1.12 : e === 'confiante' ? 0.9 : e === 'astuto' ? 0.62 : e === 'lendo' ? 0.7 : e === 'encantado' ? 0.8 : e === 'sorriso' ? 0.78 : 1) * (1 - S.blink);
  let browLift = 0;
  let browTilt = 0;
  if (e === 'surpreso') browLift = -16;
  if (e === 'astuto') { browLift = -2; browTilt = -0.28; }
  if (e === 'confiante') { browLift = -7; browTilt = -0.1; }
  if (e === 'bravo') { browLift = 4; browTilt = -0.55; }
  if (e === 'preocupado') { browLift = -9; browTilt = 0.38; }
  if (e === 'encantado') { browLift = -9; browTilt = 0.1; }
  if (e === 'lendo') { browLift = 0; browTilt = 0.1; }
  browLift -= (S.browPump ?? 0) * 14;

  const ink = (w: number) => {
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = INK;
    ctx.lineWidth = w;
  };

  // sobrancelhas
  ink(6.5);
  ctx.strokeStyle = L.hairStyle === 'grisalho' ? '#6b6470' : L.hair === '#e8e2d4' ? '#8a8478' : INK;
  for (const sgn of [-1, 1]) {
    const bx = sgn * ex;
    const by = eyeY - 34 + browLift;
    ctx.beginPath();
    ctx.moveTo(bx - sgn * 22, by + browTilt * -22);
    ctx.quadraticCurveTo(bx, by - 8, bx + sgn * 22, by + browTilt * 22 + 4);
    ctx.stroke();
  }

  // olhos
  for (const sgn of [-1, 1]) {
    const ox = sgn * ex;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(ox, eyeY, 12.5, 10 * Math.max(open, 0.06), 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fbf7ee';
    ctx.fill();
    ink(4.5);
    ctx.stroke();
    ctx.clip();
    if (open > 0.15) {
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(ox + S.look[0] * 8, eyeY + S.look[1] * 6, e === 'surpreso' ? 4 : 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(ox + S.look[0] * 8 - 2, eyeY + S.look[1] * 6 - 2, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    if (e === 'astuto' || e === 'lendo') {
      ctx.fillStyle = L.skin;
      ctx.fillRect(ox - 20, eyeY - 20, 40, 19);
      ink(4);
      ctx.beginPath();
      ctx.moveTo(ox - 18, eyeY - 1);
      ctx.lineTo(ox + 18, eyeY - 1);
      ctx.stroke();
    }
    ctx.restore();
  }
  if (L.glasses) {
    ink(4.5);
    for (const sgn of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(sgn * ex, eyeY, 21, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(-ex + 21, eyeY - 3);
    ctx.lineTo(ex - 21, eyeY - 3);
    ctx.stroke();
  }

  // bigode
  const my = eyeY + 50;
  if (L.mustache !== 'nenhuma') {
    ctx.fillStyle = L.hair;
    ink(4);
    ctx.beginPath();
    if (L.mustache === 'fina') {
      ctx.moveTo(-34, my + 4);
      ctx.quadraticCurveTo(-14, my - 12, 0, my - 4);
      ctx.quadraticCurveTo(14, my - 12, 34, my + 4);
      ctx.quadraticCurveTo(14, my - 2, 0, my + 3);
      ctx.quadraticCurveTo(-14, my - 2, -34, my + 4);
    } else {
      ctx.moveTo(-52, my + 14);
      ctx.bezierCurveTo(-44, my - 20, -10, my - 18, 0, my - 6);
      ctx.bezierCurveTo(10, my - 18, 44, my - 20, 52, my + 14);
      ctx.bezierCurveTo(36, my + 6, 14, my + 8, 0, my + 4);
      ctx.bezierCurveTo(-14, my + 8, -36, my + 6, -52, my + 14);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // boca
  const my2 = my + 24;
  ink(5);
  ctx.fillStyle = '#5b1a22';
  if (e === 'surpreso') {
    ctx.beginPath();
    ctx.ellipse(0, my2 + 6, 14, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (e === 'encantado' || e === 'sorriso') {
    ctx.beginPath();
    ctx.moveTo(-30, my2 - 6);
    ctx.quadraticCurveTo(0, my2 + 34, 30, my2 - 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fbf7ee';
    ctx.beginPath();
    ctx.moveTo(-24, my2 - 3);
    ctx.quadraticCurveTo(0, my2 + 6, 24, my2 - 3);
    ctx.lineTo(22, my2 + 3);
    ctx.quadraticCurveTo(0, my2 + 12, -22, my2 + 3);
    ctx.closePath();
    ctx.fill();
  } else if (e === 'confiante') {
    ctx.beginPath();
    ctx.moveTo(-26, my2 - 2);
    ctx.quadraticCurveTo(0, my2 + 16, 26, my2 - 4);
    ctx.stroke();
  } else if (e === 'astuto') {
    ctx.beginPath();
    ctx.moveTo(-24, my2 + 4);
    ctx.quadraticCurveTo(6, my2 + 10, 30, my2 - 8);
    ctx.stroke();
  } else if (e === 'bravo') {
    ctx.beginPath();
    ctx.moveTo(-26, my2 + 14);
    ctx.quadraticCurveTo(0, my2 - 10, 26, my2 + 14);
    ctx.stroke();
  } else if (e === 'preocupado') {
    ctx.beginPath();
    ctx.moveTo(-22, my2 + 12);
    ctx.quadraticCurveTo(0, my2 - 6, 22, my2 + 12);
    ctx.stroke();
  } else if (e === 'lendo') {
    ctx.beginPath();
    ctx.moveTo(-16, my2 + 4);
    ctx.lineTo(16, my2 + 4);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(-18, my2 + 2);
    ctx.quadraticCurveTo(0, my2 + 8, 18, my2 + 2);
    ctx.stroke();
  }
}

// ---------- painel frontal (camisa, colete, gravata, lapelas)
const panelCache = new WeakMap<Look, THREE.Texture>();
function panelTexture(L: Look) {
  let t = panelCache.get(L);
  if (t) return t;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 512;
  const g = c.getContext('2d')!;
  g.fillStyle = L.suit;
  g.fillRect(0, 0, 256, 512);
  // colete
  g.fillStyle = L.vest ?? L.shirt;
  g.beginPath();
  g.moveTo(88, 40); g.lineTo(168, 40); g.lineTo(150, 440); g.lineTo(106, 440); g.closePath();
  g.fill();
  // colarinho
  g.fillStyle = L.shirt;
  g.beginPath();
  g.moveTo(96, 0); g.lineTo(128, 78); g.lineTo(160, 0); g.lineTo(144, 0); g.lineTo(128, 34); g.lineTo(112, 0); g.closePath();
  g.fill();
  g.fillRect(100, 0, 56, 10);
  // gravata
  g.fillStyle = L.tie;
  g.beginPath();
  g.moveTo(118, 44); g.lineTo(138, 44); g.lineTo(146, 280); g.lineTo(128, 306); g.lineTo(110, 280); g.closePath();
  g.fill();
  g.strokeStyle = INK;
  g.lineWidth = 5;
  g.stroke();
  // lapelas
  g.fillStyle = L.suitDark;
  for (const s of [-1, 1]) {
    g.beginPath();
    g.moveTo(128 + s * 18, 30); g.lineTo(128 + s * 28, 330); g.lineTo(128 + s * 78, 150); g.lineTo(128 + s * 62, 10); g.closePath();
    g.fill();
    g.stroke();
  }
  g.fillStyle = INK;
  for (let i = 0; i < 2; i++) { g.beginPath(); g.arc(142, 360 + i * 50, 7, 0, 7); g.fill(); }
  if (L.pocketSquare) {
    g.fillStyle = L.pocketSquare;
    g.beginPath(); g.moveTo(190, 250); g.lineTo(224, 238); g.lineTo(220, 270); g.lineTo(192, 270); g.closePath(); g.fill(); g.lineWidth = 4; g.stroke();
  }
  if (L.chain) {
    g.strokeStyle = '#d7a93a';
    g.lineWidth = 6;
    g.beginPath(); g.moveTo(104, 330); g.quadraticCurveTo(128, 372, 160, 336); g.stroke();
  }
  t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  panelCache.set(L, t);
  return t;
}

const paperTex = (() => {
  let t: THREE.Texture | null = null;
  return (kind: 'papel' | 'jornal') => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 340;
    const g = c.getContext('2d')!;
    g.fillStyle = kind === 'papel' ? '#f3ead0' : '#d9d4c4';
    g.fillRect(0, 0, 256, 340);
    g.fillStyle = '#2a2528';
    if (kind === 'jornal') g.fillRect(24, 20, 208, 36);
    for (let i = 0; i < (kind === 'jornal' ? 10 : 11); i++) g.fillRect(26, (kind === 'jornal' ? 80 : 40) + i * 24, i % 3 === 0 ? 200 : 120, 7);
    if (kind === 'papel') {
      g.fillStyle = '#b23030';
      g.beginPath(); g.arc(196, 292, 20, 0, 7); g.fill();
    }
    t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
})();
const papers: Record<string, THREE.Texture> = {};
const getPaper = (k: 'papel' | 'jornal') => (papers[k] ??= paperTex(k));

const shadowTex = (() => {
  let t: THREE.Texture | null = null;
  return () => {
    if (t) return t;
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d')!;
    const r = g.createRadialGradient(64, 64, 4, 64, 64, 62);
    r.addColorStop(0, 'rgba(10,0,20,0.55)');
    r.addColorStop(1, 'rgba(10,0,20,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 128, 128);
    t = new THREE.CanvasTexture(c);
    return t;
  };
})();

type Props = {look: Look; state: State; pos: [number, number, number]; yaw: number};

export function Character3D({look: L, state: S, pos, yaw}: Props) {
  const B = L.build;
  const canvas = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 2048;
    c.height = 1024;
    return c;
  }, []);
  drawFace(canvas.getContext('2d')!, L, S);
  const faceTex = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [canvas]);
  faceTex.needsUpdate = true;
  const panel = panelTexture(L);

  const sit = Math.min(1, Math.max(0, -pos[1] / 0.32));
  const walking = S.walk !== undefined;
  const drop = Math.max(0, S.bob) * 0.0032; // agachar / afundar
  const standHip = 0.94 - (walking ? 0 : drop);
  const hipsY = standHip * (1 - sit) + 0.5 * sit + (walking ? -Math.abs(Math.sin(S.walk!)) * 0.03 + 0.015 : 0);
  const crouchA = Math.acos(Math.min(1, Math.max(0, (hipsY - 0.06) / 0.88)));
  const ph = S.walk ?? 0;
  const swing = walking ? Math.sin(ph) * 0.62 : 0;
  const thigh = (side: number) => -(sit * (Math.PI / 2) + (1 - sit) * crouchA) + (walking ? swing * side : 0);
  const shin = (side: number) => sit * (Math.PI / 2) + (1 - sit) * 2 * crouchA + (walking ? 0.9 * Math.max(0, -Math.sin(ph + (side > 0 ? 0 : Math.PI))) * 0.6 : 0);

  const headYaw = S.turn * 0.75;
  const tilt = deg(S.headTilt ?? 0);
  const lean = deg(S.lean);
  const sh = 0.175 * B + 0.05;
  const hs = 1 + (B - 1) * 0.35;

  const arm = (side: -1 | 1, a: [number, number]) => {
    const t1 = deg(a[0]);
    const t2 = deg(a[1]);
    const swingArm = walking ? (side > 0 ? -swing : swing) * 0.8 : 0;
    const skin = L.skin;
    const isProp = (S.prop === 'papel' || S.prop === 'jornal') && ((S.propHand ?? 'R') === (side > 0 ? 'R' : 'L'));
    const inner = (
      <group rotation-z={walking ? 0 : t1} rotation-x={walking ? swingArm : 0}>
        <Inked geo={cap(0.05 * Math.min(B, 1.15), 0.2)} color={L.suit} position={[0, -0.16, 0]} line={0.006} />
        <group position={[0, -0.31, 0]} rotation-z={walking ? 0 : t2 - t1} rotation-x={walking ? Math.max(0, swingArm) * 0.8 - 0.3 : 0}>
          <Inked geo={cap(0.042 * Math.min(B, 1.15), 0.19)} color={L.suit} position={[0, -0.13, 0]} line={0.006} />
          <Inked geo={cyl(0.046, 0.046, 0.035)} color={L.shirt} position={[0, -0.245, 0]} line={0.004} />
          <Inked geo={ell(0.05, 0.058, 0.045)} color={skin} position={[0, -0.3, 0]} line={0.004} />
          <Inked geo={ell(0.02, 0.03, 0.022)} color={skin} position={[side * 0.04, -0.285, 0.025]} line={0.003} />
          {isProp && (
            <group position={[0, -0.3, 0.04]} rotation-z={walking ? 0 : -t2}>
              <mesh position={[0, 0.15, 0.02]}>
                <planeGeometry args={S.prop === 'jornal' ? [0.4, 0.52] : [0.27, 0.35]} />
                <meshBasicMaterial map={getPaper(S.prop as 'papel' | 'jornal')} side={THREE.DoubleSide} />
              </mesh>
            </group>
          )}
        </group>
      </group>
    );
    return (
      <group position={[side * sh, 0.46, 0]} rotation-y={-yaw}>
        {inner}
      </group>
    );
  };

  const leg = (side: -1 | 1) => (
    <group position={[side * 0.085 * B, 0, 0]} rotation-x={thigh(side)}>
      <Inked geo={cap(0.072, 0.3)} color={L.trousers} position={[0, -0.22, 0]} line={0.006} />
      <group position={[0, -0.44, 0]} rotation-x={shin(side)}>
        <Inked geo={cap(0.06, 0.3)} color={L.trousers} position={[0, -0.22, 0]} line={0.006} />
        <Inked geo={ell(0.065, 0.045, 0.125)} color="#1b1514" position={[0, -0.4, 0.045]} line={0.005} />
      </group>
    </group>
  );

  const headScale: [number, number, number] = [hs, 1, hs];
  const hat = L.hat;

  return (
    <group position={[pos[0], 0, pos[2]]} rotation-y={yaw}>
      <mesh position={[0, 0.012, 0]} rotation-x={-Math.PI / 2} renderOrder={1}>
        <planeGeometry args={[0.95, 0.6]} />
        <meshBasicMaterial map={shadowTex()} transparent depthWrite={false} />
      </mesh>
      <group position={[0, hipsY, -0.3 * sit]}>
        {leg(-1)}
        {leg(1)}
        <Inked geo={cap(0.14, 0.12, 1.5 * B, 0.85)} color={L.trousers} position={[0, 0.02, 0]} line={0.006} />
        <group rotation-z={-lean * 0.8}>
          {/* tronco */}
          <Inked geo={cap(0.15, 0.3, 1.18 * B, 0.88)} color={L.suit} position={[0, 0.27, 0]} line={0.007} />
          <Inked geo={box(0.4 * B, 0.2, 0.24)} color={L.suit} position={[0, 0.05, 0]} line={0.006} />
          <mesh position={[0, 0.34, 0.134]}>
            <planeGeometry args={[0.17 * B + 0.02, 0.4]} />
            <meshToonMaterial map={panel} />
          </mesh>
          {arm(-1, S.aL)}
          {arm(1, S.aR)}
          {/* pescoço + cabeça */}
          <Inked geo={cyl(0.05, 0.055, 0.12)} color={L.skin} position={[0, 0.58, 0]} line={0.004} />
          <group position={[0, 0.72, 0.01]} rotation={[0, headYaw, tilt]} scale={headScale}>
            <Inked geo={ell(0.108, 0.133, 0.118)} color="#ffffff" map={faceTex} position={[0, 0, 0]} line={0.0045} />
            <Inked geo={ell(0.013, 0.02, 0.026)} color={L.skin} position={[0, -0.02, 0.119]} line={0.003} />
            {[-1, 1].map((s) => (
              <Inked key={s} geo={ell(0.016, 0.032, 0.022)} color={L.skin} position={[s * 0.108, -0.005, -0.005]} line={0.003} />
            ))}
            {L.hairStyle !== 'calvo' && (
              <Inked geo={dome(0.116, 0.14, 0.126, 1.32)} color={L.hair} position={[0, 0.01, -0.014]} rotation={[-0.4, 0, 0]} line={0.0045} />
            )}
            {L.hairStyle === 'calvo' &&
              [-1, 1].map((s) => <Inked key={s} geo={ell(0.02, 0.04, 0.05)} color={L.hair} position={[s * 0.098, 0.0, -0.025]} line={0.003} />)}
            {hat === 'bowler' && (
              <group position={[0, 0.075, 0.0]} rotation={[0.1, 0, 0]}>
                <Inked geo={cyl(0.17, 0.17, 0.012)} color="#26211f" position={[0, 0, 0]} line={0.004} />
                <Inked geo={dome(0.125, 0.115, 0.135, 1.6)} color="#26211f" position={[0, 0.004, 0]} line={0.004} />
                <Inked geo={cyl(0.127, 0.127, 0.022)} color="#7a1f2a" position={[0, 0.016, 0]} line={0.003} noInk />
              </group>
            )}
            {hat === 'fedora' && (
              <group position={[0, 0.08, 0.0]} rotation={[0.12, 0, 0.04]}>
                <Inked geo={cyl(0.2, 0.2, 0.012)} color="#5a5047" position={[0, 0, 0]} line={0.004} />
                <Inked geo={dome(0.125, 0.12, 0.135, 1.65)} color="#5a5047" position={[0, 0.004, 0]} line={0.004} />
                <Inked geo={cyl(0.128, 0.128, 0.026)} color="#2b2622" position={[0, 0.018, 0]} line={0.003} noInk />
              </group>
            )}
            {hat === 'cartola' && (
              <group position={[0, 0.07, 0.0]} rotation={[0.05, 0, 0]}>
                <Inked geo={cyl(0.16, 0.16, 0.012)} color="#1d1a22" position={[0, 0, 0]} line={0.004} />
                <Inked geo={cyl(0.1, 0.105, 0.22)} color="#1d1a22" position={[0, 0.12, 0]} line={0.004} />
                <Inked geo={cyl(0.107, 0.107, 0.025)} color="#6b6275" position={[0, 0.03, 0]} line={0.003} noInk />
              </group>
            )}
            {(S.sweat ?? 0) > 0 && (
              <Inked geo={ell(0.011, 0.017, 0.011)} color="#bfe3f5" position={[0.088, 0.075 - (S.sweat ?? 0) * 0.07, 0.07]} line={0.002} />
            )}
          </group>
        </group>
      </group>
    </group>
  );
}
