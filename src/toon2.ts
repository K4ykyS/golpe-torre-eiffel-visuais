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
  if (S.prop === 'maquina') {
    // máquina de cortar cabelo: corpo preto arredondado, lâmina prateada para cima
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(0.25);
    line(ctx, 8);
    ctx.fillStyle = '#2a2836';
    ctx.beginPath();
    ctx.roundRect(-22, -120, 44, 140, 18);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#c9ccd6';
    ctx.fillRect(-26, -142, 52, 24);
    ctx.strokeRect(-26, -142, 52, 24);
    line(ctx, 3);
    for (let i = -20; i <= 20; i += 8) { ctx.beginPath(); ctx.moveTo(i, -142); ctx.lineTo(i, -132); ctx.stroke(); }
    ctx.fillStyle = '#d94a3a';
    ctx.beginPath();
    ctx.arc(0, -70, 7, 0, 7);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(-14, -110, 6, 80);
    ctx.restore();
    return;
  }
  if (S.prop === 'lapis') {
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(0.5);
    line(ctx, 7);
    ctx.fillStyle = '#3a2a22';
    ctx.fillRect(-9, -130, 18, 140);
    ctx.strokeRect(-9, -130, 18, 140);
    ctx.fillStyle = '#e8c89a';
    ctx.beginPath();
    ctx.moveTo(-9, -130);
    ctx.lineTo(9, -130);
    ctx.lineTo(0, -160);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = INK2;
    ctx.beginPath();
    ctx.moveTo(-3, -150);
    ctx.lineTo(3, -150);
    ctx.lineTo(0, -160);
    ctx.fill();
    ctx.restore();
    return;
  }
  if (S.prop === 'algodao') {
    line(ctx, 7);
    ctx.fillStyle = '#f6f4fa';
    for (const [x, y, r] of [[-14, -26, 22], [12, -30, 24], [0, -48, 22], [-4, -18, 20]] as const) {
      ctx.beginPath();
      ctx.arc(hx + x, hy + y, r, 0, 7);
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = '#f6f4fa';
    ctx.beginPath();
    ctx.arc(hx, hy - 30, 26, 0, 7);
    ctx.fill();
    ctx.fillStyle = 'rgba(60,50,70,0.55)';
    ctx.beginPath();
    ctx.ellipse(hx + 4, hy - 40, 14, 6, 0.3, 0, 7);
    ctx.fill();
    return;
  }
  if (S.prop === 'maquininha') {
    // maquininha de cartão, tela virada para o cliente
    ctx.save();
    ctx.translate(hx, hy);
    line(ctx, 8);
    ctx.fillStyle = '#3a3a48';
    ctx.beginPath();
    ctx.roundRect(-44, -150, 88, 160, 16);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#9ad8a8';
    ctx.fillRect(-32, -136, 64, 44);
    ctx.strokeRect(-32, -136, 64, 44);
    ctx.fillStyle = '#16132b';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('R$ 80', 0, -106);
    ctx.fillStyle = '#d9d6e4';
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) ctx.fillRect(-28 + c * 22, -78 + r * 22, 14, 14);
    ctx.restore();
    return;
  }
  if (S.prop === 'camera') {
    // câmera DSLR: corpo preto, lente apontando para a direita do cartão
    ctx.save();
    ctx.translate(hx, hy);
    ctx.fillStyle = '#26242e';
    line(ctx, 9);
    ctx.beginPath();
    ctx.roundRect(-62, -44, 124, 80, 12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#3a3744';
    ctx.beginPath();
    ctx.roundRect(-34, -62, 52, 22, 6); // topo (pentaprisma)
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#1a1820';
    ctx.beginPath();
    ctx.roundRect(54, -34, 62, 60, 8); // lente
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#6fa8d8';
    ctx.beginPath();
    ctx.ellipse(116, -4, 9, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#c9c9d4';
    ctx.fillRect(-52, -34, 22, 12);
    ctx.restore();
    return;
  }
  if (S.prop === 'chave') {
    ctx.save();
    ctx.translate(hx, hy);
    line(ctx, 8);
    ctx.fillStyle = '#e2c45a';
    ctx.beginPath();
    ctx.arc(0, -30, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#16132b';
    ctx.beginPath();
    ctx.arc(0, -30, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e2c45a';
    ctx.beginPath();
    ctx.rect(-8, -8, 16, 80);
    ctx.rect(8, 40, 18, 10);
    ctx.rect(8, 58, 14, 10);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return;
  }
  if (S.prop === 'celular') {
    ctx.save();
    ctx.translate(hx, hy);
    line(ctx, 9);
    ctx.fillStyle = '#1e1c26';
    ctx.beginPath();
    ctx.roundRect(-52, -150, 104, 190, 16);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#e9eef8';
    ctx.fillRect(-40, -134, 80, 158);
    ctx.fillStyle = '#f2b81e';
    for (let i = 0; i < 5; i++) {
      const x0 = -32 + i * 16, y0 = -60;
      ctx.beginPath();
      for (let k = 0; k < 10; k++) {
        const r = k % 2 ? 3.2 : 7.5, a = -Math.PI / 2 + (k * Math.PI) / 5;
        ctx.lineTo(x0 + r * Math.cos(a), y0 + r * Math.sin(a));
      }
      ctx.fill();
    }
    ctx.fillStyle = '#b8c0d4';
    ctx.fillRect(-30, -30, 60, 6);
    ctx.fillRect(-30, -18, 42, 6);
    ctx.restore();
    return;
  }
  if (S.prop === 'escova') {
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(-0.5);
    line(ctx, 8);
    ctx.fillStyle = '#4ab0d8';
    ctx.fillRect(-8, -110, 16, 120);
    ctx.strokeRect(-8, -110, 16, 120);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-14, -140, 22, 34);
    ctx.strokeRect(-14, -140, 22, 34);
    ctx.restore();
    return;
  }
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

  if (L.hairStyle === 'coque') {
    // coque no alto e cabelo caindo atrás das orelhas
    ctx.fillStyle = L.hair;
    line(ctx, 11);
    ctx.beginPath();
    ctx.ellipse(cx + 10, cy - R - 28, 58, 50, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, cy - 14, R + 14, R - 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  if (L.earrings) {
    ctx.fillStyle = '#e8c04a';
    line(ctx, 6);
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(cx + s * (R - 2), cy + 40, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
  // cabeça
  ctx.beginPath();
  ctx.ellipse(cx, cy, R, R * 1.03, 0, 0, Math.PI * 2);
  ctx.fillStyle = L.skin;
  ctx.fill();

  // cabelo (calota com franja reta)
  ctx.save();
  ctx.clip();
  const hu = L.fringeUp ?? 0;
  if (L.hairStyle !== 'calvo') {
    ctx.fillStyle = L.hair;
    ctx.beginPath();
    ctx.moveTo(cx - R - 10, cy - R - 10);
    ctx.lineTo(cx + R + 10, cy - R - 10);
    ctx.lineTo(cx + R + 10, cy - 32 - hu);
    ctx.quadraticCurveTo(cx + 20, cy - 26 - hu + tx * 0.1, cx - R - 10, cy - 38 - hu);
    ctx.closePath();
    ctx.fill();
    line(ctx, 11);
    ctx.beginPath();
    ctx.moveTo(cx + R + 10, cy - 32 - hu);
    ctx.quadraticCurveTo(cx + 20, cy - 26 - hu, cx - R - 10, cy - 38 - hu);
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
    const bm = S.brows ? S.brows[sgn < 0 ? 0 : 1] : 'normal';
    const by = eyeY - 34 + browLift;
    if (bm === 'normal') {
      line(ctx, 10, bc);
      ctx.beginPath();
      ctx.moveTo(ox - sgn * 24, by + browTilt * -24);
      ctx.quadraticCurveTo(ox, by - 8, ox + sgn * 24, by + browTilt * 24 + 3);
      ctx.stroke();
    } else if (bm === 'raspada') {
      // metade de dentro fica; a de fora vira pele lisa com pontinhos
      line(ctx, 10, bc);
      ctx.beginPath();
      ctx.moveTo(ox - sgn * 24, by + browTilt * -24);
      ctx.quadraticCurveTo(ox - sgn * 10, by - 6, ox - sgn * 2, by - 5);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,226,206,0.7)';
      ctx.beginPath();
      ctx.ellipse(ox + sgn * 12, by - 3, 17, 8, 0, 0, 7);
      ctx.fill();
      ctx.fillStyle = 'rgba(40,30,50,0.7)';
      for (let k = 0; k < 7; k++) {
        ctx.beginPath();
        ctx.arc(ox + sgn * (2 + (k % 4) * 7), by - 7 + Math.floor(k / 4) * 6 + (k % 2) * 2, 1.6, 0, 7);
        ctx.fill();
      }
    } else if (bm === 'desenhada') {
      // risco de lápis lá no alto, arqueado e julgador
      line(ctx, 11, '#2a1e1a');
      const hy0 = by - 22;
      ctx.beginPath();
      ctx.moveTo(ox - sgn * 22, hy0 + 14);
      ctx.quadraticCurveTo(ox + sgn * 2, hy0 - 26, ox + sgn * 30, hy0 + 2);
      ctx.stroke();
    } else {
      // borrada: mancha cinza esfregada
      ctx.fillStyle = 'rgba(70,60,80,0.55)';
      ctx.beginPath();
      ctx.ellipse(ox + sgn * 4, by - 26, 34, 15, sgn * -0.2, 0, 7);
      ctx.fill();
      ctx.fillStyle = 'rgba(40,30,40,0.6)';
      ctx.beginPath();
      ctx.ellipse(ox + sgn * 6, by - 30, 22, 7, sgn * -0.3, 0, 7);
      ctx.fill();
    }

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
  if (L.beard) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, R - 4, R * 1.03 - 4, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = L.hair;
    ctx.beginPath();
    ctx.moveTo(cx - R, cy + 10);
    ctx.quadraticCurveTo(cx - R + 20, cy + 62, cx + tx - 50, my - 6);
    ctx.lineTo(cx + tx + 50, my - 6);
    ctx.quadraticCurveTo(cx + R - 20, cy + 62, cx + R, cy + 10);
    ctx.lineTo(cx + R, cy + R + 20);
    ctx.lineTo(cx - R, cy + R + 20);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = L.skin;
    ctx.beginPath();
    ctx.ellipse(mx, my + 22, 36, 22, 0, 0, 7);
    ctx.fill();
    ctx.restore();
  }
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
  const talk = S.talk ?? 0;
  if (talk > 0.06) {
    ctx.fillStyle = '#4a1020';
    ctx.beginPath();
    ctx.ellipse(mx, mo + 6, 14 + talk * 14, 4 + talk * 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (e === 'surpreso') {
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
    ctx.fillStyle = L.hat === 'cartola' ? '#1d1a22' : L.hat === 'fedora' ? '#4a4038' : L.hat === 'bucket' ? '#b8a46a' : '#26211f';
    line(ctx, 13);
    if (L.hat === 'bucket') {
      // chapéu de pescador (turista): aba caída e copa baixa
      ctx.beginPath();
      ctx.moveTo(cx - 100, base - 70);
      ctx.lineTo(cx + 100, base - 70);
      ctx.lineTo(cx + 124, base + 8);
      ctx.lineTo(cx - 124, base + 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, base + 12, 168, 26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#7a6a3a';
      ctx.fillRect(cx - 118, base - 22, 236, 18);
    } else if (L.hat === 'cartola') {
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
  for (const sgn of S.seated ? [] : [-1, 1]) {
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
  if (L.casual === 'capa') {
    // canelas e sapatos saindo da capa, e a saia da capa por cima dos joelhos
    for (const sgn of [-1, 1]) {
      line(ctx, 15);
      ctx.beginPath();
      ctx.moveTo(cx + sgn * 50, 860);
      ctx.lineTo(cx + sgn * 54, 948);
      ctx.stroke();
      ctx.fillStyle = INK2;
      ctx.beginPath();
      ctx.ellipse(cx + sgn * 66, 958, 36, 15, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = L.suit;
    line(ctx, 15);
    ctx.beginPath();
    ctx.moveTo(cx - bw, hipY - 120);
    ctx.lineTo(cx + bw, hipY - 120);
    ctx.lineTo(cx + bw + 40, 880);
    ctx.quadraticCurveTo(cx, 900, cx - bw - 40, 880);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  // corpo
  ctx.beginPath();
  ctx.roundRect(cx - bw, top, bw * 2, hipY - top + 8, bw);
  ctx.fillStyle = L.suit;
  ctx.fill();
  ctx.save();
  ctx.clip();
  if (L.casual) {
    if (L.casual === 'capa') {
      // capa de barbeiro listrada com tira de papel no pescoço
      line(ctx, 4, 'rgba(255,255,255,0.22)');
      for (let x = -140; x <= 140; x += 34) {
        ctx.beginPath();
        ctx.moveTo(cx + x, top);
        ctx.lineTo(cx + x * 1.1, hipY + 10);
        ctx.stroke();
      }
      ctx.fillStyle = '#f4f2ea';
      ctx.fillRect(cx - 60, top - 4, 120, 26);
      line(ctx, 7);
      ctx.strokeRect(cx - 60, top - 4, 120, 26);
    } else if (L.casual === 'avental') {
      // camiseta escura + avental de couro com bolso e pente
      ctx.fillStyle = L.skin;
      ctx.beginPath();
      ctx.ellipse(cx, top + 2, 42, 32, 0, 0, Math.PI);
      ctx.fill();
      line(ctx, 8);
      ctx.stroke();
      ctx.fillStyle = L.vest ?? '#7a4a2a';
      ctx.beginPath();
      ctx.roundRect(cx - 84, top + 96, 168, 400, 18);
      ctx.fill();
      ctx.stroke();
      line(ctx, 9, L.vest ?? '#7a4a2a');
      ctx.beginPath();
      ctx.moveTo(cx - 70, top + 100);
      ctx.lineTo(cx - 40, top + 4);
      ctx.moveTo(cx + 70, top + 100);
      ctx.lineTo(cx + 40, top + 4);
      ctx.stroke();
      line(ctx, 7);
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(cx - 50, top + 170, 100, 64);
      ctx.strokeRect(cx - 50, top + 170, 100, 64);
      ctx.fillStyle = '#e8e2d0';
      ctx.fillRect(cx - 34, top + 150, 12, 40);
      ctx.fillStyle = '#d94a3a';
      ctx.fillRect(cx + 12, top + 146, 10, 44);
    } else if (L.casual === 'colete') {
      // camisa clara com colete de bolsos (turista fotógrafo)
      ctx.fillStyle = L.shirt;
      ctx.beginPath();
      ctx.moveTo(cx - 40, top + 4);
      ctx.lineTo(cx + 40, top + 4);
      ctx.lineTo(cx + 30, top + 300);
      ctx.lineTo(cx - 30, top + 300);
      ctx.closePath();
      ctx.fill();
      line(ctx, 7);
      for (const s of [-1, 1]) {
        ctx.fillStyle = L.vest ?? L.suit;
        ctx.beginPath();
        ctx.moveTo(cx + s * 38, top + 2);
        ctx.lineTo(cx + s * 26, top + 300);
        ctx.lineTo(cx + s * 120, top + 300);
        ctx.lineTo(cx + s * 120, top + 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = L.suitDark;
        ctx.fillRect(cx + s * 52 - (s > 0 ? 0 : 50), top + 150, 50, 46);
        ctx.strokeRect(cx + s * 52 - (s > 0 ? 0 : 50), top + 150, 50, 46);
        ctx.fillRect(cx + s * 52 - (s > 0 ? 0 : 50), top + 215, 50, 46);
        ctx.strokeRect(cx + s * 52 - (s > 0 ? 0 : 50), top + 215, 50, 46);
      }
      ctx.fillStyle = L.skin;
      ctx.beginPath();
      ctx.moveTo(cx - 30, top + 4);
      ctx.lineTo(cx, top + 56);
      ctx.lineTo(cx + 30, top + 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // camiseta: gola redonda, dobras
      ctx.fillStyle = L.skin;
      ctx.beginPath();
      ctx.ellipse(cx, top + 2, 46, 36, 0, 0, Math.PI);
      ctx.fill();
      line(ctx, 8);
      ctx.beginPath();
      ctx.ellipse(cx, top + 2, 46, 36, 0, 0, Math.PI);
      ctx.stroke();
      line(ctx, 5, 'rgba(20,10,40,0.30)');
      ctx.beginPath();
      ctx.moveTo(cx - 60, top + 170);
      ctx.quadraticCurveTo(cx - 20, top + 190, cx + 30, top + 176);
      ctx.moveTo(cx + 40, top + 90);
      ctx.quadraticCurveTo(cx + 62, top + 120, cx + 54, top + 150);
      ctx.stroke();
    }
    if (L.strap) {
      line(ctx, 15, '#2a2630');
      ctx.beginPath();
      ctx.moveTo(cx - 62, top - 4);
      ctx.lineTo(cx + 96, top + 300);
      ctx.stroke();
    }
  } else {
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
  }
  ctx.restore();
  line(ctx, 15);
  ctx.beginPath();
  ctx.roundRect(cx - bw, top, bw * 2, hipY - top + 8, bw);
  ctx.stroke();

  // braços (linhas finas) e mãos
  const sy = top + 70;
  for (const [side, a] of [[-1, S.aL], [1, S.aR]] as const) {
    if (L.casual === 'capa') break; // braços escondidos sob a capa
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
