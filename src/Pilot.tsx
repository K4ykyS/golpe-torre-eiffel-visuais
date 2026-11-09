import React, {useEffect, useLayoutEffect, useMemo, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {loadFont as loadPlayfair} from '@remotion/google-fonts/PlayfairDisplay';
import {loadFont as loadElite} from '@remotion/google-fonts/SpecialElite';
import {Box, Cyl, Sph} from './kit';
import {Character3D} from './rig3d';
import {Limb3D, Room, makeTextures, Tex} from './world';
import {drawCharacter, EMPRESARIO_A, EMPRESARIO_B, LUSTIG, POISSON, Look, State, DW, DH} from './toon';
import {FPS, SHOTS, blink, camAt, envelopeX, envelopeZ, bundleX, bundleZ, key, keyv, pick, ramp, shotAt, outCubic, sm, lerp} from './story';

const SCALE = 2.0;
const CARD_H = 1.8;

function useCanvas() {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = DW * SCALE;
    c.height = DH * SCALE;
    return c;
  }, []);
}

export function Rig({cam}: {cam: ReturnType<typeof camAt>}) {
  const {camera} = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    const r = (cam.roll * Math.PI) / 180;
    c.position.set(...cam.p);
    c.up.set(Math.sin(r), Math.cos(r), 0);
    c.lookAt(...cam.l);
    c.fov = cam.fov;
    c.near = 0.05;
    c.far = 60;
    c.updateProjectionMatrix();
  });
  return null;
}

const yawTo = (cam: [number, number, number], p: [number, number, number]) => Math.atan2(cam[0] - p[0], cam[2] - p[2]);

export function Actor({look, state, pos, cam, yaw}: {look: Look; state: State; pos: [number, number, number]; cam: [number, number, number]; flip?: boolean; yaw?: number}) {
  const camYaw = yawTo(cam, pos);
  const y = yaw === undefined ? camYaw : yaw * 0.85 + camYaw * 0.15;
  return <Character3D look={look} state={state} pos={pos} yaw={y} />;
}

export function HotelPilot({t, tx, cam: camProp}: {t: number; tx: Tex; cam?: ReturnType<typeof camAt>}) {
  const cam = camProp ?? camAt(t);
  const shot = shotAt(t);

  // ---------- Lustig (de pé, à esquerda; a janela com a Torre fica atrás dele)
  const lustigDip = key(t, [[4.3, 0], [4.75, 0.2], [5.15, 0.2], [5.6, 0], [9.2, 0], [9.6, 0.1], [10.1, 0.0]]);
  const lustig: State = {
    expr: pick(t, [[0, 'confiante'], [2.9, 'sorriso'], [4.5, 'confiante'], [9.7, 'sorriso']] as any),
    look: keyv(t, [[0, [0.8, 0]], [1.4, [0.8, 0]], [1.7, [0.9, -0.4]], [2.9, [0.9, -0.4]], [3.2, [0.8, 0]], [4.4, [0.5, 0.7]], [5.3, [0.9, 0]], [9.2, [0.9, 0.1]], [9.6, [0.2, 0.4]], [10.0, [0, 0]]]) as any,
    turn: key(t, [[0, 0.5], [1.5, 0.5], [1.9, 0.6], [3.0, 0.6], [3.4, 0.6], [9.5, 0.6], [10.0, 0]]),
    blink: blink(t, 0.4, 2.7),
    aL: keyv(t, [[0, [-8, -4]], [1.5, [-8, -4]], [2.0, [-40, 30]], [3.0, [-40, 30]], [3.4, [-58, -74]], [3.9, [-58, -74]], [4.3, [-10, -4]]]) as any,
    aR: keyv(t, [[0, [10, 6]], [0.28, [10, 6]], [0.66, [98, 142]], [1.4, [98, 142]], [1.8, [100, 150]], [2.0, [112, 132]], [3.0, [112, 132]], [3.3, [62, 80]], [3.5, [48, 66]], [4.2, [20, 12]], [4.65, [25, 52]], [5.1, [26, 54]], [5.7, [14, 6]], [9.2, [14, 6]], [9.65, [30, 56]], [10.2, [50, 70]]]) as any,
    lean: key(t, [[0, 0], [1.9, -5], [3.0, -5], [3.5, 3], [4.6, 12], [5.2, 12], [5.8, 0], [9.5, 6], [10.2, 0]]),
    bob: lustigDip * 80 + Math.sin(t * 2.2) * 3,
    browPump: ramp(t, 0.4, 0.6) - ramp(t, 1.3, 1.7) + ramp(t, 9.7, 9.9) * 0.6,
    headTilt: key(t, [[0, 0], [2.5, -3], [9.7, -4], [10.2, 4]]),
  };

  // ---------- Empresário A (óculos) à esquerda de Poisson
  const A: State = {
    expr: pick(t, [[0, 'neutro'], [1.6, 'surpreso'], [3.1, 'preocupado'], [4.8, 'lendo'], [6.2, 'neutro'], [8.9, 'surpreso']] as any),
    look: keyv(t, [[0, [-0.8, 0]], [3.0, [-0.8, 0]], [4.9, [0.5, 0.6]], [5.8, [0.9, 0.1]], [8.9, [0.9, 0.1]]]) as any,
    turn: key(t, [[0, -0.4], [4.8, 0.3], [6, 0.5]]),
    blink: blink(t, 1.1, 3.0),
    aL: [-18, -30],
    aR: keyv(t, [[0, [20, 30]], [4.8, [20, 30]], [5.2, [38, 52]], [6.0, [20, 30]]]) as any,
    lean: key(t, [[0, 0], [1.6, -3], [3.0, 4], [6, 6]]),
    bob: Math.sin(t * 1.7) * 3,
    sweat: ramp(t, 3.1, 3.6) * (1 - ramp(t, 4.4, 4.5)),
  };

  // ---------- Poisson (colete, bigode farto) — o protagonista da cena
  const holding = t >= 6.12 && t < 8.75;
  const poisson: State = {
    expr: pick(t, [[0, 'neutro'], [1.5, 'astuto'], [3.1, 'surpreso'], [4.0, 'astuto'], [4.9, 'surpreso'], [6.12, 'lendo'], [6.95, 'surpreso'], [7.55, 'encantado'], [8.4, 'sorriso']] as any),
    look: keyv(t, [[0, [-0.8, 0]], [3.0, [-0.8, 0]], [4.6, [-0.6, 0.7]], [5.9, [-0.2, 0.9]], [6.15, [-0.9, 0.7]], [6.5, [0.9, 0.75]], [6.9, [-0.9, 0.75]], [7.1, [0.7, 0.2]], [8.2, [-0.5, 0.1]], [9.2, [-0.9, 0.5]]]) as any,
    turn: key(t, [[0, -0.5], [4.5, -0.3], [6.1, 0], [8.5, -0.5]]),
    blink: blink(t, 0.2, 2.2),
    aL: keyv(t, [[0, [-18, -30]], [5.7, [-18, -30]], [6.0, [-30, -48]], [8.3, [-30, -48]], [8.9, [-40, -72]], [9.7, [-30, -52]], [10.2, [-18, -30]]]) as any,
    aR: keyv(t, [[0, [18, 28]], [5.6, [18, 28]], [6.15, [10, -140]], [8.2, [10, -140]], [8.7, [24, 40]], [9.2, [20, 30]]]) as any,
    lean: key(t, [[0, 0], [4.8, 3], [5.9, -6], [7.4, -3], [8.5, 4], [9.8, 0]]),
    bob: key(t, [[0, 0], [5.0, 0], [5.1, 10], [5.4, 0], [7.4, 0], [7.55, 14], [7.9, 0], [9.3, 4], [9.8, 0]]) + Math.sin(t * 2) * 3,
    sweat: ramp(t, 6.85, 7.3) * (1 - ramp(t, 7.5, 7.7)),
    browPump: ramp(t, 6.9, 7.05) - ramp(t, 7.4, 7.7),
    prop: holding ? 'papel' : null,
    propHand: 'R',
    headTilt: key(t, [[0, 0], [6, -3], [7.5, 4], [9.5, 2]]),
  };

  const B: State = {
    expr: pick(t, [[0, 'neutro'], [1.6, 'surpreso'], [3.5, 'astuto'], [8.6, 'surpreso'], [9.4, 'encantado']] as any),
    look: keyv(t, [[0, [-0.7, 0]], [3.0, [-0.7, 0]], [4.8, [-0.9, 0.5]], [6.1, [-0.9, 0]]]) as any,
    turn: -0.5,
    blink: blink(t, 2.0, 2.9),
    aL: keyv(t, [[0, [-14, -26]], [8.6, [-14, -26]], [9.0, [-40, -60]]]) as any,
    aR: [14, 22],
    lean: key(t, [[0, 0], [1.6, 3], [8.6, 3]]),
    bob: Math.sin(t * 1.9 + 1) * 3,
  };

  const camP = cam.p;
  const hide = (a: number, b: number) => t >= a && t < b;

  // ---------- Objetos animados
  const envPos: [number, number, number] = [envelopeX(t), 0.795, envelopeZ(t)];
  const envRot = lerp(0.12, -0.18, outCubic((t - 4.78) / 1.2));
  const showEnv = t < 6.12;
  const stampY = key(t, [[3.05, 1.7], [3.2, 1.7], [3.45, 0.86], [3.6, 0.86], [3.95, 1.5]]);
  const stampPopped = t >= 3.45;
  const popS = lerp(1.35, 1, ramp(t, 3.45, 3.6));
  const lidA = key(t, [[8.3, 0], [8.75, -1.9]]);
  const bx = bundleX(t);
  const bz = bundleZ(t);
  const bundleLift = key(t, [[8.7, 0], [8.95, 0.07], [9.8, 0.0]]);
  const bundlePos: [number, number, number] = t < 8.85 ? [1.88, 0.86, -0.1] : [bx, 0.79 + bundleLift, bz];
  const letterY = key(t, [[7.55, 1.14], [8.2, 1.12], [8.75, 0.99]]);

  return (
    <>
        <color attach="background" args={['#2a1b2e']} />
        <fog attach="fog" args={['#c9a07a', 9, 22]} />
        <ambientLight intensity={1.15} color="#ffe6c4" />
        <hemisphereLight args={['#ffd9a8', '#5a3a5e', 0.85]} />
        <pointLight position={[1.0, 3.2, 0.2]} intensity={14} distance={12} color="#ffd89a" />
        <pointLight position={[-1.6, 2.4, -3.2]} intensity={9} distance={9} color="#ffb070" />
        <directionalLight position={[3, 3, 6]} intensity={1.0} color="#fff0d6" />

        <Room tx={tx} />

        {/* personagens */}
        <Actor look={LUSTIG} state={lustig} pos={[-1.15, 0, 0.0]} cam={camP} yaw={0.75} />
        <Actor look={EMPRESARIO_A} state={A} pos={[0.1, 0.58 - 0.9, -1.0]} cam={camP} />
        <Actor look={POISSON} state={poisson} pos={[1.3, 0.58 - 0.9, -1.0]} cam={camP} />
        <Actor look={EMPRESARIO_B} state={B} pos={[2.5, 0.58 - 0.9, -1.0]} cam={camP} />

        {/* planta da torre e carimbo */}
        <group position={[0.5, 0.775, 0.12]} rotation={[0, -0.16, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.0, 0.72]} />
            <meshBasicMaterial map={tx.planta} />
          </mesh>
          {stampPopped && (
            <mesh rotation={[-Math.PI / 2, 0, 0.08]} position={[0.08, 0.003, -0.02]} scale={[popS, popS, 1]}>
              <planeGeometry args={[0.36, 0.18]} />
              <meshBasicMaterial map={tx.carimbo} transparent />
            </mesh>
          )}
          {hide(3.05, 4.4) && (
            <group position={[0.08, stampY - 0.775, -0.02]}>
              <Cyl r={0.07} h={0.05} position={[0, 0.025, 0]} color="#3b2a1a" />
              <Cyl r={0.03} h={0.16} position={[0, 0.13, 0]} color="#5a3a22" />
              <Sph r={0.06} position={[0, 0.22, 0]} color="#5a3a22" />
              <Limb3D a={[-0.03, 1.1, 0.03]} b={[0, 0.27, 0]} color="#4a4f66" r={0.05} />
            </group>
          )}
        </group>

        {/* envelope deslizando */}
        {showEnv && (
          <group position={envPos} rotation={[0, envRot, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.52, 0.35]} />
              <meshBasicMaterial map={tx.envelope} />
            </mesh>
            <Box size={[0.52, 0.012, 0.35]} position={[0, -0.006, 0]} color="#e8d7a8" line={0.006} />
          </group>
        )}

        {/* maleta de Poisson */}
        <group position={[1.95, 0.8, -0.18]}>
          <Box size={[0.52, 0.1, 0.34]} color="#5a3a22" line={0.01} />
          <group position={[0, 0.05, -0.17]} rotation={[lidA, 0, 0]}>
            <Box size={[0.52, 0.06, 0.34]} position={[0, 0.03, 0.17]} color="#6a4528" line={0.01} />
            <mesh position={[0, 0.062, 0.17]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.2, 0.1]} />
              <meshBasicMaterial map={tx.placa} />
            </mesh>
          </group>
          <mesh position={[0, 0.052, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.48, 0.3]} />
            <meshBasicMaterial color="#2a1a14" />
          </mesh>
          {/* maços escondidos dentro */}
          {t < 8.85 && <Box size={[0.2, 0.06, 0.1]} position={[-0.1, 0.07, 0]} color="#c8b27a" line={0.006} />}
        </group>

        {/* maço de dinheiro */}
        {t >= 8.6 && (
          <group position={bundlePos} rotation={[0, lerp(0.2, -0.1, outCubic((t - 8.95) / 0.95)), 0]}>
            <Box size={[0.24, 0.07, 0.12]} position={[0, 0.035, 0]} color="#c8b27a" line={0.006} />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.072, 0]}>
              <planeGeometry args={[0.23, 0.115]} />
              <meshBasicMaterial map={tx.dinheiro} />
            </mesh>
            <mesh position={[0, 0.036, 0.0605]}>
              <planeGeometry args={[0.07, 0.07]} />
              <meshBasicMaterial map={tx.cinta} />
            </mesh>
          </group>
        )}

        {/* carta nas mãos de Poisson (detalhe legível) */}
        {shot.id === 'carta' && (
          <group position={[1.3, letterY, 0.1]} rotation={[0.08, Math.sin(t * 9) * 0.01, Math.sin(t * 13) * 0.008]}>
            <mesh>
              <planeGeometry args={[0.43, 0.59]} />
              <meshBasicMaterial map={tx.proposta} side={THREE.DoubleSide} />
            </mesh>
            <Limb3D a={[-0.42, -0.55, 0.0]} b={[-0.2, -0.22, 0.02]} color="#7a5a3e" skin="#eab48e" r={0.04} />
            <Limb3D a={[0.42, -0.55, 0.0]} b={[0.2, -0.22, 0.02]} color="#7a5a3e" skin="#eab48e" r={0.04} />
          </group>
        )}
    </>
  );
}


// Acabamento de documentário ilustrado: vinheta, grão de papel, faixa de legenda em português.
function Grade({t}: {t: number}) {
  const showTitle = t < 1.45;
  const a = Math.min(1, t / 0.2) * (1 - ramp(t, 1.15, 1.45));
  return (
    <>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 55%, rgba(20,8,24,0.55) 100%)', mixBlendMode: 'multiply'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(255,170,90,0.10), rgba(60,20,90,0.14))', mixBlendMode: 'soft-light'}} />
      {showTitle && (
        <div style={{position: 'absolute', left: 48, bottom: 150, opacity: a, color: '#f6ecd2', fontFamily: '"Playfair Display", serif', textShadow: '0 2px 8px rgba(10,4,16,0.8)'}}>
          <div style={{width: 56, height: 4, background: '#d9b45a', marginBottom: 14}} />
          <div style={{fontSize: 44, fontWeight: 700, letterSpacing: 1}}>Hotel de luxo</div>
          <div style={{fontSize: 30, opacity: 0.9, marginTop: 4}}>Paris · 1925</div>
        </div>
      )}
    </>
  );
}
