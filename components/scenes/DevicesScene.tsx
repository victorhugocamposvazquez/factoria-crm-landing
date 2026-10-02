"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, RoundedBox, ContactShadows, Environment, Float, Lightformer } from "@react-three/drei";
import CrmBoard from "@/components/ui/CrmBoard";
import { damp } from "@/lib/scrollProgress";

/**
 * Three devices in one space. Desktop: camera travels laptop → tablet → phone.
 * Mobile: one device at a time, tightly framed (no mixing).
 */
const S = 100;

const LAPTOP = { pos: new THREE.Vector3(0, 0, 0), rotY: 0.0 };
const TABLET = { pos: new THREE.Vector3(5.4, 0.35, -0.8), rotY: -0.32 };
const PHONE = { pos: new THREE.Vector3(9.3, 0.25, -0.3), rotY: -0.5 };

const CAM = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(-1.3, 0.55, 4.6),
    new THREE.Vector3(1.4, 1.4, 6.6),
    new THREE.Vector3(3.8, 0.6, 4.9),
    new THREE.Vector3(6.0, 1.2, 6.0),
    new THREE.Vector3(7.6, 0.45, 4.2),
  ].map((v) => v.multiplyScalar(S)),
  false,
  "centripetal",
  0.5,
);
const LOOK = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(-1.3, 0.1, 0),
    new THREE.Vector3(1.5, 0.4, -0.4),
    new THREE.Vector3(3.8, 0.3, -0.8),
    new THREE.Vector3(6.0, 0.3, -0.6),
    new THREE.Vector3(7.6, 0.2, -0.3),
  ].map((v) => v.multiplyScalar(S)),
  false,
  "centripetal",
  0.5,
);

/** Shared frontal stage on mobile — devices are recentered to origin. */
const MOBILE_FRAMES = [
  { pos: new THREE.Vector3(0, 0.35, 5.4).multiplyScalar(S), look: new THREE.Vector3(0, 0.1, 0).multiplyScalar(S), fov: 34 },
  { pos: new THREE.Vector3(0, 0.45, 5.1).multiplyScalar(S), look: new THREE.Vector3(0, 0.2, 0).multiplyScalar(S), fov: 32 },
  { pos: new THREE.Vector3(0, 0.35, 4.6).multiplyScalar(S), look: new THREE.Vector3(0, 0.15, 0).multiplyScalar(S), fov: 30 },
];

const smooth = (a: number, b: number, x: number) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const remap = (p: number) => 0.5 * smooth(0.16, 0.46, p) + 0.5 * smooth(0.58, 0.88, p);

/** Same thresholds as Devices.tsx copy stops. */
export function stopFromProgress(p: number) {
  return p < 0.31 ? 0 : p < 0.73 ? 1 : 2;
}

function usePortrait() {
  const { size } = useThree();
  return size.width < 768 || size.height / Math.max(1, size.width) > 1.15;
}

function CameraRig({ progress }: { progress: React.MutableRefObject<number> }) {
  const { camera, size } = useThree();
  const p = useRef(0);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  const targetLook = useMemo(() => new THREE.Vector3(), []);
  const fovRef = useRef(40);

  useFrame((_, dt) => {
    const portrait = size.width < 768 || size.height / Math.max(1, size.width) > 1.15;
    p.current = damp(p.current, progress.current, portrait ? 8 : 5, dt);
    const cam = camera as THREE.PerspectiveCamera;

    if (portrait) {
      const stop = stopFromProgress(p.current);
      const frame = MOBILE_FRAMES[stop];
      targetPos.copy(frame.pos);
      targetLook.copy(frame.look);

      pos.lerp(targetPos, 1 - Math.exp(-9 * dt));
      look.lerp(targetLook, 1 - Math.exp(-9 * dt));
      fovRef.current = damp(fovRef.current, frame.fov, 9, dt);
      cam.fov = fovRef.current;
    } else {
      const t = remap(p.current);
      CAM.getPoint(t, pos);
      LOOK.getPoint(t, look);
      fovRef.current = damp(fovRef.current, 40, 6, dt);
      cam.fov = fovRef.current;
    }

    cam.updateProjectionMatrix();
    camera.position.copy(pos);
    camera.lookAt(look);
  });
  return null;
}

/**
 * Mobile: stage each device alone at the origin, facing the camera.
 * Desktop: keep world layout; all visible.
 */
function SoloGroup({
  index,
  progress,
  home,
  children,
}: {
  index: number;
  progress: React.MutableRefObject<number>;
  home: { pos: THREE.Vector3; rotY: number };
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  const portrait = usePortrait();
  const opacity = useRef(index === 0 ? 1 : 0);

  useFrame((_, dt) => {
    if (!ref.current) return;
    if (!portrait) {
      ref.current.visible = true;
      ref.current.scale.setScalar(1);
      ref.current.position.set(0, 0, 0);
      ref.current.rotation.set(0, 0, 0);
      return;
    }
    const stop = stopFromProgress(progress.current);
    const target = stop === index ? 1 : 0;
    opacity.current = damp(opacity.current, target, 12, dt);
    const on = opacity.current > 0.05;
    ref.current.visible = on;
    // Bring the active device to a shared frontal stage (matches the clean mobile mock)
    ref.current.position.set(-home.pos.x, -home.pos.y + 0.15, -home.pos.z);
    ref.current.rotation.set(0, -home.rotY, 0);
    const s = 0.94 + opacity.current * 0.1;
    ref.current.scale.setScalar(s);
  });

  return <group ref={ref}>{children}</group>;
}

const shell = { color: "#2b3172", metalness: 0.7, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12 };

function Screen({ w, h, cssW, children }: { w: number; h: number; cssW: number; children: React.ReactNode }) {
  const portrait = usePortrait();
  const cssH = Math.round((cssW * h) / w);
  return (
    <group>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial color={"#05061a"} />
      </mesh>
      <Html
        transform
        occlude={portrait ? false : "blending"}
        zIndexRange={[4, 0]}
        distanceFactor={(400 * w) / cssW}
        position={[0, 0, 0.004]}
        style={{ width: cssW, height: cssH, overflow: "hidden", borderRadius: 6, pointerEvents: "none" }}
      >
        <div style={{ width: cssW, height: cssH }}>{children}</div>
      </Html>
    </group>
  );
}

function MaybeFloat({ children, ...props }: React.ComponentProps<typeof Float>) {
  const portrait = usePortrait();
  if (portrait) return <group>{children}</group>;
  return <Float {...props}>{children}</Float>;
}

function Laptop() {
  return (
    <group position={LAPTOP.pos} rotation={[0, LAPTOP.rotY, 0]}>
      <RoundedBox args={[3.3, 0.1, 2.2]} radius={0.04} smoothness={4} position={[0, -0.95, 0.2]}>
        <meshPhysicalMaterial {...shell} />
      </RoundedBox>
      <mesh position={[0, -0.895, 0.35]}>
        <boxGeometry args={[2.2, 0.004, 0.9]} />
        <meshStandardMaterial color={"#0b0d24"} roughness={0.9} />
      </mesh>
      <group position={[0, -0.9, -0.9]} rotation={[-0.2, 0, 0]}>
        <RoundedBox args={[3.3, 2.05, 0.07]} radius={0.04} smoothness={4} position={[0, 1.02, -0.04]}>
          <meshPhysicalMaterial {...shell} />
        </RoundedBox>
        <group position={[0, 1.02, 0]}>
          <Screen w={3.05} h={1.9} cssW={1280}>
            <CrmBoard variant="desktop" />
          </Screen>
        </group>
      </group>
    </group>
  );
}

function Tablet() {
  return (
    <group position={TABLET.pos} rotation={[0, TABLET.rotY, 0]}>
      <MaybeFloat speed={1.2} rotationIntensity={0.08} floatIntensity={0.25}>
        <RoundedBox args={[2.1, 2.95, 0.09]} radius={0.12} smoothness={6}>
          <meshPhysicalMaterial {...shell} />
        </RoundedBox>
        <group position={[0, 0, 0.046]}>
          <Screen w={1.92} h={2.76} cssW={820}>
            <CrmBoard variant="tablet" />
          </Screen>
        </group>
      </MaybeFloat>
    </group>
  );
}

function Phone() {
  return (
    <group position={PHONE.pos} rotation={[0, PHONE.rotY, 0]}>
      <MaybeFloat speed={1.5} rotationIntensity={0.12} floatIntensity={0.3}>
        <RoundedBox args={[1.17, 2.45, 0.085]} radius={0.16} smoothness={6}>
          <meshPhysicalMaterial {...shell} />
        </RoundedBox>
        <group position={[0, 0, 0.044]}>
          <Screen w={1.05} h={2.27} cssW={390}>
            <CrmBoard variant="phone" />
          </Screen>
        </group>
        <mesh position={[0, 1.05, 0.05]}>
          <capsuleGeometry args={[0.04, 0.18, 4, 8]} />
          <meshStandardMaterial color={"#05061a"} />
        </mesh>
      </MaybeFloat>
    </group>
  );
}

export default function DevicesScene({ progress }: { progress: React.MutableRefObject<number> }) {
  const portrait = usePortrait();

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[-4 * S, 6 * S, 6 * S]} intensity={1.6} color={"#8fa4ff"} />
      <directionalLight position={[10 * S, 5 * S, -4 * S]} intensity={1.2} color={"#c1ff28"} />
      <directionalLight position={[4 * S, 8 * S, 4 * S]} intensity={0.9} />
      <Environment resolution={256} environmentIntensity={1.1}>
        <Lightformer intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -2]} scale={[12, 6, 1]} color={"#dfe4ff"} />
        <Lightformer intensity={2.5} rotation-y={Math.PI / 2} position={[-6, 2, 0]} scale={[8, 3, 1]} color={"#8fa4ff"} />
        <Lightformer intensity={2} rotation-y={-Math.PI / 2} position={[12, 2, 0]} scale={[8, 3, 1]} color={"#c1ff28"} />
        <Lightformer intensity={1} position={[0, 1, 8]} scale={[16, 2, 1]} color={"#ffffff"} />
      </Environment>
      <CameraRig progress={progress} />
      <group scale={S}>
        <SoloGroup index={0} progress={progress} home={LAPTOP}>
          <Laptop />
        </SoloGroup>
        <SoloGroup index={1} progress={progress} home={TABLET}>
          <Tablet />
        </SoloGroup>
        <SoloGroup index={2} progress={progress} home={PHONE}>
          <Phone />
        </SoloGroup>
      </group>
      {!portrait && (
        <ContactShadows
          position={[4.5 * S, -1.02 * S, 0]}
          opacity={0.55}
          scale={22 * S}
          blur={2.4}
          far={3 * S}
          color={"#02030c"}
        />
      )}
    </>
  );
}
