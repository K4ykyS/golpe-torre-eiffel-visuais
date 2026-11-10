// Texturas do apartamento brasileiro (vídeo do Airbnb). Todo texto em português do Brasil.
import * as THREE from 'three';

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

export function pisoTaco(): THREE.Texture {
  const c = cv(1024, 512);
  const g = c.getContext('2d')!;
  const r = rnd(11);
  const cols = ['#b9875a', '#ad7b4e', '#c4936a', '#a4724a'];
  g.fillStyle = '#6a4630';
  g.fillRect(0, 0, 1024, 512);
  const rows = 8;
  const h = 512 / rows;
  for (let y = 0; y < rows; y++) {
    let x = -r() * 200;
    while (x < 1024) {
      const w = 220 + r() * 160;
      g.fillStyle = cols[Math.floor(r() * cols.length)];
      g.fillRect(x + 2, y * h + 2, w - 4, h - 4);
      g.fillStyle = 'rgba(60,30,10,0.18)';
      for (let k = 0; k < 3; k++) g.fillRect(x + r() * w, y * h + 4 + r() * (h - 8), 40 + r() * 80, 2);
      x += w;
    }
  }
  return tex(c, [3, 3]);
}

export function paredeQuarto(): THREE.Texture {
  const c = cv(512, 512);
  const g = c.getContext('2d')!;
  g.fillStyle = '#cdbf93';
  g.fillRect(0, 0, 512, 512);
  const r = rnd(5);
  for (let i = 0; i < 900; i++) {
    g.fillStyle = `rgba(${r() > 0.5 ? '255,248,220' : '90,70,40'},${0.03 + r() * 0.05})`;
    g.fillRect(r() * 512, r() * 512, 2 + r() * 8, 2 + r() * 8);
  }
  // mancha de umidade no canto superior (cheiro de apartamento de verdade)
  const m = g.createRadialGradient(40, 20, 4, 40, 20, 130);
  m.addColorStop(0, 'rgba(90,100,70,0.35)');
  m.addColorStop(1, 'rgba(90,100,70,0)');
  g.fillStyle = m;
  g.fillRect(0, 0, 300, 200);
  return tex(c, [3, 1]);
}

export function janelaPersiana(): THREE.Texture {
  const c = cv(512, 768);
  const g = c.getContext('2d')!;
  const sky = g.createLinearGradient(0, 0, 0, 768);
  sky.addColorStop(0, '#fff4c8');
  sky.addColorStop(0.55, '#ffe08a');
  sky.addColorStop(1, '#ffd070');
  g.fillStyle = sky;
  g.fillRect(0, 0, 512, 768);
  // prédios ao fundo
  g.fillStyle = '#c9a77a';
  for (let i = 0; i < 6; i++) g.fillRect(i * 90 + 10, 470 - (i % 3) * 60, 78, 400);
  g.fillStyle = '#ffd98a';
  for (let i = 0; i < 6; i++) for (let k = 0; k < 4; k++) g.fillRect(i * 90 + 24, 490 - (i % 3) * 60 + k * 56, 18, 26);
  // persiana (lâminas) recolhida pela metade
  for (let y = 0; y < 330; y += 22) {
    g.fillStyle = '#e9e2cf';
    g.fillRect(0, y, 512, 19);
    g.fillStyle = 'rgba(80,60,30,0.25)';
    g.fillRect(0, y + 17, 512, 3);
  }
  g.fillStyle = '#9a8e72';
  g.fillRect(0, 330, 512, 10);
  g.strokeStyle = '#8a8066';
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(256, 0);
  g.lineTo(256, 330);
  g.stroke();
  return tex(c);
}

export function raiosDeSol(): THREE.Texture {
  const c = cv(256, 512);
  const g = c.getContext('2d')!;
  g.clearRect(0, 0, 256, 512);
  for (let i = 0; i < 6; i++) {
    const y = 30 + i * 80;
    const gr = g.createLinearGradient(0, 0, 256, 0);
    gr.addColorStop(0, 'rgba(255,214,130,0.0)');
    gr.addColorStop(0.2, 'rgba(255,214,130,0.9)');
    gr.addColorStop(1, 'rgba(255,214,130,0.5)');
    g.fillStyle = gr;
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(256, y + 40);
    g.lineTo(256, y + 66);
    g.lineTo(0, y + 30);
    g.closePath();
    g.fill();
  }
  return tex(c);
}

export function bandeira(): THREE.Texture {
  const c = cv(640, 448);
  const g = c.getContext('2d')!;
  g.fillStyle = '#1f9a4a';
  g.fillRect(0, 0, 640, 448);
  g.fillStyle = '#f7d519';
  g.beginPath();
  g.moveTo(320, 36);
  g.lineTo(600, 224);
  g.lineTo(320, 412);
  g.lineTo(40, 224);
  g.closePath();
  g.fill();
  g.fillStyle = '#26358f';
  g.beginPath();
  g.arc(320, 224, 124, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = '#f4f0e0';
  g.lineWidth = 16;
  g.beginPath();
  g.moveTo(200, 200);
  g.quadraticCurveTo(320, 244, 440, 232);
  g.stroke();
  g.fillStyle = '#f4f0e0';
  g.font = 'bold 22px "Special Elite", Arial, sans-serif';
  g.textAlign = 'center';
  g.fillText('ORDEM E PROGRESSO', 318, 232);
  g.fillStyle = '#f4f0e0';
  const r = rnd(2);
  for (let i = 0; i < 26; i++) {
    g.beginPath();
    g.arc(250 + r() * 140, 160 + r() * 110, 3, 0, 7);
    g.fill();
  }
  g.strokeStyle = 'rgba(0,0,0,0.25)';
  g.lineWidth = 6;
  g.strokeRect(0, 0, 640, 448);
  return tex(c);
}

export function despertador(hora = '07:12'): THREE.Texture {
  const c = cv(256, 128);
  const g = c.getContext('2d')!;
  g.fillStyle = '#120a0e';
  g.fillRect(0, 0, 256, 128);
  g.fillStyle = '#ff3b30';
  g.font = 'bold 84px "Courier New", monospace';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.shadowColor = '#ff3b30';
  g.shadowBlur = 18;
  g.fillText(hora, 128, 68);
  return tex(c);
}

export function letraZ(): THREE.Texture {
  const c = cv(128, 128);
  const g = c.getContext('2d')!;
  g.font = 'bold 100px Arial, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.lineWidth = 14;
  g.strokeStyle = '#16132b';
  g.fillStyle = '#f4f0e0';
  g.strokeText('Z', 64, 68);
  g.fillText('Z', 64, 68);
  return tex(c);
}

export type Tex3 = {
  piso: THREE.Texture;
  parede: THREE.Texture;
  janela: THREE.Texture;
  raios: THREE.Texture;
  bandeira: THREE.Texture;
  relogio: THREE.Texture;
  z: THREE.Texture;
};
export function makeTextures3(): Tex3 {
  return {piso: pisoTaco(), parede: paredeQuarto(), janela: janelaPersiana(), raios: raiosDeSol(), bandeira: bandeira(), relogio: despertador(), z: letraZ()};
}
