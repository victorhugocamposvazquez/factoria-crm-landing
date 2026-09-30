"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Sparkles, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import { makeFacadeTexture, makeCrmScreenTexture, mulberry32 } from "@/lib/textures";
import { damp } from "@/lib/scrollProgress";

/**
 * Camera dolly: night street → façade → through the lit window →
 * across the office → into the laptop screen. `progress` is the
 * scroll scrub (0..1) written by ScrollTrigger; we damp it so wheel
 * steps never show up as camera jumps.
 */

// Position path (world units, metres-ish). Segments are uniform in t,
// so the long street approach is fast and the interior is slow.
const CAM = [
  new THREE.Vector3(0, 3.2, 84),
  new THREE.Vector3(3.0, 3.6, 46),
  new THREE.Vector3(-1.4, 5.4, 20),
  new THREE.Vector3(0, 5.85, 5.5),
  new THREE.Vector3(0, 5.8, 0.6),
  new THREE.Vector3(0, 5.55, -3.2),
  new THREE.Vector3(0, 5.3, -5.3),
  new THREE.Vector3(0, 5.22, -6.25),
];
const LOOK = [
  new THREE.Vector3(0, 14, 0),
  new THREE.Vector3(0, 9, 0),
  new THREE.Vector3(0, 6.1, 0),
  new THREE.Vector3(0, 5.8, -3),
  new THREE.Vector3(0, 5.5, -6),
  new THREE.Vector3(0, 5.0, -7.5),
  new THREE.Vector3(0, 4.93, -7.62),
  new THREE.Vector3(0, 4.93, -7.62),
];

const camCurve = new THREE.CatmullRomCurve3(CAM, false, "centripetal", 0.5);
const lookCurve = new THREE.CatmullRomCurve3(LOOK, false, "centripetal", 0.5);

function CameraRig({ progress }: { progress: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  const p = useRef(0);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dt) => {
    p.current = damp(p.current, progress.current, 4.5, dt);
    const t = THREE.MathUtils.clamp(p.current, 0, 1);
    camCurve.getPoint(t, pos);
    lookCurve.getPoint(t, look);
    // hand-held micro movement, fades as we get to the screen
    const wob = (1 - t) * 0.12;
    const el = state.clock.elapsedTime;
    pos.x += Math.sin(el * 0.7) * wob;
    pos.y += Math.cos(el * 0.9) * wob * 0.6;
    camera.position.copy(pos);
    camera.lookAt(look);
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = THREE.MathUtils.lerp(56, 38, t);
    cam.updateProjectionMatrix();
  });
  return null;
}

function City() {
  const blocks = useMemo(() => {
    const rnd = mulberry32(42);
    const out: { pos: [number, number, number]; size: [number, number, number]; tex: THREE.Texture }[] = [];
    const add = (x: number, z: number, w: number, h: number, d: number, seed: number) => {
      // window density follows the building's real size: ~2.4 m per bay, ~3.2 m per floor
      const tex = makeFacadeTexture(seed, Math.max(2, Math.round(w / 2.4)), Math.max(3, Math.round(h / 3.2)), 0.22 + rnd() * 0.16);
      out.push({ pos: [x, h / 2, z], size: [w, h, d], tex });
    };
    // two rows flanking a wide avenue
    for (let side = -1; side <= 1; side += 2) {
      for (let z = 90; z > -70; z -= 12 + rnd() * 6) {
        if (side === 1 && z < 8 && z > -34) continue; // the target building's block
        const w = 9 + rnd() * 8;
        const d = 10 + rnd() * 8;
        const h = 14 + rnd() * 30;
        add(side * (26 + rnd() * 6 + w / 2), z, w, h, d, Math.floor(rnd() * 1e6));
      }
    }
    // second row behind, taller, for depth
    for (let side = -1; side <= 1; side += 2) {
      for (let z = 90; z > -90; z -= 16 + rnd() * 8) {
        const w = 14 + rnd() * 10;
        const h = 30 + rnd() * 40;
        add(side * (52 + rnd() * 14 + w / 2), z, w, h, 14, Math.floor(rnd() * 1e6));
      }
    }
    // far skyline
    for (let i = 0; i < 26; i++) {
      const w = 14 + rnd() * 18;
      const h = 40 + rnd() * 70;
      add((rnd() - 0.5) * 300, -110 - rnd() * 80, w, h, 16, Math.floor(rnd() * 1e6));
    }
    return out;
  }, []);

  const sky = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 4;
    c.height = 256;
    const g = c.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#03040f");
    grad.addColorStop(0.55, "#0a0d2c");
    grad.addColorStop(1, "#1a2260");
    g.fillStyle = grad;
    g.fillRect(0, 0, 4, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  const lamps = useMemo(() => {
    const arr: [number, number][] = [];
    for (let z = 84; z > -30; z -= 14) {
      arr.push([-13.5, z]);
      arr.push([13.5, z - 7]);
    }
    return arr;
  }, []);

  return (
    <group>
      {/* sky backdrop */}
      <mesh position={[0, 60, -230]}>
        <planeGeometry args={[900, 260]} />
        <meshBasicMaterial map={sky} fog={false} />
      </mesh>
      {blocks.map((b, i) => (
        <mesh key={i} position={b.pos}>
          <boxGeometry args={b.size} />
          <meshStandardMaterial map={b.tex} emissiveMap={b.tex} emissive={"#ffffff"} emissiveIntensity={0.85} color={"#2d3262"} roughness={0.9} metalness={0} />
        </mesh>
      ))}
      {/* wet asphalt */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color={"#05061a"} roughness={0.35} metalness={0.5} />
      </mesh>
      {/* sidewalks */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 18.5, 0.12, 10]}>
          <boxGeometry args={[9, 0.24, 200]} />
          <meshStandardMaterial color={"#10133a"} roughness={0.95} />
        </mesh>
      ))}
      {/* lane dashes */}
      {Array.from({ length: 22 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 88 - i * 6]}>
          <planeGeometry args={[0.25, 2.4]} />
          <meshBasicMaterial color={"#5c6398"} />
        </mesh>
      ))}
      {/* street lamps */}
      {lamps.map(([x, z], i) => (
        <group key={i} position={[x, 0.24, z]}>
          <mesh position={[0, 3.2, 0]}>
            <cylinderGeometry args={[0.07, 0.1, 6.4, 8]} />
            <meshStandardMaterial color={"#1a1e4a"} metalness={0.6} roughness={0.5} />
          </mesh>
          <mesh position={[x < 0 ? 0.9 : -0.9, 6.3, 0]}>
            <boxGeometry args={[1.8, 0.08, 0.08]} />
            <meshStandardMaterial color={"#1a1e4a"} metalness={0.6} roughness={0.5} />
          </mesh>
          <mesh position={[x < 0 ? 1.7 : -1.7, 6.15, 0]}>
            <sphereGeometry args={[0.22, 12, 12]} />
            <meshBasicMaterial color={"#ffd9a0"} />
          </mesh>
          {i % 2 === 0 && <pointLight position={[x < 0 ? 1.7 : -1.7, 5.9, 0]} intensity={40} color={"#ffd9a0"} distance={18} decay={2} />}
        </group>
      ))}
      {/* a couple of car light trails */}
      {[[-4, 40], [4, 20], [-4, -10]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.6, z]}>
          <boxGeometry args={[0.3, 0.12, 14]} />
          <meshBasicMaterial color={x < 0 ? "#ff5a4a" : "#fff1d6"} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

/** Front wall of the target building, built from four planes around the window opening. */
function TargetBuilding() {
  const facade = useMemo(() => {
    const t = makeFacadeTexture(99, 6, 12, 0.2);
    t.repeat.set(2, 1);
    return t;
  }, []);
  const W = 30; // width
  const H = 40; // height
  const ox = 1.7; // half opening width
  const oy0 = 4.6; // sill
  const oy1 = 7.0; // lintel
  const mat = (
    <meshStandardMaterial
      map={facade}
      emissiveMap={facade}
      emissive={"#ffffff"}
      emissiveIntensity={0.7}
      color={"#3a3f6e"}
      roughness={0.95}
    />
  );
  return (
    <group position={[0, 0, 0]}>
      {/* left */}
      <mesh position={[-(W / 2 + ox) / 2, H / 2, 0]}>
        <planeGeometry args={[W / 2 - ox, H]} />
        {mat}
      </mesh>
      {/* right */}
      <mesh position={[(W / 2 + ox) / 2, H / 2, 0]}>
        <planeGeometry args={[W / 2 - ox, H]} />
        {mat}
      </mesh>
      {/* top */}
      <mesh position={[0, (H + oy1) / 2, 0]}>
        <planeGeometry args={[ox * 2, H - oy1]} />
        {mat}
      </mesh>
      {/* bottom */}
      <mesh position={[0, oy0 / 2, 0]}>
        <planeGeometry args={[ox * 2, oy0]} />
        {mat}
      </mesh>
      {/* window frame */}
      <group>
        {[
          [-ox - 0.06, (oy0 + oy1) / 2, 0.12, oy1 - oy0 + 0.24],
          [ox + 0.06, (oy0 + oy1) / 2, 0.12, oy1 - oy0 + 0.24],
        ].map((f, i) => (
          <mesh key={i} position={[f[0], f[1], 0.02]}>
            <boxGeometry args={[f[2], f[3], 0.2]} />
            <meshStandardMaterial color={"#2a2f66"} roughness={0.6} />
          </mesh>
        ))}
        <mesh position={[0, oy1 + 0.06, 0.02]}>
          <boxGeometry args={[ox * 2 + 0.24, 0.12, 0.2]} />
          <meshStandardMaterial color={"#2a2f66"} roughness={0.6} />
        </mesh>
        <mesh position={[0, oy0 - 0.06, 0.02]}>
          <boxGeometry args={[ox * 2 + 0.24, 0.12, 0.3]} />
          <meshStandardMaterial color={"#2a2f66"} roughness={0.6} />
        </mesh>
      </group>
      {/* the sides of the building box so it reads as a volume */}
      <mesh position={[-W / 2, H / 2, -12]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[24, H]} />
        {mat}
      </mesh>
      <mesh position={[W / 2, H / 2, -12]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[24, H]} />
        {mat}
      </mesh>
    </group>
  );
}

function Office({ screenTex }: { screenTex: THREE.Texture }) {
  const floorY = 3.6;
  const ceilY = 8.6;
  const wall = <meshStandardMaterial color={"#1a1f4f"} roughness={0.9} />;
  return (
    <group>
      {/* room shell */}
      <mesh position={[0, floorY, -6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 12]} />
        <meshStandardMaterial color={"#0f1230"} roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh position={[0, ceilY, -6]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 12]} />
        {wall}
      </mesh>
      <mesh position={[0, (floorY + ceilY) / 2, -12]}>
        <planeGeometry args={[14, ceilY - floorY]} />
        {wall}
      </mesh>
      <mesh position={[-7, (floorY + ceilY) / 2, -6]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[12, ceilY - floorY]} />
        {wall}
      </mesh>
      <mesh position={[7, (floorY + ceilY) / 2, -6]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[12, ceilY - floorY]} />
        {wall}
      </mesh>
      {/* whiteboard with a lime process sketch on the back wall */}
      <mesh position={[3.2, 6.2, -11.95]}>
        <planeGeometry args={[4.2, 2.4]} />
        <meshStandardMaterial color={"#c9cce0"} roughness={0.6} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[1.8 + i * 1.4, 6.2, -11.9]}>
          <boxGeometry args={[0.9, 0.5, 0.01]} />
          <meshStandardMaterial color={i === 1 ? "#9ccf1c" : "#2a3ccf"} roughness={0.6} />
        </mesh>
      ))}
      {/* desk */}
      <mesh position={[0, 4.36, -7.1]}>
        <boxGeometry args={[3.2, 0.08, 1.4]} />
        <meshStandardMaterial color={"#23285c"} roughness={0.5} metalness={0.2} />
      </mesh>
      {[[-1.45, -6.5], [1.45, -6.5], [-1.45, -7.7], [1.45, -7.7]].map((l, i) => (
        <mesh key={i} position={[l[0], 3.98, l[1]]}>
          <boxGeometry args={[0.06, 0.72, 0.06]} />
          <meshStandardMaterial color={"#1a1e4a"} roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
      {/* mug */}
      <mesh position={[1.25, 4.44, -7.4]}>
        <cylinderGeometry args={[0.045, 0.04, 0.09, 16]} />
        <meshStandardMaterial color={"#f2f3ff"} roughness={0.4} />
      </mesh>
      {/* laptop */}
      <group position={[0, 4.4, -7.1]}>
        <mesh position={[0, 0.025, 0]}>
          <boxGeometry args={[1.6, 0.05, 1.05]} />
          <meshStandardMaterial color={"#1c2150"} roughness={0.35} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.051, 0.1]}>
          <boxGeometry args={[1.1, 0.002, 0.42]} />
          <meshStandardMaterial color={"#0b0d24"} roughness={0.8} />
        </mesh>
        <group position={[0, 0.05, -0.52]} rotation={[-0.21, 0, 0]}>
          <mesh position={[0, 0.5, -0.02]}>
            <boxGeometry args={[1.62, 1.02, 0.03]} />
            <meshStandardMaterial color={"#1c2150"} roughness={0.35} metalness={0.6} />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <planeGeometry args={[1.55, 0.97]} />
            <meshBasicMaterial map={screenTex} toneMapped={false} />
          </mesh>
        </group>
      </group>
      {/* desk lamp: warm pool of light on the desk */}
      <group position={[-1.15, 4.4, -7.5]}>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.12, 0.14, 0.04, 20]} />
          <meshStandardMaterial color={"#1a1e4a"} metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.66, 8]} />
          <meshStandardMaterial color={"#1a1e4a"} metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0.12, 0.7, 0]} rotation={[0, 0, -0.5]}>
          <coneGeometry args={[0.16, 0.22, 24, 1, true]} />
          <meshStandardMaterial color={"#23285c"} side={2} metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[0.17, 0.62, 0]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshBasicMaterial color={"#ffe2b0"} />
        </mesh>
        <pointLight position={[0.2, 0.6, 0]} intensity={4} color={"#ffd9a0"} distance={3.5} decay={2} />
      </group>
      {/* rug */}
      <mesh position={[0, 3.605, -6.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5, 3.4]} />
        <meshStandardMaterial color={"#171b45"} roughness={1} />
      </mesh>
      {/* lights inside */}
      <pointLight position={[0, 8.2, -7]} intensity={26} color={"#ffd9a0"} distance={14} decay={2} />
      <pointLight position={[0, 5.2, -6.4]} intensity={6} color={"#8fa4ff"} distance={4} decay={2} />
      <Sparkles count={60} scale={[10, 4, 10]} position={[0, 6, -6]} size={1.6} speed={0.25} opacity={0.35} color={"#c9cce8"} />
    </group>
  );
}

export default function ImmersionScene({ progress }: { progress: React.MutableRefObject<number> }) {
  const screenTex = useMemo(() => makeCrmScreenTexture(), []);
  return (
    <>
      <color attach="background" args={["#05061a"]} />
      <fog attach="fog" args={["#070a24", 40, 220]} />
      <ambientLight intensity={0.22} color={"#8fa4ff"} />
      <hemisphereLight args={["#2a3aa8", "#05061a", 0.5]} />
      <directionalLight position={[-30, 40, 30]} intensity={0.9} color={"#6f86ff"} />
      <Stars radius={200} depth={60} count={2500} factor={3} fade speed={0.4} />
      <City />
      <TargetBuilding />
      <Office screenTex={screenTex} />
      <CameraRig progress={progress} />
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.55} luminanceSmoothing={0.3} intensity={1.15} mipmapBlur radius={0.7} />
        <Noise premultiply opacity={0.07} />
        <Vignette eskil={false} offset={0.25} darkness={0.85} />
      </EffectComposer>
    </>
  );
}
