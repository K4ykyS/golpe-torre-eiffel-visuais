// Personagens 2D no estilo "ilustrado e sombrio": cabeça redonda grande, corpo de pílula,
// braços/pernas de linha, contorno grosso, rosto minimalista, luz da cena aplicada por cima.
import {Look, State} from './toon';

export const INK2 = '#16132b';
export const DW2 = 1000;
export const DH2 = 1200;
const rad = (d: number) => (d * Math.PI) / 180;

export type Light = {
  key: string; // cor da luz principal
  keyAmt: number; // 0..1
  from: [number, number]; // direção de onde vem a luz (x: -1 esq .. 1 dir, y: -1 cima .. 1 baixo)
  amb: string; // cor da sombra/ambiente
  ambAmt: number; // 0..1
};
export const LIGHT_HOTEL: Light = {key: '#ffa24a', keyAmt: 0.24, from: [0.6, -1], amb: '#2a1c64', ambAmt: 0.26};
export const LIGHT_DUSK: Light = {key: '#ff8a3a', keyAmt: 0.26, from: [1, -0.4], amb: '#2a2064', ambAmt: 0.26};
export const LIGHT_DAY: Light = {key: '#ffd8a0', keyAmt: 0.16, from: [0.5, -1], amb: '#2a2a50', ambAmt: 0.2};
export const LIGHT_TRAIN: Light = {key: '#ffb060', keyAmt: 0.24, from: [0, -1], amb: '#241a3e', ambAmt: 0.26};

function line(ctx: CanvasRenderingContext2D, w: number, color = INK2) {
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
}

function limb(ctx: CanvasRenderingContext2D, sx: number, sy: number, a1: number, a2: number, l1: number, l2: number) {
  const ex = sx + Math.sin(rad(a1)) * l1;
  const ey = sy + Math.cos(rad(a1)) * l1;
  const hx = ex + Math.sin(rad(a2)) * l2;
  const hy = ey + Math.cos(rad(a2)) * l2;
  line(ctx, 15);
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.quadraticCurveTo(ex + (hx - sx) * 0.02, ey, hx, hy);
  ctx.stroke();
  return {hx, hy};
}

function drawProp(ctx: CanvasRenderingContext2D, S: State, hx: number, hy: number) {
  if (S.prop !== 'papel' && S.prop !== 'jornal') return;
  const j = S.prop === 'jornal';
  ctx.save();
  ctx.translate(hx, hy - 6);
  ctx.fillStyle = j ? '#d9d4c4' : '#f3ead0';
  line(ctx, 8);
  const w = j ? 190 : 130;
  const h = j ? 250 : 170;
  ctx.fillRect(-w / 2, -h, w, h);
  ctx.strokeRect(-w / 2, -h, w, h);
  ctx.fillStyle = '#3a3438';
  if (j) ctx.fillRect(-w / 2 + 14, -h + 14, w - 28, 28);
  for (let i = 0; i < 8; i++) ctx.fillRect(-w / 2 + 16, -h + (j ? 62 : 24) + i * 19, i % 3 === 0 ? w - 32 : w * 0.5, 6);
  if (!j) {
    ctx.fillStyle = '#b23030';
    ctx.beginPath();
    ctx.arc(w / 2 - 28, -24, 15, 0, 7);
    ctx.fill();
  }
  ctx.restore();
}

function drawHead(ctx: CanvasRenderingContext2D, L: Look, S: State, cx: number, cy: number) {
  const R = 120;
  const e = S.expr;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rad(S.headTilt ?? 0));
  ctx.translate(-cx, -cy);
  const tx = S.turn * 22; // desloca o rosto ao virar

  // cabeça
  ctx.beginPath();
  ctx.ellipse(cx, cy, R, R * 1.03, 0, 0, Math.PI * 2);
  ctx.fillStyle = L.skin;
  ctx.fill();

  // cabelo (calota com franja reta)
  ctx.save();
  ctx.clip();
  if (L.hairStyle !== 'calvo') {
    ctx.fillStyle = L.hair;
    ctx.beginPath();
    ctx.moveTo(cx - R - 10, cy - R - 10);
    ctx.lineTo(cx + R + 10, cy - R - 10);
    ctx.lineTo(cx + R + 10, cy - 32);
    ctx.quadraticCurveTo(cx + 20, cy - 26 + tx * 0.1, cx - R - 10, cy - 38);
    ctx.closePath();
    ctx.fill();
    line(ctx, 11);
    ctx.beginPath();
    ctx.moveTo(cx + R + 10, cy - 32);
    ctx.quadraticCurveTo(cx + 20, cy - 26, cx - R - 10, cy - 38);
    ctx.stroke();
  } else {
    ctx.fillStyle = L.hair;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(cx + s * (R - 4), cy - 4, 20, 46, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // sombra do chapéu sobre o rosto
  if (L.hat) {
    const g = ctx.createLinearGradient(0, cy - R, 0, cy + 30);
    g.addColorStop(0, 'rgba(12,6,30,0.78)');
    g.addColorStop(1, 'rgba(12,6,30,0)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - R, cy - R, R * 2, R + 40);
  }
  ctx.restore();

  // contorno
  line(ctx, 15);
  ctx.beginPath();
  ctx.ellipse(cx, cy, R, R * 1.03, 0, 0, Math.PI * 2);
  ctx.stroke();

  // ----- rosto
  const eyeY = cy + 22;
  const ex = 44;
  const open = (1 - S.blink);
  let browLift = 0;
  let browTilt = 0;
  if (e === 'surpreso') browLift = -12;
  if (e === 'astuto') { browLift = 2; browTilt = -0.3; }
  if (e === 'confiante') { browLift = -2; browTilt = -0.12; }
  if (e === 'bravo') { browLift = 8; browTilt = -0.6; }
  if (e === 'preocupado') { browLift = -6; browTilt = 0.4; }
  if (e === 'encantado') { browLift = -8; browTilt = 0.1; }
  if (e === 'lendo') { browLift = 4; browTilt = 0.08; }
  browLift -= (S.browPump ?? 0) * 12;
  const bc = L.hairStyle === 'grisalho' ? '#5c5666' : L.hair === '#e8e2d4' ? '#8a8478' : INK2;

  for (const sgn of [-1, 1]) {
    const ox = cx + tx + sgn * ex;
    // sobrancelha
    line(ctx, 10, bc);
    const by = eyeY - 34 + browLift;
    ctx.beginPath();
    ctx.moveTo(ox - sgn * 24, by + browTilt * -24);
    ctx.quadraticCurveTo(ox, by - 8, ox + sgn * 24, by + browTilt * 24 + 3);
    ctx.stroke();

    const closed = open < 0.35;
    if (closed || e === 'encantado' || e === 'sorriso') {
      line(ctx, 10);
      ctx.beginPath();
      if (e === 'encantado' || e === 'sorriso') ctx.arc(ox, eyeY + 8, 19, Math.PI * 1.08, Math.PI * 1.92);
      else {
        ctx.moveTo(ox - 17, eyeY + 2);
        ctx.quadraticCurveTo(ox, eyeY + 10, ox + 17, eyeY + 2);
      }
      ctx.stroke();
      continue;
    }
    const wide = e === 'surpreso';
    const r = wide ? 27 : 18;
    // olho
    ctx.beginPath();
    ctx.arc(ox, eyeY, r, 0, Math.PI * 2);
    ctx.fillStyle = '#fbf7ee';
    ctx.fill();
    line(ctx, wide ? 9 : 7);
    ctx.stroke();
    ctx.fillStyle = INK2;
    ctx.beginPath();
    ctx.arc(ox + S.look[0] * (wide ? 7 : 7), eyeY + S.look[1] * 6, wide ? 8 : 7, 0, Math.PI * 2);
    ctx.fill();
    // pálpebra pesada + olheira
    if (e === 'astuto' || e === 'lendo' || e === 'confiante' || e === 'bravo' || e === 'neutro') {
      const lidY = eyeY - r + (e === 'neutro' ? 12 : e === 'confiante' ? 14 : 20) + (e === 'bravo' ? 4 : 0);
      ctx.save();
      ctx.beginPath();
      ctx.arc(ox, eyeY, r + 4, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = L.skin;
      ctx.beginPath();
      ctx.moveTo(ox - r - 6, eyeY - r - 6);
      ctx.lineTo(ox + r + 6, eyeY - r - 6);
      const slant = e === 'bravo' ? sgn * 10 : e === 'astuto' ? sgn * 4 : 0;
      ctx.lineTo(ox + r + 6, lidY - slant);
      ctx.lineTo(ox - r - 6, lidY + slant);
      ctx.closePath();
      ctx.fill();
      line(ctx, 9);
      ctx.beginPath();
      ctx.moveTo(ox - r - 6, lidY + slant);
      ctx.lineTo(ox + r + 6, lidY - slant);
      ctx.stroke();
      ctx.restore();
      line(ctx, 5, 'rgba(110,70,120,0.55)');
      ctx.beginPath();
      ctx.arc(ox, eyeY + 12, r * 0.95, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    }
  }
  if (L.glasses) {
    line(ctx, 8);
    for (const sgn of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(cx + tx + sgn * ex, eyeY, 33, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(cx + tx - ex + 33, eyeY - 4);
    ctx.lineTo(cx + tx + ex - 33, eyeY - 4);
    ctx.stroke();
  }

  // bigode
  const mx = cx + tx * 1.1;
  const my = cy + 76;
  if (L.mustache !== 'nenhuma') {
    ctx.fillStyle = L.hairStyle === 'grisalho' ? '#6a6472' : L.hair;
    line(ctx, 6);
    ctx.beginPath();
    if (L.mustache === 'fina') {
      ctx.moveTo(mx - 42, my + 6);
      ctx.quadraticCurveTo(mx - 18, my - 16, mx, my - 6);
      ctx.quadraticCurveTo(mx + 18, my - 16, mx + 42, my + 6);
      ctx.quadraticCurveTo(mx + 18, my - 4, mx, my + 4);
      ctx.quadraticCurveTo(mx - 18, my - 4, mx - 42, my + 6);
    } else {
      ctx.moveTo(mx - 64, my + 20);
      ctx.bezierCurveTo(mx - 56, my - 26, mx - 12, my - 24, mx, my - 8);
      ctx.bezierCurveTo(mx + 12, my - 24, mx + 56, my - 26, mx + 64, my + 20);
      ctx.bezierCurveTo(mx + 44, my + 8, mx + 16, my + 10, mx, my + 6);
      ctx.bezierCurveTo(mx - 16, my + 10, mx - 44, my + 8, mx - 64, my + 20);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  // boca
  const mo = my + 36;
  line(ctx, 9);
  if (e === 'surpreso') {
    ctx.fillStyle = '#4a1020';
    ctx.beginPath();
    ctx.ellipse(mx, mo + 6, 16, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (e === 'sorriso' || e === 'encantado') {
    ctx.fillStyle = '#4a1020';
    ctx.beginPath();
    ctx.moveTo(mx - 32, mo - 4);
    ctx.quadraticCurveTo(mx, mo + 40, mx + 32, mo - 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (e === 'confiante') {
    ctx.beginPath();
    ctx.moveTo(mx - 28, mo - 2);
    ctx.quadraticCurveTo(mx, mo + 18, mx + 28, mo - 3);
    ctx.stroke();
  } else if (e === 'astuto') {
    ctx.beginPath();
    ctx.moveTo(mx - 26, mo + 6);
    ctx.quadraticCurveTo(mx + 6, mo + 14, mx + 32, mo - 8);
    ctx.lineTo(mx + 38, mo - 16);
    ctx.stroke();
  } else if (e === 'bravo') {
    ctx.beginPath();
    ctx.moveTo(mx - 28, mo + 16);
    ctx.quadraticCurveTo(mx, mo - 12, mx + 28, mo + 16);
    ctx.stroke();
  } else if (e === 'preocupado') {
    ctx.beginPath();
    ctx.moveTo(mx - 30, mo + 6);
    for (let i = 0; i < 4; i++) ctx.quadraticCurveTo(mx - 30 + i * 15 + 7, mo - (i % 2 ? -8 : 8) + 6, mx - 30 + (i + 1) * 15, mo + 6);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(mx - 18, mo + 4);
    ctx.lineTo(mx + 18, mo + 4);
    ctx.stroke();
  }

  // gota de suor
  const sw = S.sweat ?? 0;
  if (sw > 0) {
    const sy = cy - 70 + sw * 70;
    ctx.fillStyle = '#7fc8ff';
    line(ctx, 6);
    ctx.beginPath();
    ctx.moveTo(cx + 92, sy - 24);
    ctx.quadraticCurveTo(cx + 116, sy + 6, cx + 92, sy + 16);
    ctx.quadraticCurveTo(cx + 68, sy + 6, cx + 92, sy - 24);
    ctx.fill();
    ctx.stroke();
  }

  // chapéus
  if (L.hat) {
    const base = cy - 60;
    ctx.fillStyle = L.hat === 'cartola' ? '#1d1a22' : L.hat === 'fedora' ? '#4a4038' : '#26211f';
    line(ctx, 13);
    if (L.hat === 'cartola') {
      ctx.beginPath();
      ctx.ellipse(cx, base + 12, 150, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.rect(cx - 92, base - 190, 184, 196);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#6b5a8a';
      ctx.fillRect(cx - 90, base - 46, 180, 26);
    } else {
      const wide = L.hat === 'fedora' ? 175 : 150;
      ctx.beginPath();
      ctx.ellipse(cx, base + 10, wide, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 100, base + 4);
      ctx.bezierCurveTo(cx - 108, base - 130, cx + 108, base - 130, cx + 100, base + 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = L.hat === 'fedora' ? '#3a2a6a' : '#6b2a46';
      ctx.fillRect(cx - 100, base - 40, 200, 26);
    }
  }
  ctx.restore();
}

export function drawCharacter2(ctx: CanvasRenderingContext2D, L: Look, S: State, scale: number, light: Light) {
  const cv = ctx.canvas;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.setTransform(scale, 0, 0, scale, 200 * scale, 100 * scale);
  const B = L.build;
  const cx = 300;
  const bw = 112 * B;

  // ----- pernas (linhas)
  const walk = S.walk;
  const hipY = 668 + S.bob * 0.35;
  for (const sgn of [-1, 1]) {
    const hx = cx + sgn * 46 * B;
    const sw = walk === undefined ? 0 : Math.sin(walk) * sgn * 62;
    const lift = walk === undefined ? 0 : Math.max(0, Math.sin(walk + (sgn > 0 ? 0 : Math.PI))) * 30;
    line(ctx, 15);
    ctx.beginPath();
    ctx.moveTo(hx, hipY);
    ctx.quadraticCurveTo(hx + sw * 0.4, 820 - lift * 0.5, hx + sw, 948 - lift);
    ctx.stroke();
    ctx.fillStyle = INK2;
    ctx.beginPath();
    ctx.ellipse(hx + sw + sgn * 14, 958 - lift, 36, 15, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ----- tronco + cabeça (giram juntos na cintura)
  ctx.save();
  ctx.translate(cx, hipY);
  ctx.rotate(rad(S.lean) * 0.7);
  ctx.translate(-cx, -hipY);
  const top = 330 + S.bob;
  // corpo
  ctx.beginPath();
  ctx.roundRect(cx - bw, top, bw * 2, hipY - top + 8, bw);
  ctx.fillStyle = L.suit;
  ctx.fill();
  ctx.save();
  ctx.clip();
  // colete / camisa / gravata / lapelas
  ctx.fillStyle = L.vest ?? L.shirt;
  ctx.beginPath();
  ctx.moveTo(cx - 44, top + 6);
  ctx.lineTo(cx + 44, top + 6);
  ctx.lineTo(cx + 30, top + 250);
  ctx.lineTo(cx - 30, top + 250);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = L.shirt;
  ctx.beginPath();
  ctx.moveTo(cx - 34, top + 6);
  ctx.lineTo(cx, top + 78);
  ctx.lineTo(cx + 34, top + 6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = L.tie;
  ctx.beginPath();
  ctx.moveTo(cx - 11, top + 40);
  ctx.lineTo(cx + 11, top + 40);
  ctx.lineTo(cx + 15, top + 190);
  ctx.lineTo(cx, top + 212);
  ctx.lineTo(cx - 15, top + 190);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = L.suitDark;
  line(ctx, 8);
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + s * 40, top + 2);
    ctx.lineTo(cx + s * 30, top + 250);
    ctx.lineTo(cx + s * 86, top + 130);
    ctx.lineTo(cx + s * 70, top + 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = INK2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(cx + 2, top + 270 + i * 62, 8.5, 0, Math.PI * 2);
    ctx.fill();
  }
  if (L.pocketSquare) {
    ctx.fillStyle = L.pocketSquare;
    ctx.beginPath();
    ctx.moveTo(cx + 70, top + 190);
    ctx.lineTo(cx + 104, top + 178);
    ctx.lineTo(cx + 100, top + 206);
    ctx.lineTo(cx + 72, top + 206);
    ctx.closePath();
    ctx.fill();
  }
  if (L.chain) {
    line(ctx, 7, '#d7a93a');
    ctx.beginPath();
    ctx.moveTo(cx - 36, top + 244);
    ctx.quadraticCurveTo(cx, top + 292, cx + 56, top + 250);
    ctx.stroke();
  }
  ctx.restore();
  line(ctx, 15);
  ctx.beginPath();
  ctx.roundRect(cx - bw, top, bw * 2, hipY - top + 8, bw);
  ctx.stroke();

  // braços (linhas finas) e mãos
  const sy = top + 70;
  for (const [side, a] of [[-1, S.aL], [1, S.aR]] as const) {
    const sx = cx + side * (bw - 14);
    const h = limb(ctx, sx, sy, a[0], a[1], 135, 128);
    ctx.fillStyle = INK2;
    ctx.beginPath();
    ctx.arc(h.hx, h.hy, 20, 0, Math.PI * 2);
    ctx.fill();
    if (S.prop && S.propHand === (side > 0 ? 'R' : 'L')) drawProp(ctx, S, h.hx, h.hy);
  }

  drawHead(ctx, L, S, cx, 205 + S.bob);
  ctx.restore();

  // ----- luz da cena por cima de tudo (só onde há personagem)
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'source-atop';
  const W = cv.width;
  const H = cv.height;
  ctx.fillStyle = hexA(light.amb, light.ambAmt);
  ctx.fillRect(0, 0, W, H);
  const lx = light.from[0];
  const ly = light.from[1];
  const g = ctx.createLinearGradient(W / 2 + lx * W * 0.55, H / 2 + ly * H * 0.55, W / 2 - lx * W * 0.45, H / 2 - ly * H * 0.45);
  g.addColorStop(0, hexA(light.key, light.keyAmt));
  g.addColorStop(0.6, hexA(light.key, light.keyAmt * 0.18));
  g.addColorStop(1, hexA(light.key, 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
