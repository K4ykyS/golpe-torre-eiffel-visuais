// Linha do tempo do piloto. t = segundos locais; a narração do piloto começa em 29,95 s do MP3.
export const FPS = 24;
export const PILOT_START = 29.95; // s no MP3
export const PILOT_LEN = 10.5;

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const sm = (x: number) => {
  x = clamp01(x);
  return x * x * x * (x * (x * 6 - 15) + 10);
};
export const ramp = (t: number, a: number, b: number) => sm((t - a) / (b - a));
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
export const outCubic = (u: number) => 1 - Math.pow(1 - clamp01(u), 3);

export function key(t: number, ks: [number, number][]): number {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    if (t <= ks[i][0]) {
      const [t0, v0] = ks[i - 1];
      const [t1, v1] = ks[i];
      return lerp(v0, v1, sm((t - t0) / (t1 - t0)));
    }
  }
  return ks[ks.length - 1][1];
}
export function keyv(t: number, ks: [number, number[]][]): number[] {
  const n = ks[0][1].length;
  return Array.from({length: n}, (_, j) => key(t, ks.map(([tt, v]) => [tt, v[j]] as [number, number])));
}
export function pick<T>(t: number, ks: [number, T][]): T {
  let out = ks[0][1];
  for (const [tt, v] of ks) if (t >= tt) out = v;
  return out;
}

export function blink(t: number, seed: number, period = 2.4): number {
  const ph = (((t + seed) % period) + period) % period;
  const d = 0.17;
  if (ph > d) return 0;
  const u = ph / d;
  return u < 0.5 ? u * 2 : (1 - u) * 2;
}

export type Cam = {p: [number, number, number]; l: [number, number, number]; fov: number; roll: number};
export type Shot = {id: string; a: number; b: number; cam: (t: number) => Cam};

const mix = (a: number[], b: number[], u: number) => a.map((v, i) => lerp(v, b[i], u));
const glide = (u: number) => lerp(u, sm(u), 0.65);

function lin(a: number, b: number, from: Cam, to: Cam): (t: number) => Cam {
  return (t) => {
    const u = glide((t - a) / (b - a));
    return {p: mix(from.p, to.p, u) as any, l: mix(from.l, to.l, u) as any, fov: lerp(from.fov, to.fov, u), roll: lerp(from.roll, to.roll, u)};
  };
}

export const envelopeX = (t: number) => -0.62 + 1.78 * outCubic((t - 4.78) / 1.2);
export const envelopeZ = (t: number) => 0.18 - 0.5 * outCubic((t - 4.78) / 1.2);
export const bundleX = (t: number) => 1.85 - 2.2 * outCubic((t - 8.95) / 0.95);
export const bundleZ = (t: number) => -0.1 + 0.25 * outCubic((t - 8.95) / 0.95);

export const SHOTS: Shot[] = [
  {id: 'geral', a: 0, b: 1.5, cam: lin(0, 1.5, {p: [0.4, 1.4, 6.6], l: [0.42, 1.1, -1], fov: 56, roll: 1.2}, {p: [0.5, 1.4, 5.7], l: [0.45, 1.12, -1], fov: 54, roll: -0.6})},
  {id: 'lustig-torre', a: 1.5, b: 3.05, cam: lin(1.5, 3.05, {p: [0.7, 1.3, 3.6], l: [-1.2, 1.55, -0.5], fov: 44, roll: 3}, {p: [0.3, 1.35, 3.1], l: [-1.35, 1.6, -1.2], fov: 41, roll: 1})},
  {id: 'carimbo', a: 3.05, b: 4.4, cam: lin(3.05, 4.4, {p: [0.1, 2.0, 1.7], l: [0.5, 0.78, 0.05], fov: 40, roll: -3}, {p: [0.35, 1.7, 1.3], l: [0.52, 0.78, 0.05], fov: 38, roll: -1})},
  {
    id: 'desliza',
    a: 4.4,
    b: 6.1,
    cam: (t) => {
      const x = envelopeX(t + 0.12);
      const u = glide((t - 4.4) / 1.7);
      return {p: [lerp(-0.4, x + 0.35, u), 1.6, lerp(3.0, 2.7, u)], l: [lerp(-0.85, x + 0.1, u), 1.15, -0.3], fov: lerp(40, 42, u), roll: lerp(-2.5, 2, u)};
    },
  },
  {id: 'poisson-le', a: 6.1, b: 7.55, cam: lin(6.1, 7.55, {p: [1.5, 1.32, 0.75], l: [1.3, 1.22, -1], fov: 29, roll: 3.5}, {p: [1.4, 1.3, 0.55], l: [1.3, 1.22, -1], fov: 26, roll: 2})},
  {id: 'carta', a: 7.55, b: 8.75, cam: lin(7.55, 8.75, {p: [1.0, 1.1, 1.9], l: [1.3, 1.05, 0.1], fov: 38, roll: -2}, {p: [1.55, 1.12, 1.6], l: [1.3, 1.06, 0.1], fov: 34, roll: 1})},
  {
    id: 'pagamento',
    a: 8.75,
    b: 9.95,
    cam: (t) => {
      const x = bundleX(t + 0.05);
      const u = glide((t - 8.75) / 1.2);
      const w = ramp(t, 9.3, 9.95);
      const lx = lerp(x - 0.05, -0.8, w);
      return {p: [lx + 0.9, 1.5, 2.8], l: [lx, lerp(1.0, 1.15, w), -0.2], fov: 44, roll: lerp(3, -2, u)};
    },
  },
  {id: 'lustig-sorri', a: 9.95, b: 10.5, cam: lin(9.95, 10.5, {p: [-0.75, 1.55, 1.75], l: [-1.12, 1.6, 0], fov: 27, roll: -3}, {p: [-0.9, 1.58, 1.4], l: [-1.12, 1.62, 0], fov: 24, roll: -1.5})},
];

export function camAt(t: number): Cam {
  const s = SHOTS.find((x) => t >= x.a && t < x.b) ?? SHOTS[SHOTS.length - 1];
  const c = s.cam(t);
  const k = (t - 3.45) * FPS;
  if (k >= 0 && k < 7) {
    const f = (1 - k / 7) * (Math.floor(k) % 2 ? 1 : -1);
    c.p = [c.p[0], c.p[1] + 0.025 * f, c.p[2]];
    c.roll += 0.8 * f;
  }
  return c;
}
export const shotAt = (t: number) => SHOTS.find((x) => t >= x.a && t < x.b) ?? SHOTS[SHOTS.length - 1];
