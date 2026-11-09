// Personagens 2D (proporções adultas ~7 cabeças) desenhados em Canvas2D, com contorno de tinta.
// Canvas de projeto: 600 x 1000. Solas em y = 975. Ângulos: 0 = pendurado, 90 = aponta p/ direita da tela, 180 = para cima.
export const INK = '#241726';
export const DW = 600;
export const DH = 1000;

export type Expr = 'neutro' | 'astuto' | 'surpreso' | 'encantado' | 'preocupado' | 'lendo' | 'sorriso';

export type Look = {
  skin: string;
  hair: string;
  suit: string;
  suitDark: string;
  shirt: string;
  tie: string;
  vest?: string;
  trousers: string;
  build: number; // 1 = normal; >1 mais largo
  mustache: 'fina' | 'farta' | 'nenhuma';
  hat?: 'bowler' | 'cartola' | null;
  glasses?: boolean;
  hairStyle: 'liso' | 'calvo' | 'grisalho';
  pocketSquare?: string;
  chain?: boolean;
};

export type Prop = null | 'papel' | 'maleta';

export type State = {
  expr: Expr;
  look: [number, number]; // direção do olhar (-1..1)
  turn: number; // virar a cabeça (-1..1)
  blink: number; // 0 aberto, 1 fechado
  aL: [number, number]; // braço no lado ESQUERDO da tela [braço, antebraço]
  aR: [number, number];
  lean: number; // inclina o tronco (graus)
  bob: number; // sobe/desce em px de projeto
  sweat?: number; // 0..1
  browPump?: number; // -1..1 extra
  prop?: Prop;
  propHand?: 'L' | 'R';
  headTilt?: number; // graus
};

const rad = (d: number) => (d * Math.PI) / 180;

function ink(ctx: CanvasRenderingContext2D, w = 7) {
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = INK;
  ctx.lineWidth = w;
}

function limb(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  a1: number,
  a2: number,
  l1: number,
  l2: number,
  w: number,
  color: string,
) {
  const ex = sx + Math.sin(rad(a1)) * l1;
  const ey = sy + Math.cos(rad(a1)) * l1;
  const hx = ex + Math.sin(rad(a2)) * l2;
  const hy = ey + Math.cos(rad(a2)) * l2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = INK;
  ctx.lineWidth = w + 11;
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.lineTo(hx, hy);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.lineTo(hx, hy);
  ctx.stroke();
  return { hx, hy, ex, ey };
}

function drawHead(ctx: CanvasRenderingContext2D, L: Look, S: State, cx: number, cy: number) {
  const hw = 64;
  const hh = 78;
  const tx = S.turn * 16;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rad(S.headTilt ?? 0));
  ctx.translate(-cx, -cy);

  // orelhas
  ctx.fillStyle = L.skin;
  ink(ctx, 6);
  for (const sgn of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(cx + sgn * (hw * 1.0) + tx * 0.4, cy + 6, 11, 19, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // cabeça em "feijão"
  ctx.beginPath();
  ctx.moveTo(cx, cy - hh);
  ctx.bezierCurveTo(cx + hw * 1.3, cy - hh, cx + hw * 1.12, cy + hh * 0.5, cx + hw * 0.42, cy + hh);
  ctx.bezierCurveTo(cx + hw * 0.18, cy + hh * 1.07, cx - hw * 0.18, cy + hh * 1.07, cx - hw * 0.42, cy + hh);
  ctx.bezierCurveTo(cx - hw * 1.12, cy + hh * 0.5, cx - hw * 1.3, cy - hh, cx, cy - hh);
  ctx.closePath();
  ctx.fillStyle = L.skin;
  ctx.fill();
  ink(ctx, 8);
  ctx.stroke();

  // sombra suave no lado oposto à luz
  ctx.save();
  ctx.clip();
  ctx.fillStyle = 'rgba(120,50,40,0.14)';
  ctx.beginPath();
  ctx.ellipse(cx + hw * 1.1, cy + 20, hw * 0.7, hh * 1.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // cabelo
  if (L.hairStyle !== 'calvo') {
    ctx.fillStyle = L.hair;
    ink(ctx, 6);
    ctx.beginPath();
    ctx.moveTo(cx - hw * 1.05, cy - 6);
    ctx.bezierCurveTo(cx - hw * 1.3, cy - hh * 1.05, cx - hw * 0.3, cy - hh * 1.2, cx + tx * 0.5, cy - hh * 1.04);
    ctx.bezierCurveTo(cx + hw * 0.8, cy - hh * 1.2, cx + hw * 1.34, cy - hh * 0.9, cx + hw * 1.04, cy - 8);
    ctx.bezierCurveTo(cx + hw * 0.9, cy - hh * 0.55, cx + hw * 0.4, cy - hh * 0.62, cx - hw * 0.1, cy - hh * 0.64);
    ctx.bezierCurveTo(cx - hw * 0.7, cy - hh * 0.6, cx - hw * 0.95, cy - hh * 0.45, cx - hw * 1.05, cy - 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    if (L.hairStyle === 'liso') {
      ctx.strokeStyle = 'rgba(255,255,255,0.28)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - hw * 0.5, cy - hh * 0.86);
      ctx.quadraticCurveTo(cx, cy - hh * 0.98, cx + hw * 0.6, cy - hh * 0.8);
      ctx.stroke();
    }
  }

  // olhos
  const eyeY = cy - 6;
  const ex = hw * 0.42;
  const e = S.expr;
  const open = (e === 'surpreso' ? 1.25 : e === 'astuto' ? 0.62 : e === 'lendo' ? 0.7 : e === 'encantado' ? 0.8 : e === 'sorriso' ? 0.78 : 1) * (1 - S.blink);
  const sweatDrop = S.sweat ?? 0;

  // sobrancelhas
  const pump = S.browPump ?? 0;
  let browLift = 0;
  let browTilt = 0; // + = ponta interna para cima (preocupado)
  if (e === 'surpreso') { browLift = -16; browTilt = 0; }
  if (e === 'astuto') { browLift = -2; browTilt = -0.28; }
  if (e === 'preocupado') { browLift = -9; browTilt = 0.38; }
  if (e === 'encantado') { browLift = -9; browTilt = 0.1; }
  if (e === 'lendo') { browLift = 0; browTilt = 0.1; }
  browLift -= pump * 14;
  ink(ctx, 7);
  ctx.strokeStyle = L.hairStyle === 'grisalho' ? '#6b6470' : L.hair === '#e8e2d4' ? '#8a8478' : INK;
  for (const sgn of [-1, 1]) {
    const bx = cx + sgn * ex + tx;
    const by = eyeY - 34 + browLift;
    ctx.beginPath();
    ctx.moveTo(bx - sgn * 22, by + browTilt * -22 * 1);
    ctx.quadraticCurveTo(bx, by - 8, bx + sgn * 22, by + browTilt * 22 + 4);
    // inner = perto do centro (sgn*-22) ; preocupado: interna sobe
    ctx.stroke();
  }

  // olhos
  for (const sgn of [-1, 1]) {
    const ox = cx + sgn * ex + tx;
    ctx.fillStyle = '#fbf7ee';
    ink(ctx, 5);
    ctx.beginPath();
    ctx.ellipse(ox, eyeY, 16, 13 * Math.max(open, 0.06), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (open > 0.15) {
      ctx.fillStyle = INK;
      const px = ox + S.look[0] * 8;
      const py = eyeY + S.look[1] * 6;
      ctx.beginPath();
      ctx.arc(px, py, e === 'surpreso' ? 5 : 7, 0, Math.PI * 2);
      ctx.fill();
    }
    if (e === 'astuto' || e === 'lendo') {
      // pálpebra superior pesada
      ctx.fillStyle = L.skin;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(ox - 19, eyeY - 1);
      ctx.lineTo(ox + 19, eyeY - 1);
      ctx.lineTo(ox + 19, eyeY - 12);
      ctx.lineTo(ox - 19, eyeY - 12);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(ox - 18, eyeY - 1);
      ctx.lineTo(ox + 18, eyeY - 1);
      ctx.stroke();
    }
  }

  if (L.glasses) {
    ink(ctx, 5);
    for (const sgn of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(cx + sgn * ex + tx, eyeY, 24, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(cx - ex + 24 + tx, eyeY - 3);
    ctx.lineTo(cx + ex - 24 + tx, eyeY - 3);
    ctx.stroke();
  }

  // nariz
  ink(ctx, 6);
  ctx.fillStyle = 'rgba(160,70,50,0.18)';
  ctx.beginPath();
  ctx.moveTo(cx + tx * 1.4, eyeY + 6);
  ctx.quadraticCurveTo(cx + tx * 1.4 + 16, eyeY + 32, cx + tx * 1.4 + 3, eyeY + 40);
  ctx.quadraticCurveTo(cx + tx * 1.4 - 8, eyeY + 42, cx + tx * 1.4 - 12, eyeY + 38);
  ctx.stroke();

  // bigode
  const my = eyeY + 50;
  const mxc = cx + tx * 1.2;
  if (L.mustache !== 'nenhuma') {
    ctx.fillStyle = L.mustache === 'farta' ? (L.hairStyle === 'grisalho' ? '#6f6a72' : L.hair) : L.hair;
    ink(ctx, 5);
    ctx.beginPath();
    if (L.mustache === 'fina') {
      ctx.moveTo(mxc - 34, my + 4);
      ctx.quadraticCurveTo(mxc - 14, my - 12, mxc, my - 4);
      ctx.quadraticCurveTo(mxc + 14, my - 12, mxc + 34, my + 4);
      ctx.quadraticCurveTo(mxc + 14, my - 2, mxc, my + 3);
      ctx.quadraticCurveTo(mxc - 14, my - 2, mxc - 34, my + 4);
    } else {
      ctx.moveTo(mxc - 52, my + 14);
      ctx.bezierCurveTo(mxc - 44, my - 20, mxc - 10, my - 18, mxc, my - 6);
      ctx.bezierCurveTo(mxc + 10, my - 18, mxc + 44, my - 20, mxc + 52, my + 14);
      ctx.bezierCurveTo(mxc + 36, my + 6, mxc + 14, my + 8, mxc, my + 4);
      ctx.bezierCurveTo(mxc - 14, my + 8, mxc - 36, my + 6, mxc - 52, my + 14);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // boca
  const mouthY = my + 24;
  ink(ctx, 6);
  ctx.fillStyle = '#5b1a22';
  if (e === 'surpreso') {
    ctx.beginPath();
    ctx.ellipse(mxc, mouthY + 6, 14, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (e === 'encantado' || e === 'sorriso') {
    ctx.beginPath();
    ctx.moveTo(mxc - 30, mouthY - 6);
    ctx.quadraticCurveTo(mxc, mouthY + 34, mxc + 30, mouthY - 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fbf7ee';
    ctx.beginPath();
    ctx.moveTo(mxc - 24, mouthY - 3);
    ctx.quadraticCurveTo(mxc, mouthY + 6, mxc + 24, mouthY - 3);
    ctx.lineTo(mxc + 22, mouthY + 3);
    ctx.quadraticCurveTo(mxc, mouthY + 12, mxc - 22, mouthY + 3);
    ctx.closePath();
    ctx.fill();
  } else if (e === 'astuto') {
    ctx.beginPath();
    ctx.moveTo(mxc - 24, mouthY + 4);
    ctx.quadraticCurveTo(mxc + 6, mouthY + 10, mxc + 30, mouthY - 8);
    ctx.stroke();
  } else if (e === 'preocupado') {
    ctx.beginPath();
    ctx.moveTo(mxc - 22, mouthY + 12);
    ctx.quadraticCurveTo(mxc, mouthY - 6, mxc + 22, mouthY + 12);
    ctx.stroke();
  } else if (e === 'lendo') {
    ctx.beginPath();
    ctx.moveTo(mxc - 16, mouthY + 4);
    ctx.lineTo(mxc + 16, mouthY + 4);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(mxc - 18, mouthY + 2);
    ctx.quadraticCurveTo(mxc, mouthY + 8, mxc + 18, mouthY + 2);
    ctx.stroke();
  }

  // gota de suor
  if (sweatDrop > 0) {
    const sy = cy - hh * 0.7 + sweatDrop * 40;
    ctx.fillStyle = '#bfe3f5';
    ink(ctx, 4);
    ctx.beginPath();
    ctx.moveTo(cx + hw * 0.95, sy - 18);
    ctx.quadraticCurveTo(cx + hw * 1.2, sy + 6, cx + hw * 0.95, sy + 12);
    ctx.quadraticCurveTo(cx + hw * 0.7, sy + 6, cx + hw * 0.95, sy - 18);
    ctx.fill();
    ctx.stroke();
  }

  // chapéu
  if (L.hat === 'bowler') {
    ctx.fillStyle = '#26211f';
    ink(ctx, 7);
    ctx.beginPath();
    ctx.ellipse(cx, cy - hh * 0.62, hw * 1.35, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - hw * 0.95, cy - hh * 0.66);
    ctx.bezierCurveTo(cx - hw * 0.95, cy - hh * 1.55, cx + hw * 0.95, cy - hh * 1.55, cx + hw * 0.95, cy - hh * 0.66);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#7a1f2a';
    ctx.fillRect(cx - hw * 0.93, cy - hh * 0.82, hw * 1.86, 9);
  }
  ctx.restore();
}

function drawProp(ctx: CanvasRenderingContext2D, S: State, hx: number, hy: number, side: 'L' | 'R') {
  if (S.prop === 'papel') {
    ctx.save();
    ctx.translate(hx, hy - 8);
    ctx.rotate(rad(side === 'L' ? -8 : 8));
    ctx.fillStyle = '#f2e8cc';
    ink(ctx, 5);
    ctx.fillRect(-62, -150, 124, 160);
    ctx.strokeRect(-62, -150, 124, 160);
    ctx.strokeStyle = '#3a3030';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(-48, -128 + i * 17);
      ctx.lineTo(i === 3 ? 6 : 46, -128 + i * 17);
      ctx.stroke();
    }
    ctx.fillStyle = '#b23030';
    ctx.beginPath();
    ctx.arc(32, -20, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export function drawCharacter(ctx: CanvasRenderingContext2D, L: Look, S: State, scale: number) {
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, DW, DH);
  const cx = 300;
  const B = L.build;
  const sh = 120 * B; // meia largura de ombros
  const topY = 212 + S.bob;
  const leanPx = Math.sin(rad(S.lean)) * 120;

  // ---- pernas
  ctx.fillStyle = L.trousers;
  ink(ctx, 8);
  for (const sgn of [-1, 1]) {
    const x0 = cx + sgn * 44 * B;
    ctx.beginPath();
    ctx.moveTo(x0 - 40 * B, 500 + S.bob * 0.4);
    ctx.lineTo(x0 + 40 * B, 500 + S.bob * 0.4);
    ctx.lineTo(x0 + 34 * B, 940);
    ctx.lineTo(x0 - 34 * B, 940);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // sapato
    ctx.fillStyle = '#1b1514';
    ctx.beginPath();
    ctx.ellipse(x0 + sgn * 16, 958, 56, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = L.trousers;
  }

  // ---- tronco (paletó)
  ctx.save();
  ctx.translate(leanPx * 0.4, 0);
  const gx0 = cx - sh;
  const gx1 = cx + sh;
  const tb = 540; // barra do paletó
  ctx.beginPath();
  ctx.moveTo(gx0 + 10, topY + 6);
  ctx.quadraticCurveTo(cx, topY - 20, gx1 - 10, topY + 6);
  ctx.quadraticCurveTo(gx1 + 18, topY + 60, gx1 - 8 * B, tb - 120);
  ctx.quadraticCurveTo(gx1 - 4, tb, gx1 - 20, tb + 20);
  ctx.lineTo(gx0 + 20, tb + 20);
  ctx.quadraticCurveTo(gx0 + 4, tb, gx0 + 8 * B, tb - 120);
  ctx.quadraticCurveTo(gx0 - 18, topY + 60, gx0 + 10, topY + 6);
  ctx.closePath();
  ctx.fillStyle = L.suit;
  ctx.fill();
  ink(ctx, 8);
  ctx.stroke();
  // sombreado do paletó
  ctx.save();
  ctx.clip();
  const g = ctx.createLinearGradient(gx0, 0, gx1, 0);
  g.addColorStop(0, 'rgba(255,255,255,0.10)');
  g.addColorStop(0.55, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(10,0,20,0.30)');
  ctx.fillStyle = g;
  ctx.fillRect(gx0 - 20, topY - 30, sh * 2 + 40, 420);
  ctx.restore();

  // camisa + colete + gravata
  ctx.beginPath();
  ctx.moveTo(cx - 44, topY + 2);
  ctx.lineTo(cx + 44, topY + 2);
  ctx.lineTo(cx + 22, tb - 90);
  ctx.lineTo(cx - 22, tb - 90);
  ctx.closePath();
  ctx.fillStyle = L.vest ?? L.shirt;
  ctx.fill();
  ink(ctx, 5);
  ctx.stroke();
  // colarinho
  ctx.fillStyle = L.shirt;
  ctx.beginPath();
  ctx.moveTo(cx - 34, topY - 6);
  ctx.lineTo(cx - 6, topY + 46);
  ctx.lineTo(cx + 6, topY + 46);
  ctx.lineTo(cx + 34, topY - 6);
  ctx.lineTo(cx + 18, topY - 14);
  ctx.lineTo(cx, topY + 20);
  ctx.lineTo(cx - 18, topY - 14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // gravata
  ctx.fillStyle = L.tie;
  ctx.beginPath();
  ctx.moveTo(cx - 9, topY + 22);
  ctx.lineTo(cx + 9, topY + 22);
  ctx.lineTo(cx + 14, topY + 150);
  ctx.lineTo(cx, topY + 168);
  ctx.lineTo(cx - 14, topY + 150);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // lapelas
  ink(ctx, 6);
  for (const sgn of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + sgn * 40, topY + 2);
    ctx.lineTo(cx + sgn * 26, tb - 92);
    ctx.lineTo(cx + sgn * 70, tb - 210);
    ctx.lineTo(cx + sgn * 62, topY + 6);
    ctx.fillStyle = L.suitDark;
    ctx.fill();
    ctx.stroke();
  }
  if (L.pocketSquare) {
    ctx.fillStyle = L.pocketSquare;
    ctx.beginPath();
    ctx.moveTo(cx + 66, topY + 150);
    ctx.lineTo(cx + 96, topY + 140);
    ctx.lineTo(cx + 92, topY + 168);
    ctx.lineTo(cx + 68, topY + 168);
    ctx.closePath();
    ctx.fill();
    ink(ctx, 4);
    ctx.stroke();
  }
  if (L.chain) {
    ctx.strokeStyle = '#d7a93a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx - 30, topY + 190);
    ctx.quadraticCurveTo(cx, topY + 230, cx + 50, topY + 196);
    ctx.stroke();
  }
  // botões
  ctx.fillStyle = INK;
  for (let i = 0; i < 2; i++) {
    ctx.beginPath();
    ctx.arc(cx + 10, tb - 90 - i * 40 + 20, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // ---- braços (por cima do tronco)
  const sx0 = cx - sh + 12 + leanPx * 0.4;
  const sx1 = cx + sh - 12 + leanPx * 0.4;
  const sy = topY + 34;
  const armW = 36 * Math.min(B, 1.2);
  const lh = limb(ctx, sx0, sy, S.aL[0], S.aL[1], 150, 138, armW, L.suit);
  const rh = limb(ctx, sx1, sy, S.aR[0], S.aR[1], 150, 138, armW, L.suit);
  for (const [h, side] of [[lh, 'L'], [rh, 'R']] as const) {
    // punho da camisa + mão
    ctx.fillStyle = L.shirt;
    ink(ctx, 5);
    ctx.beginPath();
    ctx.arc(h.hx, h.hy, armW * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = L.skin;
    ctx.beginPath();
    ctx.arc(h.hx, h.hy + 6, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (S.prop === 'papel' && S.propHand === side) drawProp(ctx, S, h.hx, h.hy, side);
  }

  // ---- pescoço + cabeça
  ctx.fillStyle = L.skin;
  ink(ctx, 7);
  ctx.beginPath();
  ctx.rect(cx - 24 + leanPx * 0.5, topY - 54, 48, 66);
  ctx.fill();
  ctx.stroke();
  drawHead(ctx, L, S, cx + leanPx * 0.9, 110 + S.bob + Math.abs(leanPx) * 0.1);
}

// ---- elencos
export const LUSTIG: Look = {
  skin: '#f0c6a0',
  hair: '#2b2024',
  suit: '#4a4f66',
  suitDark: '#363a4e',
  shirt: '#f6f1e4',
  tie: '#a8243a',
  vest: '#d8cfae',
  trousers: '#3b3f55',
  build: 1.0,
  mustache: 'fina',
  hairStyle: 'liso',
  pocketSquare: '#f2ead2',
};
export const POISSON: Look = {
  skin: '#eab48e',
  hair: '#7b6a5c',
  suit: '#7a5a3e',
  suitDark: '#5a4029',
  shirt: '#f1ead8',
  tie: '#2a5a43',
  vest: '#a98c55',
  trousers: '#5b4330',
  build: 1.18,
  mustache: 'farta',
  hairStyle: 'grisalho',
  chain: true,
};
export const EMPRESARIO_A: Look = {
  skin: '#e2ad88',
  hair: '#3a3030',
  suit: '#3d4a45',
  suitDark: '#2c3632',
  shirt: '#efe8d6',
  tie: '#1f3a5e',
  trousers: '#2e3532',
  build: 1.05,
  mustache: 'nenhuma',
  hairStyle: 'liso',
  glasses: true,
};
export const EMPRESARIO_B: Look = {
  skin: '#f1c7a6',
  hair: '#e8e2d4',
  suit: '#6a3b45',
  suitDark: '#4b2831',
  shirt: '#f3ecdc',
  tie: '#c9a13a',
  trousers: '#432a30',
  build: 1.1,
  mustache: 'farta',
  hairStyle: 'calvo',
  hat: null,
};
