import * as THREE from 'three';

export const SERIF = '"Playfair Display", "Times New Roman", serif';
export const TYPE = '"Special Elite", "Courier New", monospace';

function cv(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}
function tex(c: HTMLCanvasElement, repeat?: [number, number]) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  return t;
}
function rnd(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

export function parquet(): THREE.Texture {
  const c = cv(1024, 1024);
  const g = c.getContext('2d')!;
  const r = rnd(7);
  const cols = ['#a9723f', '#9b6535', '#b57c47', '#8c5a2f'];
  const n = 8;
  const s = 1024 / n;
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      for (let k = 0; k < 4; k++) {
        g.fillStyle = cols[Math.floor(r() * cols.length)];
        const horiz = (x + y) % 2 === 0;
        if (horiz) g.fillRect(x * s, y * s + (k * s) / 4, s, s / 4);
        else g.fillRect(x * s + (k * s) / 4, y * s, s / 4, s);
      }
      g.strokeStyle = 'rgba(30,12,6,0.55)';
      g.lineWidth = 2;
      g.strokeRect(x * s, y * s, s, s);
    }
  return tex(c, [4, 4]);
}

export function wallpaper(): THREE.Texture {
  const c = cv(512, 512);
  const g = c.getContext('2d')!;
  g.fillStyle = '#2f6b66';
  g.fillRect(0, 0, 512, 512);
  g.strokeStyle = '#d9b45a';
  g.lineWidth = 3;
  // leques art déco
  for (let row = 0; row < 2; row++)
    for (let col = 0; col < 2; col++) {
      const cx = 128 + col * 256 + (row % 2) * 0;
      const cy = 128 + row * 256;
      for (let i = 1; i <= 5; i++) {
        g.beginPath();
        g.arc(cx, cy + 90, i * 22, Math.PI, 2 * Math.PI);
        g.stroke();
      }
      g.beginPath();
      g.moveTo(cx - 110, cy + 90);
      g.lineTo(cx + 110, cy + 90);
      g.stroke();
    }
  g.fillStyle = 'rgba(0,0,0,0.12)';
  for (let i = 0; i < 512; i += 64) g.fillRect(i, 0, 3, 512);
  return tex(c, [5, 2]);
}

export function wood(color = '#6e3a20', grain = '#4b2412'): THREE.Texture {
  const c = cv(512, 512);
  const g = c.getContext('2d')!;
  g.fillStyle = color;
  g.fillRect(0, 0, 512, 512);
  const r = rnd(3);
  g.strokeStyle = grain;
  for (let i = 0; i < 60; i++) {
    g.globalAlpha = 0.25;
    g.lineWidth = 1 + r() * 3;
    g.beginPath();
    const y = r() * 512;
    g.moveTo(0, y);
    g.bezierCurveTo(170, y + r() * 24 - 12, 340, y + r() * 24 - 12, 512, y + r() * 16 - 8);
    g.stroke();
  }
  return tex(c, [2, 1]);
}

export function rug(): THREE.Texture {
  const c = cv(512, 512);
  const g = c.getContext('2d')!;
  g.fillStyle = '#7d1d2b';
  g.fillRect(0, 0, 512, 512);
  g.strokeStyle = '#d9b45a';
  g.lineWidth = 10;
  g.strokeRect(24, 24, 464, 464);
  g.lineWidth = 3;
  g.strokeRect(52, 52, 408, 408);
  g.strokeStyle = '#c99a4b';
  for (let i = 1; i <= 5; i++) {
    g.beginPath();
    g.arc(256, 256, i * 36, 0, Math.PI * 2);
    g.stroke();
  }
  return tex(c);
}

// Vista da janela: Paris ao entardecer com a Torre Eiffel.
export function parisView(): THREE.Texture {
  const W = 1024;
  const H = 1536;
  const c = cv(W, H);
  const g = c.getContext('2d')!;
  const sky = g.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#4a73b8');
  sky.addColorStop(0.45, '#e9a76c');
  sky.addColorStop(0.72, '#ffd08a');
  sky.addColorStop(1, '#f3b27a');
  g.fillStyle = sky;
  g.fillRect(0, 0, W, H);
  // sol
  const sun = g.createRadialGradient(W * 0.72, H * 0.66, 10, W * 0.72, H * 0.66, 360);
  sun.addColorStop(0, 'rgba(255,240,200,0.95)');
  sun.addColorStop(1, 'rgba(255,210,140,0)');
  g.fillStyle = sun;
  g.fillRect(0, 0, W, H);
  // nuvens
  g.fillStyle = 'rgba(255,225,200,0.7)';
  for (let i = 0; i < 7; i++) {
    g.beginPath();
    g.ellipse(120 + i * 140, 340 + (i % 3) * 70, 140, 24, 0, 0, Math.PI * 2);
    g.fill();
  }
  // telhados distantes
  const roof = (y: number, col: string, hgt: number, seed: number) => {
    const r = rnd(seed);
    g.fillStyle = col;
    g.strokeStyle = '#1b1220';
    g.lineWidth = 4;
    let x = -20;
    while (x < W + 20) {
      const w = 70 + r() * 110;
      const h = hgt * (0.6 + r() * 0.7);
      g.beginPath();
      g.moveTo(x, H);
      g.lineTo(x, y - h * 0.5);
      g.lineTo(x + w * 0.12, y - h);
      g.lineTo(x + w * 0.88, y - h);
      g.lineTo(x + w, y - h * 0.5);
      g.lineTo(x + w, H);
      g.closePath();
      g.fill();
      g.stroke();
      // chaminé
      g.fillStyle = col;
      g.fillRect(x + w * 0.3, y - h - 26, 16, 28);
      g.strokeRect(x + w * 0.3, y - h - 26, 16, 28);
      x += w;
    }
  };
  roof(1100, '#8d7a9a', 90, 4);
  // Torre Eiffel (centro-esquerda)
  const tx = W * 0.4;
  const base = 1090;
  const top = 360;
  g.strokeStyle = '#1b1220';
  g.fillStyle = '#4a3a46';
  g.lineWidth = 7;
  const half = (y: number) => 3 + ((y - top) / (base - top)) ** 2.2 * 190;
  g.beginPath();
  g.moveTo(tx - half(top), top);
  for (let y = top; y <= base; y += 8) g.lineTo(tx - half(y), y);
  g.lineTo(tx + half(base), base);
  for (let y = base; y >= top; y -= 8) g.lineTo(tx + half(y), y);
  g.closePath();
  g.fill();
  g.stroke();
  // arco central e treliças
  g.fillStyle = '#e9b27a';
  g.beginPath();
  g.moveTo(tx - 74, base);
  g.quadraticCurveTo(tx, base - 190, tx + 74, base);
  g.closePath();
  g.fill();
  g.stroke();
  g.lineWidth = 3;
  for (let y = top + 60; y < base - 60; y += 36) {
    g.beginPath();
    g.moveTo(tx - half(y), y);
    g.lineTo(tx + half(y + 36), y + 36);
    g.moveTo(tx + half(y), y);
    g.lineTo(tx - half(y + 36), y + 36);
    g.stroke();
  }
  g.lineWidth = 6;
  for (const y of [650, 860]) {
    g.beginPath();
    g.moveTo(tx - half(y) - 12, y);
    g.lineTo(tx + half(y) + 12, y);
    g.stroke();
  }
  g.beginPath();
  g.moveTo(tx, top);
  g.lineTo(tx, top - 70);
  g.stroke();
  roof(1210, '#6b5878', 120, 11);
  roof(1330, '#4a3b5a', 150, 21);
  return tex(c);
}

function wrap(g: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) {
  const words = text.split(' ');
  let line = '';
  let yy = y;
  for (const w of words) {
    const t = line ? line + ' ' + w : w;
    if (g.measureText(t).width > maxW && line) {
      g.fillText(line, x, yy);
      line = w;
      yy += lh;
    } else line = t;
  }
  if (line) g.fillText(line, x, yy);
  return yy + lh;
}

// Carta de proposta (envelope aberto) — todo texto em português.
export function proposta(): THREE.Texture {
  const c = cv(1024, 1400);
  const g = c.getContext('2d')!;
  g.fillStyle = '#f3ead0';
  g.fillRect(0, 0, 1024, 1400);
  const grd = g.createLinearGradient(0, 0, 1024, 1400);
  grd.addColorStop(0, 'rgba(255,255,255,0.35)');
  grd.addColorStop(1, 'rgba(120,80,30,0.18)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 1024, 1400);
  g.strokeStyle = '#2b2a45';
  g.lineWidth = 6;
  g.strokeRect(34, 34, 956, 1332);
  g.lineWidth = 2;
  g.strokeRect(50, 50, 924, 1300);
  g.fillStyle = '#2b2a45';
  g.textAlign = 'center';
  g.font = `700 50px ${SERIF}`;
  g.fillText('MINISTÉRIO DOS CORREIOS', 512, 140);
  g.fillText('E TELÉGRAFOS', 512, 200);
  g.font = `400 30px ${SERIF}`;
  g.fillText('Direção-Geral · Paris, 1925', 512, 250);
  g.fillStyle = '#a8243a';
  g.fillRect(150, 280, 724, 5);
  g.fillStyle = '#2b2a45';
  g.font = `700 64px ${SERIF}`;
  g.fillText('PROPOSTA CONFIDENCIAL', 512, 400);
  g.textAlign = 'left';
  g.font = `400 40px ${TYPE}`;
  let y = 490;
  y = wrap(g, 'Ao Sr. André Poisson,', 110, y, 800, 56);
  y += 14;
  y = wrap(g, 'Por motivo de alto custo de manutenção, o Governo da França decidiu, em sigilo, desmontar a Torre Eiffel e vender o ferro como sucata.', 110, y, 810, 54);
  y += 14;
  y = wrap(g, 'A proposta mais vantajosa vencerá a concorrência. Pede-se absoluta discrição.', 110, y, 810, 54);
  g.font = `700 60px ${SERIF}`;
  g.fillStyle = '#7a1b26';
  g.save();
  g.translate(520, 1130);
  g.rotate(-0.06);
  g.fillText('Victor Lustig', 0, 0);
  g.restore();
  g.font = `400 30px ${SERIF}`;
  g.fillStyle = '#2b2a45';
  g.fillText('Vice-Diretor-Geral', 540, 1190);
  // selo de cera
  g.fillStyle = '#9d1f2d';
  g.beginPath();
  g.arc(210, 1180, 74, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = '#5c0f19';
  g.lineWidth = 6;
  g.beginPath();
  g.arc(210, 1180, 52, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = '#5c0f19';
  g.textAlign = 'center';
  g.font = `700 42px ${SERIF}`;
  g.fillText('FR', 210, 1196);
  return tex(c);
}

// Planta da Torre com carimbo (cena do ferro vendido).
export function plantaTorre(): THREE.Texture {
  const c = cv(1400, 1000);
  const g = c.getContext('2d')!;
  g.fillStyle = '#2f5aa8';
  g.fillRect(0, 0, 1400, 1000);
  g.strokeStyle = 'rgba(255,255,255,0.16)';
  g.lineWidth = 2;
  for (let i = 0; i < 1400; i += 40) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 1000); g.stroke();
  }
  for (let i = 0; i < 1000; i += 40) {
    g.beginPath(); g.moveTo(0, i); g.lineTo(1400, i); g.stroke();
  }
  g.strokeStyle = '#eaf2ff';
  g.fillStyle = '#eaf2ff';
  g.lineWidth = 5;
  const tx = 560;
  const top = 130;
  const base = 810;
  const half = (y: number) => 4 + ((y - top) / (base - top)) ** 2.2 * 190;
  g.beginPath();
  g.moveTo(tx - half(top), top);
  for (let y = top; y <= base; y += 8) g.lineTo(tx - half(y), y);
  g.moveTo(tx + half(top), top);
  for (let y = top; y <= base; y += 8) g.lineTo(tx + half(y), y);
  g.stroke();
  g.lineWidth = 2.5;
  for (let y = top + 40; y < base - 20; y += 34) {
    g.beginPath();
    g.moveTo(tx - half(y), y);
    g.lineTo(tx + half(y + 34), y + 34);
    g.moveTo(tx + half(y), y);
    g.lineTo(tx - half(y + 34), y + 34);
    g.stroke();
  }
  g.beginPath();
  g.moveTo(tx - 80, base);
  g.quadraticCurveTo(tx, base - 200, tx + 80, base);
  g.stroke();
  // cotas
  g.lineWidth = 3;
  g.font = `400 40px ${TYPE}`;
  g.beginPath();
  g.moveTo(tx + 260, top); g.lineTo(tx + 260, base);
  g.moveTo(tx + 240, top); g.lineTo(tx + 280, top);
  g.moveTo(tx + 240, base); g.lineTo(tx + 280, base);
  g.stroke();
  g.save();
  g.translate(tx + 310, 520);
  g.rotate(-Math.PI / 2);
  g.textAlign = 'center';
  g.fillText('300 m de ferro', 0, 0);
  g.restore();
  g.textAlign = 'left';
  g.font = `700 54px ${SERIF}`;
  g.fillText('PLANO DE DESMONTAGEM', 880, 160);
  g.font = `400 36px ${TYPE}`;
  g.fillText('Torre Eiffel · Paris', 880, 215);
  g.fillText('Material: sucata de ferro', 880, 265);
  g.fillText('7.000 toneladas', 880, 315);
  return tex(c);
}

export function carimbo(): THREE.Texture {
  const c = cv(800, 400);
  const g = c.getContext('2d')!;
  g.translate(400, 200);
  g.rotate(-0.12);
  g.strokeStyle = '#d3202f';
  g.fillStyle = '#d3202f';
  g.lineWidth = 16;
  g.strokeRect(-340, -120, 680, 240);
  g.lineWidth = 6;
  g.strokeRect(-322, -102, 644, 204);
  g.font = `700 150px ${SERIF}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('VENDIDO', 0, 8);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function placaMaleta(): THREE.Texture {
  const c = cv(512, 256);
  const g = c.getContext('2d')!;
  g.fillStyle = '#d4a63c';
  g.fillRect(0, 0, 512, 256);
  g.strokeStyle = '#6a4a12';
  g.lineWidth = 10;
  g.strokeRect(10, 10, 492, 236);
  g.fillStyle = '#4a3208';
  g.textAlign = 'center';
  g.font = `700 70px ${SERIF}`;
  g.fillText('A. Poisson', 256, 130);
  g.font = `400 40px ${SERIF}`;
  g.fillText('Sucata & Cia.', 256, 195);
  return tex(c);
}

export function dinheiro(): THREE.Texture {
  const c = cv(512, 256);
  const g = c.getContext('2d')!;
  g.fillStyle = '#c8b27a';
  g.fillRect(0, 0, 512, 256);
  g.strokeStyle = '#2f5a45';
  g.lineWidth = 8;
  g.strokeRect(10, 10, 492, 236);
  g.fillStyle = '#2f5a45';
  g.textAlign = 'center';
  g.font = `700 40px ${SERIF}`;
  g.fillText('BANCO DA FRANÇA', 256, 80);
  g.font = `700 90px ${SERIF}`;
  g.fillText('1.000', 256, 170);
  g.font = `400 34px ${SERIF}`;
  g.fillText('FRANCOS', 256, 220);
  return tex(c);
}

export function cintaDinheiro(): THREE.Texture {
  const c = cv(256, 128);
  const g = c.getContext('2d')!;
  g.fillStyle = '#e8d9a8';
  g.fillRect(0, 0, 256, 128);
  g.fillStyle = '#3b2a10';
  g.textAlign = 'center';
  g.font = `700 36px ${SERIF}`;
  g.fillText('200.000', 128, 62);
  g.font = `400 26px ${SERIF}`;
  g.fillText('FRANCOS', 128, 100);
  return tex(c);
}

export function quadro(): THREE.Texture {
  const c = cv(512, 640);
  const g = c.getContext('2d')!;
  const sky = g.createLinearGradient(0, 0, 0, 640);
  sky.addColorStop(0, '#8fb5d8');
  sky.addColorStop(1, '#f4dca8');
  g.fillStyle = sky;
  g.fillRect(0, 0, 512, 640);
  g.fillStyle = '#4a6c4f';
  g.beginPath();
  g.moveTo(0, 440); g.quadraticCurveTo(160, 340, 300, 430); g.quadraticCurveTo(420, 360, 512, 420);
  g.lineTo(512, 640); g.lineTo(0, 640); g.fill();
  g.fillStyle = '#e6c14f';
  g.beginPath(); g.arc(380, 170, 52, 0, Math.PI * 2); g.fill();
  return tex(c);
}

export function envelope(): THREE.Texture {
  const c = cv(640, 440);
  const g = c.getContext('2d')!;
  g.fillStyle = '#e8d7a8';
  g.fillRect(0, 0, 640, 440);
  g.strokeStyle = '#b79c5c';
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(0, 0); g.lineTo(320, 230); g.lineTo(640, 0);
  g.stroke();
  g.fillStyle = '#2b2a45';
  g.textAlign = 'center';
  g.font = `700 38px ${SERIF}`;
  g.fillText('Ao Sr. André Poisson', 320, 300);
  g.font = `400 30px ${TYPE}`;
  g.fillText('PESSOAL E CONFIDENCIAL', 320, 350);
  g.fillStyle = '#9d1f2d';
  g.beginPath();
  g.arc(320, 215, 34, 0, Math.PI * 2);
  g.fill();
  return tex(c);
}
