"use client";

/**
 * DataStreamBackground — hilo conductor WebGL (fixed) detrás de toda la landing.
 * Buses de datos verticales + pulsos acelerados por scroll (GSAP ScrollTrigger).
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const vertShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragShader = /* glsl */ `
  precision mediump float;
  uniform float uTime;
  uniform float uScroll;
  varying vec2 vUv;

  float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 uv = vUv;

    // factoríacrm navy #111435
    vec3 backgroundColor = vec3(0.0667, 0.0784, 0.2078);

    float columns = 14.0;
    float lineIndex = floor(uv.x * columns);
    float lineX = fract(uv.x * columns);

    // Hilo fino (estilo Apple)
    float lineThickness = smoothstep(0.028, 0.0, abs(lineX - 0.5));

    // Velocidad reactiva al scroll
    float speed = uTime * (1.6 + uScroll * 2.4) + uScroll * 5.0;
    float seed = rand(vec2(lineIndex, 0.17));
    float pulse = step(0.93 - uScroll * 0.04, fract(uv.y * (0.85 + seed * 0.4) - speed * (0.28 + seed * 0.45)));

    // Grid penumbra + pulso ciber-azul / blanco
    float gridAlpha = 0.035 + uScroll * 0.02;
    vec3 cyberBlue = vec3(0.22, 0.42, 1.0);
    vec3 softWhite = vec3(0.78, 0.86, 1.0);

    vec3 lineColor = mix(backgroundColor, cyberBlue, lineThickness * gridAlpha);
    lineColor = mix(lineColor, softWhite, pulse * lineThickness * 0.85);
    lineColor = mix(lineColor, cyberBlue * 1.15, pulse * lineThickness * 0.35);

    // Viñeta: bordes más oscuros → texto legible en el centro
    float vignette = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
    vignette = clamp(pow(16.0 * vignette, 0.42), 0.0, 1.0);
    vignette = mix(0.55, 1.0, vignette);

    gl_FragColor = vec4(mix(backgroundColor, lineColor, vignette), 1.0);
  }
`;

export default function DataStreamBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x111435, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader: vertShader,
      fragmentShader: fragShader,
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0 },
      },
      depthWrite: false,
      depthTest: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        material.uniforms.uScroll.value = self.progress;
      },
    });

    const clock = new THREE.Clock();
    let rafId = 0;
    let running = true;

    const tick = () => {
      if (!running) return;
      if (!reduced) {
        material.uniforms.uTime.value = clock.getElapsedTime();
      }
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const handleResize = () => {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
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
      geometry.dispose();
      material.dispose();
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
