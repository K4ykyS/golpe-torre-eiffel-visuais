import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Box, Cyl, Sph, Inked} from './kit';
import * as Q from './paint2';
import * as P from './paint';

export type Tex2 = ReturnType<typeof makeTextures2>;
export function makeTextures2() {
  return {
    cobble: Q.cobble(),
    facade: Q.facade(),
    sky: Q.skyDome(),
    alpes: Q.paisagemAlpes(),
    jornal: Q.jornalPrimeira(),
    livro: Q.livroOcorrencias(),
    contrato: Q.contrato(),
    fraude: Q.carimboTexto('FRAUDE', '#c4161f', 170),
    falso: Q.carimboTexto('FALSO', '#c4161f', 190),
    sigilo: Q.carimboTexto('SIGILOSO', '#7a1b26', 120),
    oficial: Q.carimboTexto('OFICIAL', '#2a4a8a', 150),
    placaTorre: Q.plaque([{t: 'PROPRIEDADE DO', s: 64}, {t: 'ESTADO FRANCÊS', s: 64}, {t: 'Torre Eiffel · Paris', s: 40, w: 400, f: 'type'}], '#1f3a5e'),
    placaPolicia: Q.plaque([{t: 'DELEGACIA', s: 78}, {t: 'DE POLÍCIA', s: 78}], '#14284a', '#f1e6c0', 1024, 420),
    placaSucata: Q.plaque([{t: 'SUCATA POISSON', s: 80}, {t: '& Cia. · Ferro velho', s: 44, w: 400, f: 'type'}], '#4a2a1a', '#e8c46a', 1024, 380),
    placaEstacao: Q.plaque([{t: 'ESTAÇÃO', s: 70}, {t: 'PARIS', s: 120}], '#1f4a3a', '#f1e6c0', 1024, 440),
    placaAustria: Q.plaque([{t: 'ÁUSTRIA', s: 150}, {t: 'Viena · 40 km', s: 52, w: 400, f: 'type'}], '#7a1f2a', '#f1e6c0', 1024, 420),
    placaHotel: Q.plaque([{t: 'HOTEL', s: 110}, {t: 'de luxo', s: 56, w: 400}], '#3a1f4a', '#e8c46a', 1024, 380),
    metal: P.wood('#5a4a46', '#3a2c2a'),
  };
}

// ---------- Barras de ferro (Torre) e utilidades
function Bar({a, b, r0 = 0.5, r1, color = '#6a544e'}: {a: [number, number, number]; b: [number, number, number]; r0?: number; r1?: number; color?: string}) {
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...b);
  const len = va.distanceTo(vb);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
  const mid = va.clone().add(vb).multiplyScalar(0.5);
  const geo = useMemo(() => new THREE.CylinderGeometry(r1 ?? r0, r0, len, 4, 1), [len, r0, r1]);
  return (
    <group position={mid.toArray() as any} quaternion={q}>
      <Inked geo={geo} color={color} line={0.07} />
    </group>
  );
}

export function Eiffel({scaffold = false}: {scaffold?: boolean}) {
  const col = '#6e5a52';
  const legs: [number, number][] = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
  const braces: JSX.Element[] = [];
  // travessas e diagonais — primeiro andar
  const L = (sx: number, sz: number, y: number, k: number) => [sx * k, y, sz * k] as [number, number, number];
  const widthAt = (y: number) => (y <= 22 ? 13 - (y / 22) * 8 : y <= 52 ? 5 - ((y - 22) / 30) * 3.4 : 1.6 - ((y - 52) / 23) * 1.2);
  const levels = [0, 6, 12, 18, 22];
  for (let i = 0; i < levels.length - 1; i++) {
    const y0 = levels[i];
    const y1 = levels[i + 1];
    const w0 = widthAt(y0);
    const w1 = widthAt(y1);
    for (const s of [-1, 1]) {
      braces.push(<Bar key={`f1${i}${s}`} a={[-w0, y0, s * w0]} b={[w1, y1, s * w1]} r0={0.2} color={col} />);
      braces.push(<Bar key={`f2${i}${s}`} a={[w0, y0, s * w0]} b={[-w1, y1, s * w1]} r0={0.2} color={col} />);
      braces.push(<Bar key={`f3${i}${s}`} a={[s * w0, y0, -w0]} b={[s * w1, y1, w1]} r0={0.2} color={col} />);
      braces.push(<Bar key={`f4${i}${s}`} a={[s * w0, y0, w0]} b={[s * w1, y1, -w1]} r0={0.2} color={col} />);
    }
  }
  const upper = [22, 30, 38, 46, 52];
  for (let i = 0; i < upper.length - 1; i++) {
    const y0 = upper[i];
    const y1 = upper[i + 1];
    braces.push(<Bar key={`u1${i}`} a={[-widthAt(y0), y0, -widthAt(y0)]} b={[widthAt(y1), y1, -widthAt(y1)]} r0={0.18} color={col} />);
    braces.push(<Bar key={`u2${i}`} a={[widthAt(y0), y0, -widthAt(y0)]} b={[-widthAt(y1), y1, -widthAt(y1)]} r0={0.18} color={col} />);
    braces.push(<Bar key={`u3${i}`} a={[-widthAt(y0), y0, widthAt(y0)]} b={[widthAt(y1), y1, widthAt(y1)]} r0={0.18} color={col} />);
  }
  return (
    <group>
      {legs.map(([sx, sz], i) => (
        <Bar key={i} a={[sx * 13, 0, sz * 13]} b={[sx * 5, 22, sz * 5]} r0={1.3} r1={0.8} color={col} />
      ))}
      {legs.map(([sx, sz], i) => (
        <Bar key={`m${i}`} a={[sx * 5, 22, sz * 5]} b={[sx * 1.6, 52, sz * 1.6]} r0={0.8} r1={0.5} color={col} />
      ))}
      {/* arco do primeiro andar */}
      <Bar a={[-9, 7, -9.2]} b={[9, 7, -9.2]} r0={0.9} color={col} />
      <Bar a={[-9, 7, 9.2]} b={[9, 7, 9.2]} r0={0.9} color={col} />
      <Box size={[12, 1.2, 12]} position={[0, 22.4, 0]} color="#7a6458" line={0.07} />
      <Box size={[6.2, 0.9, 6.2]} position={[0, 52, 0]} color="#7a6458" line={0.06} />
      <Cyl r={0.35} rb={1.5} h={23} seg={4} position={[0, 63.5, 0]} color={col} line={0.07} />
      <Cyl r={0.08} rb={0.12} h={9} seg={6} position={[0, 78, 0]} color="#3a2c2a" line={0.04} />
      {braces}
      {scaffold && (
        <group position={[12, 0, 12]}>
          {[0, 4, 8, 12].map((y) => (
            <Bar key={y} a={[-3, y, 3]} b={[3, y, 3]} r0={0.12} color="#b89a6a" />
          ))}
          {[-3, 3].map((x) => (
            <Bar key={x} a={[x, 0, 3]} b={[x, 13, 3]} r0={0.12} color="#b89a6a" />
          ))}
          <Box size={[6, 0.15, 2]} position={[0, 8, 3]} color="#9a7a4a" />
        </group>
      )}
    </group>
  );
}

function Building({position, size, tx, rot = 0}: {position: [number, number, number]; size: [number, number, number]; tx: Tex2; rot?: number}) {
  const [w, h, d] = size;
  const facade = useMemo(() => {
    const t = tx.facade.clone();
    t.needsUpdate = true;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(Math.round(w / 8), Math.round(h / 9));
    return t;
  }, [tx, w, h]);
  return (
    <group position={position} rotation-y={rot}>
      <Box size={[w, h, d]} position={[0, h / 2, 0]} color="#ffffff" map={facade} line={0.07} />
      <Box size={[w + 0.8, 1.2, d + 0.8]} position={[0, h + 0.6, 0]} color="#8a7a66" line={0.06} />
      <Box size={[w, 4.5, d * 0.8]} position={[0, h + 3.2, -d * 0.08]} color="#4b5870" line={0.07} />
      {[-0.3, 0.1, 0.35].map((k, i) => (
        <Box key={i} size={[0.9, 2.2, 0.9]} position={[w * k, h + 6.2, 0]} color="#8a5a48" line={0.05} />
      ))}
    </group>
  );
}

function Lamp({position}: {position: [number, number, number]}) {
  return (
    <group position={position}>
      <Cyl r={0.12} rb={0.18} h={4.2} position={[0, 2.1, 0]} color="#26212a" line={0.03} />
      <Sph r={0.38} position={[0, 4.4, 0]} color="#fff0c0" emissive="#ffd88a" line={0.03} />
    </group>
  );
}

function Tree({position}: {position: [number, number, number]}) {
  return (
    <group position={position}>
      <Cyl r={0.18} rb={0.26} h={2.2} position={[0, 1.1, 0]} color="#5a3a26" line={0.03} />
      <Sph r={1.5} position={[0, 3.3, 0]} color="#3f7a46" line={0.04} />
    </group>
  );
}

export function SkyDome({tx}: {tx: Tex2}) {
  return (
    <mesh>
      <sphereGeometry args={[120, 24, 16]} />
      <meshBasicMaterial map={tx.sky} side={THREE.BackSide} fog={false} />
    </mesh>
  );
}

// ---------- Praça de Paris, entardecer
export function ParisSet({tx, scaffold = false}: {tx: Tex2; scaffold?: boolean}) {
  const ground = useMemo(() => tx.cobble, [tx]);
  return (
    <group>
      <SkyDome tx={tx} />
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[240, 240]} />
        <meshToonMaterial map={ground} />
      </mesh>
      <group position={[0, 0, -42]} scale={0.5}>
        <Eiffel scaffold={scaffold} />
      </group>
      {/* quarteirões */}
      <Building tx={tx} position={[-26, 0, -18]} size={[18, 20, 16]} />
      <Building tx={tx} position={[-26, 0, -38]} size={[18, 18, 16]} />
      <Building tx={tx} position={[26, 0, -22]} size={[18, 19, 18]} />
      <Building tx={tx} position={[26, 0, -44]} size={[18, 21, 18]} />
      <Building tx={tx} position={[-30, 0, 6]} size={[16, 17, 16]} rot={0.5} />
      <Building tx={tx} position={[30, 0, 8]} size={[16, 18, 16]} rot={-0.5} />
      {/* delegacia (esquerda) */}
      <group position={[-9, 0, -8]}>
        <Box size={[9, 7, 5]} position={[0, 3.5, 0]} color="#d7c7a0" line={0.06} />
        <Box size={[9.6, 0.7, 5.6]} position={[0, 7.3, 0]} color="#6b5a46" line={0.05} />
        <Box size={[1.7, 3.4, 0.3]} position={[0, 1.7, 2.6]} color="#4a2f1f" line={0.04} />
        <Box size={[1.9, 0.3, 0.9]} position={[0, 0.15, 2.9]} color="#8a8070" line={0.03} />
        <mesh position={[0, 5.2, 2.55]}>
          <planeGeometry args={[5.4, 2.2]} />
          <meshBasicMaterial map={tx.placaPolicia} />
        </mesh>
        <Sph r={0.3} position={[-1.6, 3.9, 2.7]} color="#6aa8ff" emissive="#4a88ff" line={0.03} />
        <Sph r={0.3} position={[1.6, 3.9, 2.7]} color="#6aa8ff" emissive="#4a88ff" line={0.03} />
        {[-3, 3].map((x) => (
          <Box key={x} size={[1.3, 1.6, 0.2]} position={[x, 3.6, 2.55]} color="#3d4b66" line={0.04} />
        ))}
      </group>
      {/* hotel de luxo */}
      <group position={[-21, 0, -2]}>
        <Building tx={tx} position={[0, 0, 0]} size={[14, 16, 8]} />
        <Box size={[16, 0.8, 1.4]} position={[0, 4.6, 4.6]} color="#7a1f2a" line={0.05} />
        <Box size={[3.2, 4.4, 0.4]} position={[0, 2.2, 4.1]} color="#2a1810" line={0.04} />
        <mesh position={[0, 7.4, 4.12]}>
          <planeGeometry args={[7.6, 2.8]} />
          <meshBasicMaterial map={tx.placaHotel} />
        </mesh>
      </group>
      {/* estação (direita) */}
      <group position={[11, 0, -9]}>
        <Box size={[14, 9, 5]} position={[0, 4.5, 0]} color="#cfc0a0" line={0.06} />
        <Box size={[15, 0.8, 5.8]} position={[0, 9.3, 0]} color="#5a6a58" line={0.05} />
        <Box size={[4.4, 6, 0.5]} position={[0, 3, 2.6]} color="#1b1a22" line={0.04} />
        <mesh position={[0, 7.6, 2.55]}>
          <planeGeometry args={[7.2, 3.1]} />
          <meshBasicMaterial map={tx.placaEstacao} />
        </mesh>
        <Sph r={0.9} position={[-5, 7.8, 2.7]} color="#fff0c0" emissive="#ffd88a" line={0.04} />
        <Sph r={0.9} position={[5, 7.8, 2.7]} color="#fff0c0" emissive="#ffd88a" line={0.04} />
      </group>
      {/* placa da torre, caixa de correio, lampiões, árvores */}
      <group position={[3.6, 0, -24]} rotation-y={-0.2}>
        <Cyl r={0.12} h={2.6} position={[-1.5, 1.3, 0]} color="#3a2c2a" line={0.03} />
        <Cyl r={0.12} h={2.6} position={[1.5, 1.3, 0]} color="#3a2c2a" line={0.03} />
        <mesh position={[0, 2.2, 0.08]}>
          <planeGeometry args={[3.6, 1.8]} />
          <meshBasicMaterial map={tx.placaTorre} />
        </mesh>
        <Box size={[3.9, 2.1, 0.12]} position={[0, 2.2, -0.02]} color="#2a2018" line={0.03} />
      </group>
      <group position={[-3, 0, 4]}>
        <Box size={[0.9, 1.5, 0.9]} position={[0, 0.75, 0]} color="#c4281f" line={0.03} />
        <Cyl r={0.45} h={0.9} seg={16} position={[0, 1.7, 0]} color="#c4281f" line={0.03} />
        <Box size={[0.5, 0.08, 0.1]} position={[0, 1.2, 0.46]} color="#101010" noInk />
      </group>
      {[-12.5, 12.5].map((x) => [-4, 8, 20].map((z) => <Lamp key={`${x}${z}`} position={[x, 0, -z + 6]} />))}
      {[-14, 14].map((x) => [-6, -22].map((z) => <Tree key={`t${x}${z}`} position={[x, 0, z]} />))}
    </group>
  );
}

// ---------- Ferro-velho
export function ScrapSet({tx}: {tx: Tex2}) {
  const rust = ['#8a4b2a', '#6b6b6b', '#a1673a', '#59463a'];
  const piles = useMemo(() => {
    const out: JSX.Element[] = [];
    let s = 11;
    const r = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
    for (let i = 0; i < 46; i++) {
      const x = -9 + r() * 18;
      const z = -9 - r() * 7;
      const h = 0.6 + r() * 2.2;
      out.push(
        i % 3 === 0 ? (
          <Cyl key={i} r={0.3 + r() * 0.5} h={h * 2} position={[x, h, z]} color={rust[i % 4]} line={0.03} />
        ) : (
          <Box key={i} size={[0.8 + r() * 1.6, h, 0.6 + r()]} position={[x, h / 2, z]} color={rust[i % 4]} line={0.03} />
        ),
      );
    }
    return out;
  }, []);
  return (
    <group>
      <SkyDome tx={tx} />
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[240, 240]} />
        <meshToonMaterial color="#9a7a56" />
      </mesh>
      {piles}
      {/* cercas */}
      {Array.from({length: 41}, (_, i) => (
        <Box key={i} size={[0.3, 2.2, 0.12]} position={[-10 + i * 0.5, 1.1, -6]} color="#6b4a2a" line={0.025} />
      ))}
      <Box size={[20.4, 0.14, 0.14]} position={[0, 0.5, -5.92]} color="#4a3220" line={0.02} />
      <Box size={[20.4, 0.14, 0.14]} position={[0, 1.7, -5.92]} color="#4a3220" line={0.02} />
      {/* galpão com placa */}
      <group position={[0, 0, -18]}>
        <Box size={[12, 5, 6]} position={[0, 2.5, 0]} color="#8a6a4a" line={0.05} />
        <Box size={[13, 0.6, 7]} position={[0, 5.3, 0]} color="#4a4a52" line={0.05} />
        <mesh position={[0, 3.6, 3.05]}>
          <planeGeometry args={[7.6, 2.3]} />
          <meshBasicMaterial map={tx.placaSucata} />
        </mesh>
        <Box size={[2.2, 3.2, 0.3]} position={[0, 1.6, 3.05]} color="#3a2a1a" line={0.04} />
      </group>
      {/* guindaste */}
      <group position={[9, 0, -12]}>
        <Box size={[0.7, 8, 0.7]} position={[0, 4, 0]} color="#c8921a" line={0.04} />
        <Box size={[7, 0.5, 0.5]} position={[-2.8, 8, 0]} color="#c8921a" line={0.04} />
        <Cyl r={0.04} h={4} position={[-5.5, 6, 0]} color="#222" noInk />
        <Box size={[0.9, 0.3, 0.9]} position={[-5.5, 3.9, 0]} color="#3a3a3a" line={0.03} />
      </group>
      <group position={[-9, 0, -2]}>
        <Box size={[1.4, 1.1, 0.9]} position={[0, 0.55, 0]} color="#7a5a3a" line={0.04} />
      </group>
    </group>
  );
}

// ---------- Compartimento de trem (paisagem passando pela janela)
export function TrainSet({tx, t}: {tx: Tex2; t: number}) {
  const land = useMemo(() => {
    const l = tx.alpes.clone();
    l.needsUpdate = true;
    l.wrapS = THREE.RepeatWrapping;
    return l;
  }, [tx]);
  land.offset.x = -t * 0.18;
  const signX = 4.5 - (t - 44.55) * 6.4; // placa cruza a janela rapidamente
  return (
    <group>
      <color attach="background" args={['#2a1f22']} />
      {/* paredes de madeira */}
      <mesh position={[0, 1.4, -1.6]}>
        <planeGeometry args={[4.4, 2.8]} />
        <meshToonMaterial map={tx.metal} color="#a6683a" />
      </mesh>
      <mesh position={[-2.2, 1.4, 0]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[3.4, 2.8]} />
        <meshToonMaterial map={tx.metal} color="#8e5630" />
      </mesh>
      <mesh position={[2.2, 1.4, 0]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[3.4, 2.8]} />
        <meshToonMaterial map={tx.metal} color="#8e5630" />
      </mesh>
      <mesh position={[0, 2.8, 0]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[4.4, 3.4]} />
        <meshToonMaterial color="#d8c8a0" />
      </mesh>
      <mesh position={[0, 0, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[4.4, 3.4]} />
        <meshToonMaterial color="#4a2a2a" />
      </mesh>
      {/* janela com paisagem em movimento */}
      <group position={[0, 1.75, -1.58]}>
        <mesh position={[0, 0, 0.001]}>
          <planeGeometry args={[2.2, 1.2]} />
          <meshBasicMaterial map={land} />
        </mesh>
        {signX > -2 && signX < 2.4 && (
          <mesh position={[signX, -0.05, 0.01]}>
            <planeGeometry args={[1.3, 0.55]} />
            <meshBasicMaterial map={tx.placaAustria} />
          </mesh>
        )}
        <Box size={[2.5, 0.12, 0.1]} position={[0, 0.66, 0.05]} color="#d9b45a" />
        <Box size={[2.5, 0.12, 0.1]} position={[0, -0.66, 0.05]} color="#d9b45a" />
        <Box size={[0.12, 1.4, 0.1]} position={[-1.2, 0, 0.05]} color="#d9b45a" />
        <Box size={[0.12, 1.4, 0.1]} position={[1.2, 0, 0.05]} color="#d9b45a" />
      </group>
      {/* banco e malas */}
      <Box size={[1.6, 0.4, 0.8]} position={[0, 0.3, -1.1]} color="#8a1f2b" />
      <Box size={[1.6, 0.9, 0.2]} position={[0, 0.85, -1.45]} color="#8a1f2b" />
      <Box size={[0.9, 0.5, 0.5]} position={[1.5, 0.25, -1.2]} color="#4a3a2a" />
      <Box size={[4.2, 0.1, 0.6]} position={[0, 2.35, -1.3]} color="#c9a13a" />
      <Cyl r={0.1} h={0.2} position={[1.7, 2.6, -1.4]} color="#fff0c0" emissive="#ffd88a" />
    </group>
  );
}
