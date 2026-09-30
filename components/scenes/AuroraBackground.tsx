"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { auroraFragment, basicVertex } from "@/lib/textures";

function AuroraPlane() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0.7, 0.3) },
    }),
    [],
  );
  const target = useRef(new THREE.Vector2(0.7, 0.3));

  useFrame((state, dt) => {
    if (!mat.current) return;
    mat.current.uniforms.uTime.value += dt;
    mat.current.uniforms.uRes.value.set(size.width, size.height);
    target.current.set(state.pointer.x * 0.5 + 0.5, state.pointer.y * 0.5 + 0.5);
    (mat.current.uniforms.uMouse.value as THREE.Vector2).lerp(target.current, 0.03);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={mat} vertexShader={basicVertex} fragmentShader={auroraFragment} uniforms={uniforms} depthWrite={false} depthTest={false} />
    </mesh>
  );
}

/**
 * Full-bleed GLSL aurora (blue → lime) behind the hero.
 * Swap this component for a HorizonX shader export when you have one:
 * it is the only thing the hero depends on.
 */
export default function AuroraBackground() {
  return (
    <Canvas dpr={[1, 1.5]} gl={{ antialias: false, powerPreference: "high-performance" }} orthographic camera={{ position: [0, 0, 1], zoom: 1 }}>
      <AuroraPlane />
    </Canvas>
  );
}
