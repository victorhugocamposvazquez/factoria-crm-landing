"use client";

/**
 * SiliconCircuitBackground — pistas PCB ortogonales + pulsos de datos.
 * Cámara en Y/Z vía ScrollTrigger; niebla #111435 para legibilidad.
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const CIRCUIT_PATHS: number[][][] = [
  [
    [-5, 8, -2],
    [-5, 4, -2],
    [-2, 4, -2],
    [-2, 0, -1],
    [3, 0, -1],
    [3, -5, -3],
    [6, -5, -3],
  ],
  [
    [6, 6, -4],
    [2, 6, -4],
    [2, 2, -2],
    [-3, 2, -2],
    [-3, -3, -1],
    [-6, -3, -1],
  ],
  [
    [-1, 9, -3],
    [-1, 6, -3],
    [4, 6, -1],
    [4, 3, -1],
    [1, 3, -2],
    [1, -8, -2],
  ],
  [
    [-6, 2, -3],
    [-4, 2, -3],
    [-4, -2, -2],
    [0, -2, -2],
    [0, -6, -4],
    [5, -6, -4],
  ],
  // Buses de datos paralelos
  [
    [-1.8, 5, -1.5],
    [-1.8, 1, -1.5],
    [2.2, 1, -1.5],
    [2.2, -4, -2.5],
  ],
  [
    [-2.0, 5, -1.5],
    [-2.0, 1, -1.5],
    [2.0, 1, -1.5],
    [2.0, -4, -2.5],
  ],
  [
    [-2.2, 5, -1.5],
    [-2.2, 1, -1.5],
    [1.8, 1, -1.5],
    [1.8, -4, -2.5],
  ],
];

type Pulse = {
  curve: THREE.CatmullRomCurve3;
  mesh: THREE.Mesh;
  progress: number;
  speedOffset: number;
};

export default function SiliconCircuitBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x111435, 0.08);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 2, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x111435, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x1d2463,
      transparent: true,
      opacity: 0.4,
    });

    const disposables: THREE.BufferGeometry[] = [];
    const lines: THREE.Line[] = [];
    const pulses: Pulse[] = [];

    CIRCUIT_PATHS.forEach((pathPoints) => {
      const vecPoints = pathPoints.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
      const curve = new THREE.CatmullRomCurve3(vecPoints, false, "catmullrom", 0.05);

      const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(200));
      disposables.push(geometry);
      const line = new THREE.Line(geometry, lineMaterial);
      scene.add(line);
      lines.push(line);

      const pulseGeo = new THREE.SphereGeometry(0.04, 8, 8);
      disposables.push(pulseGeo);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: 0x5fa3ff,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      scene.add(pulseMesh);

      pulses.push({
        curve,
        mesh: pulseMesh,
        progress: Math.random(),
        speedOffset: 0.1 + Math.random() * 0.15,
      });
    });

    const scrollObj = { cameraY: 2, cameraZ: 8, pulseSpeedMultiplier: 1.0 };

    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      scrub: 1,
      onUpdate: (self) => {
        scrollObj.cameraY = 2 - self.progress * 10;
        scrollObj.cameraZ = 8 - self.progress * 3;
        // Acelera con progreso y con velocidad de scroll
        const velocityBoost = Math.min(Math.abs(self.getVelocity()) / 1200, 4);
        scrollObj.pulseSpeedMultiplier = 1.0 + self.progress * 5.0 + velocityBoost;
      },
    });

    const clock = new THREE.Clock();
    let rafId = 0;
    let running = true;

    const tick = () => {
      if (!running) return;
      const delta = reduced ? 0 : clock.getDelta();

      camera.position.y += (scrollObj.cameraY - camera.position.y) * 0.05;
      camera.position.z += (scrollObj.cameraZ - camera.position.z) * 0.05;
      camera.lookAt(0, camera.position.y - 2, -2);

      if (!reduced) {
        pulses.forEach((p) => {
          p.progress += delta * 0.08 * p.speedOffset * scrollObj.pulseSpeedMultiplier;
          if (p.progress > 1) p.progress = 0;
          p.mesh.position.copy(p.curve.getPointAt(Math.min(p.progress, 1)));
        });
      }

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setSize(window.innerWidth, window.innerHeight, false);
    };
    window.addEventListener("resize", handleResize, { passive: true });

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
        running = false;
      } else if (!running) {
        running = true;
        clock.start();
        rafId = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      st.kill();
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", onVisibility);

      lines.forEach((l) => scene.remove(l));
      pulses.forEach((p) => {
        scene.remove(p.mesh);
        if (Array.isArray(p.mesh.material)) {
          p.mesh.material.forEach((m) => m.dispose());
        } else {
          p.mesh.material.dispose();
        }
      });
      disposables.forEach((g) => g.dispose());
      lineMaterial.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      style={{ background: "#111435" }}
    />
  );
}
