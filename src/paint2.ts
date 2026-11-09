import * as THREE from 'three';
import {SERIF, TYPE} from './paint';

function cv(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}
function tex(c: HTMLCanvasElement, rep?: [number, number], srgb = true) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
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

export function cobble(): THREE.Texture {
  const c = cv(512, 512);
  const g = c.getContext('2d')!;
  g.fillStyle = '#6f6670';
  g.fillRect(0, 0, 512, 512);
  const r = rnd(5);
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++) {
      const off = (y % 2) * 16;
      const l = 96 + r() * 40;
      g.fillStyle = `rgb(${l + 16},${l + 6},${l + 18})`;
      g.strokeStyle = 'rgba(30,20,36,0.7)';
      g.lineWidth = 2;
      g.beginPath();
      g.roundRect(x * 32 + off - 16 + 2, y * 32 + 2, 28, 28, 7);
      g.fill();
      g.stroke();
    }
  return tex(c, [40, 40]);
}

export function facade(): THREE.Texture {
  const c = cv(512, 512);
  const g = c.getContext('2d')!;
  g.fillStyle = '#e8d6ae';
  g.fillRect(0, 0, 512, 512);
  g.fillStyle = 'rgba(120,90,60,0.12)';
  for (let y = 0; y < 512; y += 64) g.fillRect(0, y, 512, 3);
  for (let row = 0; row < 4; row++)
    for (let col = 0; col < 3; col++) {
      const x = 40 + col * 160;
      const y = 28 + row * 124;
      g.fillStyle = '#3d4b66';
      g.strokeStyle = '#1b1220';
      g.lineWidth = 5;
      g.fillRect(x, y, 84, 96);
      g.strokeRect(x, y, 84, 96);
      g.fillStyle = 'rgba(255,214,140,0.5)';
      g.fillRect(x + 6, y + 6, 72, 40);
      g.beginPath();
      g.moveTo(x + 42, y); g.lineTo(x + 42, y + 96);
      g.moveTo(x, y + 48); g.lineTo(x + 84, y + 48);
      g.stroke();
      // persianas
      g.fillStyle = '#6b8a78';
      g.fillRect(x - 22, y, 20, 96);
      g.fillRect(x + 86, y, 20, 96);
      g.strokeRect(x - 22, y, 20, 96);
      g.strokeRect(x + 86, y, 20, 96);
      // sacada de ferro
      g.strokeStyle = '#1b1220';
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(x - 10, y + 80); g.lineTo(x + 94, y + 80);
      for (let i = 0; i < 9; i++) { g.moveTo(x - 6 + i * 12, y + 80); g.lineTo(x - 6 + i * 12, y + 96); }
      g.stroke();
    }
  return tex(c, [1, 1]);
}

export function skyDome(): THREE.Texture {
  const c = cv(32, 512);
  const g = c.getContext('2d')!;
  const s = g.createLinearGradient(0, 0, 0, 512);
  s.addColorStop(0, '#34569e');
  s.addColorStop(0.45, '#8f86b4');
  s.addColorStop(0.72, '#f2a774');
  s.addColorStop(0.9, '#ffd493');
  s.addColorStop(1, '#ffd493');
  g.fillStyle = s;
  g.fillRect(0, 0, 32, 512);
  return tex(c);
}

export function plaque(lines: {t: string; s: number; w?: number; f?: 'serif' | 'type'; c?: string}[], bg = '#1f3a5e', border = '#e8d9a8', w = 1024, h = 512): THREE.Texture {
  const c = cv(w, h);
  const g = c.getContext('2d')!;
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  g.strokeStyle = border;
  g.lineWidth = 14;
  g.strokeRect(22, 22, w - 44, h - 44);
  g.lineWidth = 4;
  g.strokeRect(46, 46, w - 92, h - 92);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const total = lines.reduce((a, l) => a + l.s * 1.3, 0);
  let y = (h - total) / 2;
  for (const l of lines) {
    y += (l.s * 1.3) / 2;
    g.fillStyle = l.c ?? border;
    g.font = `${l.w ?? 700} ${l.s}px ${l.f === 'type' ? TYPE : SERIF}`;
    g.fillText(l.t, w / 2, y);
    y += (l.s * 1.3) / 2;
  }
  return tex(c);
}

// papel com texto livre (jornal, livro de ocorrências, contrato)
export function jornalPrimeira(): THREE.Texture {
  const c = cv(1024, 1400);
  const g = c.getContext('2d')!;
  g.fillStyle = '#ddd7c4';
  g.fillRect(0, 0, 1024, 1400);
  g.fillStyle = '#1d1a1c';
  g.textAlign = 'center';
  g.font = `700 92px ${SERIF}`;
  g.fillText('O JORNAL DE PARIS', 512, 130);
  g.fillRect(60, 160, 904, 6);
  g.font = `400 30px ${SERIF}`;
  g.fillText('Paris, 1925 · Edição da manhã', 512, 210);
  g.fillRect(60, 232, 904, 3);
  g.textAlign = 'left';
  g.font = `700 78px ${SERIF}`;
  g.fillText('TORRE EIFFEL', 70, 340);
  g.fillText('EXIGE CONSERTOS', 70, 424);
  g.fillText('CARÍSSIMOS', 70, 508);
  g.font = `400 40px ${SERIF}`;
  g.fillText('Governo teme os gastos com a manutenção', 70, 590);
  g.fillText('do monumento de ferro.', 70, 640);
  g.fillStyle = '#6a6458';
  for (let i = 0; i < 14; i++) g.fillRect(70, 720 + i * 34, i % 4 === 3 ? 380 : 880, 12);
  g.fillStyle = '#9d968a';
  g.fillRect(70, 1210, 380, 120);
  return tex(c);
}

export function livroOcorrencias(): THREE.Texture {
  const c = cv(1024, 1400);
  const g = c.getContext('2d')!;
  g.fillStyle = '#efe6cc';
  g.fillRect(0, 0, 1024, 1400);
  g.fillStyle = '#2b2a45';
  g.textAlign = 'center';
  g.font = `700 60px ${SERIF}`;
  g.fillText('REGISTRO DE OCORRÊNCIAS', 512, 120);
  g.font = `400 34px ${SERIF}`;
  g.fillText('Delegacia de Polícia · Paris · 1925', 512, 176);
  g.strokeStyle = '#8aa0c8';
  g.lineWidth = 2;
  for (let y = 250; y < 1300; y += 54) { g.beginPath(); g.moveTo(70, y); g.lineTo(954, y); g.stroke(); }
  g.beginPath(); g.moveTo(180, 220); g.lineTo(180, 1300); g.strokeStyle = '#c27a7a'; g.stroke();
  g.textAlign = 'left';
  g.fillStyle = '#2b2a45';
  g.font = `400 36px ${TYPE}`;
  g.fillText('Nenhuma denúncia registrada.', 205, 238);
  return tex(c);
}

export function contrato(): THREE.Texture {
  const c = cv(1024, 1400);
  const g = c.getContext('2d')!;
  g.fillStyle = '#f1e7c8';
  g.fillRect(0, 0, 1024, 1400);
  g.strokeStyle = '#7a1f2a';
  g.lineWidth = 10;
  g.strokeRect(40, 40, 944, 1320);
  g.fillStyle = '#2b2a45';
  g.textAlign = 'center';
  g.font = `700 60px ${SERIF}`;
  g.fillText('CONTRATO DE VENDA', 512, 160);
  g.font = `400 40px ${SERIF}`;
  g.fillText('Torre Eiffel · Paris', 512, 230);
  g.textAlign = 'left';
  g.font = `400 40px ${TYPE}`;
  g.fillText('Vendedor: Victor Lustig', 110, 420);
  g.fillText('Comprador: André Poisson', 110, 490);
  g.fillText('Objeto: ferro da Torre', 110, 560);
  g.fillStyle = '#9d1f2d';
  g.beginPath(); g.arc(780, 1080, 90, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#2b2a45';
  g.font = `700 54px ${SERIF}`;
  g.fillText('A. Poisson', 140, 1100);
  return tex(c);
}

export function carimboTexto(texto: string, cor = '#d3202f', fs = 150): THREE.Texture {
  const c = cv(900, 400);
  const g = c.getContext('2d')!;
  g.translate(450, 200);
  g.rotate(-0.12);
  g.strokeStyle = cor;
  g.fillStyle = cor;
  g.lineWidth = 16;
  g.strokeRect(-390, -120, 780, 240);
  g.lineWidth = 6;
  g.strokeRect(-372, -102, 744, 204);
  g.font = `700 ${fs}px ${SERIF}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(texto, 0, 8);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function paisagemAlpes(): THREE.Texture {
  const W = 2048;
  const H = 512;
  const c = cv(W, H);
  const g = c.getContext('2d')!;
  const s = g.createLinearGradient(0, 0, 0, H);
  s.addColorStop(0, '#7ab0e0');
  s.addColorStop(1, '#f6e3b8');
  g.fillStyle = s;
  g.fillRect(0, 0, W, H);
  const ridge = (base: number, amp: number, col: string, snow: boolean, ph: number) => {
    g.fillStyle = col;
    g.strokeStyle = '#1b1220';
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(0, H);
    for (let x = 0; x <= W; x += 8) {
      const y = base - Math.abs(Math.sin((x / W) * Math.PI * 4 + ph)) * amp - Math.sin((x / W) * Math.PI * 12 + ph) * amp * 0.15;
      g.lineTo(x, y);
    }
    g.lineTo(W, H);
    g.closePath();
    g.fill();
    g.stroke();
    if (snow) {
      g.fillStyle = 'rgba(255,255,255,0.85)';
      for (let x = 0; x <= W; x += 8) {
        const y = base - Math.abs(Math.sin((x / W) * Math.PI * 4 + ph)) * amp - Math.sin((x / W) * Math.PI * 12 + ph) * amp * 0.15;
        if (base - y > amp * 0.78) g.fillRect(x, y, 8, 18);
      }
    }
  };
  ridge(330, 190, '#7d8fb0', true, 0.3);
  ridge(390, 110, '#5f8f6a', false, 1.7);
  ridge(460, 70, '#3f7a4e', false, 0.9);
  const r = rnd(9);
  for (let i = 0; i < 40; i++) {
    const x = r() * W;
    g.fillStyle = '#2f5f3a';
    g.strokeStyle = '#1b1220';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(x, 470 + r() * 20); g.lineTo(x - 22, 520); g.lineTo(x + 22, 520); g.closePath(); g.fill(); g.stroke();
  }
  return tex(c, [1, 1]);
}
