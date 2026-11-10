// Trilha instrumental original, sintetizada do zero (sem amostras de terceiros: uso comercial livre).
// Clima: "sério e sem graça" para humor ácido. 84 BPM, ré menor, baixo pizzicato, acordes de piano elétrico,
// escovinha discreta e um "plim" de marimba de vez em quando. Também gera os efeitos (obturador da câmera).
// uso: node scripts/trilha.mjs <duracao_s> <saida_trilha.wav> <saida_efeitos.wav>
import fs from 'node:fs';

const SR = 44100;
const DUR = parseFloat(process.argv[2] || '83.15');
const N = Math.ceil((DUR + 1.5) * SR);
const L = new Float32Array(N), R = new Float32Array(N);
let seed = 7;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const add = (i, v, pan = 0) => { if (i >= 0 && i < N) { L[i] += v * (1 - pan) ; R[i] += v * (1 + pan); } };

function pluck(t, m, amp, pan = 0) { // baixo pizzicato abafado
  const f = hz(m), s0 = Math.floor(t * SR), len = Math.floor(0.9 * SR);
  for (let k = 0; k < len; k++) { const x = k / SR; const e = Math.exp(-x * 5.5) * Math.min(1, x * 400);
    add(s0 + k, amp * e * (Math.sin(2 * Math.PI * f * x) + 0.3 * Math.sin(4 * Math.PI * f * x) * Math.exp(-x * 12)), pan); }
}
function epiano(t, ms, d, amp) { // acorde de piano elétrico com trêmolo lento
  const s0 = Math.floor(t * SR), len = Math.floor((d + 1.2) * SR);
  for (let k = 0; k < len; k++) { const x = k / SR; const rel = x > d ? Math.exp(-(x - d) * 4) : 1;
    const e = Math.min(1, x * 60) * Math.exp(-x * 0.9) * rel; const trem = 1 + 0.25 * Math.sin(2 * Math.PI * 4.2 * x);
    let v = 0; ms.forEach((m, j) => { const f = hz(m); v += Math.sin(2 * Math.PI * f * x + 0.6 * Math.sin(2 * Math.PI * f * x) * Math.exp(-x * 3)) * (j % 2 ? 0.9 : 1); });
    add(s0 + k, amp * e * v * trem / ms.length, 0.25 * Math.sin(2 * Math.PI * 0.3 * x)); }
}
function marimba(t, m, amp, pan) {
  const f = hz(m), s0 = Math.floor(t * SR), len = Math.floor(0.7 * SR);
  for (let k = 0; k < len; k++) { const x = k / SR; add(s0 + k, amp * Math.exp(-x * 9) * (Math.sin(2 * Math.PI * f * x) + 0.2 * Math.sin(2 * Math.PI * f * 4 * x) * Math.exp(-x * 40)), pan); }
}
function brush(t, amp, dec = 30) {
  const s0 = Math.floor(t * SR), len = Math.floor(0.25 * SR); let lp = 0;
  for (let k = 0; k < len; k++) { const x = k / SR; const n = rnd() * 2 - 1; const hp = n - lp; lp += 0.3 * (n - lp);
    add(s0 + k, amp * hp * Math.exp(-x * dec) * Math.min(1, x * 300), 0.2); }
}

const BPM = 84, beat = 60 / BPM, bar = beat * 4;
// ré menor: Dm  Bb  Gm  A(7)   — baixo andando em semínimas com pausas "sem graça"
const prog = [
  {ch: [62, 65, 69, 72], bass: [38, null, 45, 41]},
  {ch: [58, 62, 65, 69], bass: [34, null, 41, 38]},
  {ch: [55, 58, 62, 65], bass: [31, null, 38, 34]},
  {ch: [57, 61, 64, 67], bass: [33, 40, 37, null]},
];
const plinks = [74, 77, 76, 72, 69, 74, 81, 79];
const intro = 2 * beat; // entra suave
for (let b = 0, t0 = 0; t0 < DUR + bar; b++, t0 = b * bar) {
  const p = prog[b % 4];
  const fadeIn = Math.min(1, (t0 + 0.01) / (bar * 1.5));
  epiano(t0, p.ch, bar * 0.92, 0.16 * fadeIn);
  p.bass.forEach((m, i) => { if (m !== null) pluck(t0 + i * beat, m, 0.42 * Math.max(0.35, fadeIn)); });
  if (t0 >= intro) for (let i = 0; i < 8; i++) brush(t0 + i * beat / 2 + (i % 2 ? 0.035 : 0), i % 2 ? 0.035 : 0.055);
  if (b % 2 === 1) marimba(t0 + beat * 2.5, plinks[(b >> 1) % plinks.length], 0.13, (b % 4) - 2 > 0 ? 0.4 : -0.4);
}
// eco curto (sala pequena) e saída
const D = Math.floor(0.19 * SR);
for (let i = D; i < N; i++) { L[i] += 0.22 * R[i - D]; R[i] += 0.22 * L[i - D]; }
for (let i = 0; i < N; i++) { const t = i / SR; const g = t > DUR - 3 ? Math.max(0, (DUR - t) / 3) : 1; L[i] *= g; R[i] *= g; }

function writeWav(path, chans) {
  let peak = 1e-9; chans.forEach((c) => c.forEach((v) => { peak = Math.max(peak, Math.abs(v)); }));
  const n = chans[0].length, buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 4, 40);
  const g = 0.89 / peak;
  for (let i = 0; i < n; i++) for (let c = 0; c < 2; c++) buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, chans[c][i] * g)) * 32767), 44 + i * 4 + c * 2);
  fs.writeFileSync(path, buf);
}
writeWav(process.argv[3] || 'trilha.wav', [L.subarray(0, Math.ceil(DUR * SR)), R.subarray(0, Math.ceil(DUR * SR))]);

// ---------- efeitos: obturador de câmera antiga (clique duplo + chiado curto), nos flashes do vídeo
const E0 = new Float32Array(Math.ceil(DUR * SR)), E1 = new Float32Array(E0.length);
function shutter(t, amp) {
  for (const [dt, a, dec] of [[0, 1, 160], [0.055, 0.7, 120]]) {
    const s0 = Math.floor((t + dt) * SR);
    for (let k = 0; k < 0.08 * SR; k++) { const x = k / SR; const v = amp * a * ((rnd() * 2 - 1) * 0.7 + Math.sin(2 * Math.PI * 1800 * x) * 0.5) * Math.exp(-x * dec);
      if (s0 + k < E0.length) { E0[s0 + k] += v; E1[s0 + k] += v; } }
  }
  const s1 = Math.floor((t + 0.02) * SR); // motorzinho do avanço do filme
  for (let k = 0; k < 0.22 * SR; k++) { const x = k / SR; const v = amp * 0.12 * Math.sign(Math.sin(2 * Math.PI * 95 * x)) * Math.sin(Math.PI * x / 0.22);
    if (s1 + k < E0.length) { E0[s1 + k] += v; E1[s1 + k] += v; } }
}
shutter(3.43, 1); shutter(4.18, 1);
shutter(30.18, 0.9); shutter(59.78, 0.9); shutter(60.33, 0.9);
const put = (i, v) => { if (i >= 0 && i < E0.length) { E0[i] += v; E1[i] += v; } };
function thud(t, amp) { // porta fechando: baque grave + estalo da fechadura
  const s0 = Math.floor(t * SR);
  for (let k = 0; k < 0.4 * SR; k++) { const x = k / SR; put(s0 + k, amp * (Math.sin(2 * Math.PI * (70 - 30 * x) * x) * Math.exp(-x * 11) + (rnd() * 2 - 1) * 0.25 * Math.exp(-x * 60))); }
  const s1 = Math.floor((t + 0.09) * SR);
  for (let k = 0; k < 0.05 * SR; k++) { const x = k / SR; put(s1 + k, amp * 0.4 * (rnd() * 2 - 1) * Math.exp(-x * 120)); }
}
function keys(t, amp) { // molho de chaves: tilintar metálico
  for (let j = 0; j < 7; j++) { const t0 = t + j * 0.06 + rnd() * 0.04, f = 2400 + rnd() * 2600, s0 = Math.floor(t0 * SR);
    for (let k = 0; k < 0.18 * SR; k++) { const x = k / SR; put(s0 + k, amp * 0.35 * (Math.sin(2 * Math.PI * f * x) + 0.5 * Math.sin(2 * Math.PI * f * 2.76 * x)) * Math.exp(-x * 28)); } }
}
function ding(t, amp) { // notificação do celular
  for (const [dt, f] of [[0, 1318.5], [0.11, 1975.5]]) { const s0 = Math.floor((t + dt) * SR);
    for (let k = 0; k < 0.6 * SR; k++) { const x = k / SR; put(s0 + k, amp * 0.4 * Math.sin(2 * Math.PI * f * x) * Math.exp(-x * 6) * Math.min(1, x * 500)); } }
}
function papel(t, amp) { // papel sendo mostrado
  const s0 = Math.floor(t * SR); let lp = 0;
  for (let k = 0; k < 0.35 * SR; k++) { const x = k / SR; const n = rnd() * 2 - 1; const hp = n - lp; lp += 0.5 * (n - lp);
    put(s0 + k, amp * 0.5 * hp * (0.5 + 0.5 * Math.sin(x * 90)) * Math.sin(Math.PI * x / 0.35)); }
}
thud(46.05, 0.9); keys(47.6, 0.8); thud(68.62, 0.7); ding(71.55, 0.7); papel(76.15, 0.8);
writeWav(process.argv[4] || 'efeitos.wav', [E0, E1]);
console.log('ok', DUR);
