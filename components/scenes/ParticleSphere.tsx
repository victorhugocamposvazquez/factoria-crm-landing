"use client";

/**
 * ParticleSphere — hero WebGL autónomo (Three.js + GSAP ScrollTrigger).
 * Esfera de ~12k puntos, giro perezoso, zoom in + dispersión al hacer scroll.
 *
 * Props:
 * - progressRef opcional: si el padre ya mide el scrub, se usa; si no, el propio
 *   componente crea un ScrollTrigger sobre `triggerRef` / el contenedor.
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const COUNT = 12_000;
const SPHERE_RADIUS = 2.35;

const vert = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  attribute float aSeed;
  varying float vAlpha;

  mat3 rotX(float a) {
    float c = cos(a), s = sin(a);
    return mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c);
  }
  mat3 rotY(float a) {
    float c = cos(a), s = sin(a);
    return mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);
  }

  void main() {
    // 1. Giro perezoso base
    float t = uTime;
    vec3 p = rotX(t * 0.11) * rotY(t * 0.17) * position;

    // 2. Progreso con curva de aceleración agresiva (estilo Apple)
    float blast = pow(uProgress, 2.2);

    // 3. Dispersión radial masiva (abre la esfera como un embudo)
    float radial = 1.0 + blast * (6.5 + aSeed * 4.0);
    p.x *= radial;
    p.y *= radial;

    // 4. Empuje en profundidad (Z) crítico para rebasar la cámara
    p.z -= blast * (12.0 + aSeed * 8.0);

    // 5. Tamaño del punto con atenuación; oculta si ya rebasó la cámara
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float size = (1.6 + aSeed * 1.8 + uProgress * 1.4) * (300.0 / max(0.001, -mv.z));
    if (mv.z >= 0.0) {
      gl_PointSize = 0.0;
    } else {
      gl_PointSize = clamp(size, 0.8, 7.0);
    }

    gl_Position = projectionMatrix * mv;

    // 6. Más visibles al acercarse (suben alpha), sin difuminarse
    float grow = smoothstep(0.0, 0.75, uProgress);
    vAlpha = mix(0.45, 1.0, grow) * (0.5 + aSeed * 0.5);
  }
`;

const frag = /* glsl */ `
  precision mediump float;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    // Soft micro-dot (no hard square points)
    float core = smoothstep(0.5, 0.08, d);
    float halo = smoothstep(0.5, 0.0, d) * 0.35;
    float a = (core + halo) * vAlpha;
    // Soft cyber-blue / white-blue
    vec3 col = mix(vec3(0.62, 0.74, 1.0), vec3(0.95, 0.97, 1.0), core);
    gl_FragColor = vec4(col, a);
  }
`;

/** Fibonacci sphere — even, non-clumpy distribution. */
function buildSphere(count: number, radius: number) {
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    // Mild radius jitter so the shell isn't perfectly rigid
    const jitter = 0.92 + ((i * 97) % 100) / 100 * 0.16;
    positions[i * 3] = Math.cos(theta) * r * radius * jitter;
    positions[i * 3 + 1] = y * radius * jitter;
    positions[i * 3 + 2] = Math.sin(theta) * r * radius * jitter;
    seeds[i] = ((i * 16807) % 2147483647) / 2147483647;
  }
  return { positions, seeds };
}

type Props = {
  /** Section that owns the scroll range (hero). Required for ScrollTrigger. */
  triggerRef: React.RefObject<HTMLElement | null>;
  className?: string;
};

export default function ParticleSphere({ triggerRef, className }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const trigger = triggerRef.current;
    if (!host || !trigger) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // --- Renderer ---------------------------------------------------------
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x111336, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x111336, 0.018);

    const camera = new THREE.PerspectiveCamera(48, 1, 0.05, 80);
    const camStartZ = 7.2;
    const camEndZ = -3.5;
    camera.position.set(0, 0.15, camStartZ);

    // --- Geometry / material ----------------------------------------------
    const { positions, seeds } = buildSphere(COUNT, SPHERE_RADIUS);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Subtle interactive tilt (pointer)
    const pointer = { x: 0, y: 0 };
    const pointerTarget = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      pointerTarget.x = (e.clientX / w) * 2 - 1;
      pointerTarget.y = (e.clientY / h) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    // --- Resize -----------------------------------------------------------
    const resize = () => {
      const w = host.clientWidth || window.innerWidth;
      const h = host.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    // --- Scroll → camera + dispersion -------------------------------------
    const state = { progress: 0 };
    let st: ScrollTrigger | null = null;
    if (!reduced) {
      st = ScrollTrigger.create({
        trigger,
        start: "top top",
        end: "bottom top",
        scrub: 1,
        onUpdate: (self) => {
          state.progress = self.progress;
        },
      });
    }

    // --- RAF --------------------------------------------------------------
    let raf = 0;
    let running = true;
    const clock = new THREE.Clock();

    const tick = () => {
      if (!running) return;
      const dt = Math.min(0.05, clock.getDelta());
      const t = clock.elapsedTime;

      material.uniforms.uTime.value = t;
      // Ease progress into the shader / camera for extra fluidity
      const p = state.progress;
      material.uniforms.uProgress.value += (p - material.uniforms.uProgress.value) * 0.12;

      const prog = material.uniforms.uProgress.value;
      // Less fog as we dive in — particles stay crisp and bright
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.density = THREE.MathUtils.lerp(0.018, 0.004, prog);
      }
      // Dive straight into the sphere along Z
      camera.position.z = THREE.MathUtils.lerp(camStartZ, camEndZ, prog);
      // Micro parallax from pointer
      pointer.x += (pointerTarget.x - pointer.x) * 0.04;
      pointer.y += (pointerTarget.y - pointer.y) * 0.04;
      camera.position.x = pointer.x * 0.35 * (1 - prog * 0.7);
      camera.position.y = 0.15 - pointer.y * 0.22 * (1 - prog * 0.7);
      // Always look forward along -Z so the dive continues past the origin
      camera.lookAt(camera.position.x, camera.position.y, camera.position.z - 1);

      // Keep a faint spin even with reduced motion (no scrub)
      if (reduced) {
        material.uniforms.uTime.value = t * 0.35;
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
      void dt;
    };
    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      st?.kill();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, [triggerRef]);

  return (
    <div
      ref={hostRef}
      className={className}
      aria-hidden
      style={{ position: "absolute", inset: 0, background: "#111336" }}
    />
  );
}
