"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, RoundedBox, ContactShadows, Environment, Float, Lightformer } from "@react-three/drei";
import CrmBoard from "@/components/ui/CrmBoard";
import { damp } from "@/lib/scrollProgress";

/**
 * Three real devices in one space. The camera travels laptop → tablet →
 * phone as you scroll; each screen renders the live CRM interface
 * (drei <Html transform>), so the UI is real DOM projected onto glass.
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

const smooth = (a: number, b: number, x: number) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
/** Hold on each device, glide between them. */
const remap = (p: number) => 0.5 * smooth(0.16, 0.46, p) + 0.5 * smooth(0.58, 0.88, p);

function usePortrait() {
  const { size } = useThree();
  return size.width < 768 || size.height / Math.max(1, size.width) > 1.15;
}

function CameraRig({ progress }: { progress: React.MutableRefObject<number> }) {
  const { camera, size } = useThree();
  const p = useRef(0);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const pull = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, dt) => {
    // Slightly snappier on mobile so transitions don't lag behind Html projection
    const portrait = size.width < 768 || size.height / Math.max(1, size.width) > 1.15;
    p.current = damp(p.current, progress.current, portrait ? 7 : 5, dt);
    const t = remap(p.current);
    CAM.getPoint(t, pos);
    LOOK.getPoint(t, look);

    const cam = camera as THREE.PerspectiveCamera;
    if (portrait) {
      // Pull BACK so devices fit the upper band without overflowing / desyncing Html
      pull.copy(pos).sub(look);
      const dist = pull.length();
      if (dist > 0.001) {
        pull.multiplyScalar(1 / dist);
        pos.addScaledVector(pull, dist * 0.85);
      }
      // Keep subject in the upper half, above the copy card
      pos.y += 45;
      look.y += 28;
      cam.fov = 52;
    } else {
      cam.fov = 40;
    }
    cam.updateProjectionMatrix();
    camera.position.copy(pos);
    camera.lookAt(look);
  });
  return null;
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
        // blending occlusion + Float + portrait camera = screen drift; keep simple on mobile
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
        <Laptop />
        <Tablet />
        <Phone />
      </group>
      <ContactShadows position={[4.5 * S, -1.02 * S, 0]} opacity={0.55} scale={22 * S} blur={2.4} far={3 * S} color={"#02030c"} />
    </>
  );
}
