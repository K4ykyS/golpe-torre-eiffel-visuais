import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Box, Cyl, Sph, Inked, cylGeo} from './kit';
import * as P from './paint';

export type Tex = {
  parquet: THREE.Texture;
  wall: THREE.Texture;
  wood: THREE.Texture;
  rug: THREE.Texture;
  paris: THREE.Texture;
  proposta: THREE.Texture;
  planta: THREE.Texture;
  carimbo: THREE.Texture;
  placa: THREE.Texture;
  dinheiro: THREE.Texture;
  cinta: THREE.Texture;
  quadro: THREE.Texture;
  envelope: THREE.Texture;
};

export function makeTextures(): Tex {
  return {
    parquet: P.parquet(),
    wall: P.wallpaper(),
    wood: P.wood(),
    rug: P.rug(),
    paris: P.parisView(),
    proposta: P.proposta(),
    planta: P.plantaTorre(),
    carimbo: P.carimbo(),
    placa: P.placaMaleta(),
    dinheiro: P.dinheiro(),
    cinta: P.cintaDinheiro(),
    quadro: P.quadro(),
    envelope: P.envelope(),
  };
}

const GOLD = '#d9b45a';
const VELVET = '#8a1f2b';

function Chair({position, rot = 0}: {position: [number, number, number]; rot?: number}) {
  return (
    <group position={position} rotation={[0, rot, 0]}>
      <Box size={[0.62, 0.1, 0.6]} position={[0, 0.45, 0]} color={VELVET} />
      <Box size={[0.66, 0.9, 0.1]} position={[0, 0.92, -0.3]} color={VELVET} />
      <Box size={[0.72, 0.06, 0.12]} position={[0, 1.4, -0.3]} color={GOLD} />
      {[[-0.28, -0.26], [0.28, -0.26], [-0.28, 0.26], [0.28, 0.26]].map(([x, z], i) => (
        <Box key={i} size={[0.06, 0.45, 0.06]} position={[x, 0.22, z]} color="#4b2412" />
      ))}
    </group>
  );
}

function Curtain({x}: {x: number}) {
  return (
    <group position={[x, 0, -4.35]}>
      <Box size={[0.7, 3.9, 0.35]} position={[0, 2.1, 0]} color={VELVET} line={0.015} />
      {[-0.22, 0, 0.22].map((o, i) => (
        <Box key={i} size={[0.04, 3.8, 0.38]} position={[o, 2.1, 0.02]} color="#6b1620" noInk />
      ))}
    </group>
  );
}

function Chandelier({t}: {t: number}) {
  const bulbs = Array.from({length: 6}, (_, i) => (i / 6) * Math.PI * 2);
  return (
    <group position={[1.0, 3.55, -0.2]}>
      <Cyl r={0.025} h={1.2} position={[0, 0.6, 0]} color={GOLD} />
      <Sph r={0.14} position={[0, 0, 0]} color={GOLD} />
      <Cyl r={0.5} rb={0.5} h={0.04} seg={32} position={[0, -0.05, 0]} color={GOLD} />
      {bulbs.map((a, i) => (
        <group key={i} position={[Math.cos(a) * 0.5, -0.05, Math.sin(a) * 0.5]}>
          <Cyl r={0.025} h={0.22} position={[0, 0.11, 0]} color={GOLD} noInk />
          <Sph r={0.07} position={[0, 0.28 + 0.0 * t, 0]} color="#fff3c8" emissive="#ffe29a" noInk />
        </group>
      ))}
    </group>
  );
}

export function Room({tx}: {tx: Tex}) {
  return (
    <group>
      {/* piso e tapete */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1]}>
        <planeGeometry args={[14, 12]} />
        <meshToonMaterial map={tx.parquet} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.1, 0.012, -0.3]}>
        <planeGeometry args={[6.4, 4.4]} />
        <meshToonMaterial map={tx.rug} />
      </mesh>
      {/* paredes */}
      <mesh position={[0, 2.5, -4.5]}>
        <planeGeometry args={[14, 5]} />
        <meshToonMaterial map={tx.wall} />
      </mesh>
      <mesh position={[-6, 2.5, -1]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[12, 5]} />
        <meshToonMaterial map={tx.wall} />
      </mesh>
      <mesh position={[7, 2.5, -1]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[12, 5]} />
        <meshToonMaterial map={tx.wall} />
      </mesh>
      <mesh position={[0, 4.6, -1]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 12]} />
        <meshToonMaterial color="#efe3c4" />
      </mesh>
      {/* rodapé e friso */}
      <Box size={[14, 0.3, 0.1]} position={[0, 0.15, -4.45]} color="#5a2f1a" />
      <Box size={[14, 0.14, 0.12]} position={[0, 4.45, -4.45]} color={GOLD} />
      <Box size={[14, 0.12, 0.1]} position={[0, 1.0, -4.46]} color={GOLD} />

      {/* janela com a Torre Eiffel ao fundo */}
      <group position={[-1.6, 2.15, -4.47]}>
        <mesh position={[0, 0, 0.005]}>
          <planeGeometry args={[1.75, 2.62]} />
          <meshBasicMaterial map={tx.paris} />
        </mesh>
        <Box size={[1.95, 0.12, 0.1]} position={[0, 1.36, 0.06]} color={GOLD} />
        <Box size={[1.95, 0.12, 0.1]} position={[0, -1.36, 0.06]} color={GOLD} />
        <Box size={[0.12, 2.8, 0.1]} position={[-0.92, 0, 0.06]} color={GOLD} />
        <Box size={[0.12, 2.8, 0.1]} position={[0.92, 0, 0.06]} color={GOLD} />
        <Box size={[0.07, 2.6, 0.07]} position={[0, 0, 0.06]} color={GOLD} />
        <Box size={[1.8, 0.07, 0.07]} position={[0, 0.35, 0.06]} color={GOLD} />
      </group>
      <Curtain x={-2.85} />
      <Curtain x={-0.35} />
      {/* espelho dourado */}
      <group position={[3.4, 2.4, -4.45]}>
        <Box size={[1.5, 2.3, 0.08]} color={GOLD} />
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[1.3, 2.1]} />
          <meshBasicMaterial color="#a9c8d4" />
        </mesh>
      </group>
      {/* quadro */}
      <group position={[-4.8, 2.5, -4.45]}>
        <Box size={[1.2, 1.5, 0.08]} color={GOLD} />
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[1.0, 1.3]} />
          <meshBasicMaterial map={tx.quadro} />
        </mesh>
      </group>
      <Chandelier t={0} />

      {/* aparador ao fundo à direita */}
      <Box size={[1.6, 0.9, 0.5]} position={[5.0, 0.45, -4.1]} color="#5a2f1a" map={tx.wood} />
      <Cyl r={0.12} rb={0.1} h={0.4} position={[4.7, 1.1, -4.1]} color="#2f6b66" />
      <Cyl r={0.1} rb={0.1} h={0.35} position={[5.3, 1.08, -4.1]} color="#c9a13a" />

      {/* mesa */}
      <group position={[1.1, 0, 0]}>
        <Box size={[4.4, 0.09, 1.3]} position={[0, 0.715, 0]} color="#6e3a20" map={tx.wood} line={0.012} />
        <Box size={[4.2, 0.16, 1.1]} position={[0, 0.6, 0]} color="#5a2f1a" />
        <Box size={[0.22, 0.6, 0.22]} position={[-1.8, 0.3, 0.45]} color="#4b2412" />
        <Box size={[0.22, 0.6, 0.22]} position={[1.8, 0.3, 0.45]} color="#4b2412" />
        <Box size={[0.22, 0.6, 0.22]} position={[-1.8, 0.3, -0.45]} color="#4b2412" />
        <Box size={[0.22, 0.6, 0.22]} position={[1.8, 0.3, -0.45]} color="#4b2412" />
        {/* feltro verde no centro */}
        <mesh position={[0, 0.763, 0.0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[4.0, 1.05]} />
          <meshToonMaterial color="#2a5a45" />
        </mesh>
      </group>
      {/* cadeiras */}
      <Chair position={[0.1, 0, -1.35]} />
      <Chair position={[1.3, 0, -1.35]} />
      <Chair position={[2.5, 0, -1.35]} />

      {/* adereços na mesa */}
      <group position={[0.7, 0.76, -0.5]}>
        <Cyl r={0.05} h={0.04} position={[0, 0.02, 0]} color="#1f1a1a" />
        <Cyl r={0.012} h={0.3} position={[0.0, 0.2, 0]} color="#d4a63c" />
        <Cyl r={0.12} rb={0.19} h={0.2} seg={16} position={[0, 0.42, 0]} color="#f6e7b8" emissive="#ffe29a" />
      </group>
      <group position={[3.15, 0.76, -0.3]}>
        <Cyl r={0.05} h={0.04} position={[0, 0.02, 0]} color="#1f1a1a" />
        <Cyl r={0.012} h={0.3} position={[0.0, 0.2, 0]} color="#d4a63c" />
        <Cyl r={0.12} rb={0.19} h={0.2} seg={16} position={[0, 0.42, 0]} color="#f6e7b8" emissive="#ffe29a" />
      </group>
      <Cyl r={0.1} rb={0.07} h={0.12} position={[1.9, 0.82, -0.5]} color="#f2efe6" />
      <Cyl r={0.1} rb={0.07} h={0.12} position={[-0.1, 0.82, -0.5]} color="#f2efe6" />
      {/* chapéu coco sobre a mesa */}
      <group position={[3.0, 0.8, 0.15]}>
        <Cyl r={0.2} rb={0.2} h={0.03} seg={24} position={[0, 0, 0]} color="#26211f" />
        <Sph r={0.14} position={[0, 0.05, 0]} color="#26211f" />
      </group>
    </group>
  );
}

// Braço 3D simples (manga + mão) entre dois pontos.
export function Limb3D({a, b, color, skin = '#f0c6a0', r = 0.055, hand = true}: {a: [number, number, number]; b: [number, number, number]; color: string; skin?: string; r?: number; hand?: boolean}) {
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...b);
  const mid = va.clone().add(vb).multiplyScalar(0.5);
  const len = va.distanceTo(vb);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
  const geo = useMemo(() => cylGeo(r, r * 1.05, 1, 16), [r]);
  return (
    <group>
      <group position={mid.toArray() as any} quaternion={q} scale={[1, len, 1]}>
        <Inked geo={geo} color={color} line={0.01 / Math.max(len, 0.3)} />
      </group>
      {hand && <Sph r={r * 0.95} position={b} color={skin} line={0.008} />}
      <Sph r={r * 1.08} position={vb.clone().lerp(va, 0.04).toArray() as any} color="#f3eedc" line={0.006} noInk />
    </group>
  );
}
