"use client";

/**
 * SiliconJourney — recorrido 3D por chip, buses y clúster de arquitectura.
 * Cámara scrub con GSAP ScrollTrigger; base #111435 + fog para legibilidad.
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export default function SiliconJourney() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111435);
    scene.fog = new THREE.FogExp2(0x111435, 0.07);

    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 4, 6);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x111435, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.shadowMap.enabled = true;
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    mount.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x5fa3ff, 1.8);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x3b82f6, 2, 15);
    pointLight.position.set(0, 1, 0);
    scene.add(pointLight);

    const chipMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1d4a,
      roughness: 0.4,
      metalness: 0.8,
    });

    const boardMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f1130,
      roughness: 0.7,
      metalness: 0.2,
    });

    const boardGeo = new THREE.PlaneGeometry(50, 50);
    const board = new THREE.Mesh(boardGeo, boardMaterial);
    board.rotation.x = -Math.PI / 2;
    board.position.y = -1;
    board.receiveShadow = true;
    scene.add(board);

    const coreChipGeo = new THREE.BoxGeometry(2.5, 0.2, 2.5);
    const coreChip = new THREE.Mesh(coreChipGeo, chipMaterial);
    coreChip.position.set(0, 0, 0);
    coreChip.castShadow = true;
    scene.add(coreChip);

    const clusterGroup = new THREE.Group();
    clusterGroup.position.set(0, -0.5, -12);

    const layerGeo = new THREE.BoxGeometry(3, 0.08, 1.8);
    const layer1Mat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.3 });
    const layer2Mat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3 });
    const layer3Mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });

    const layer1 = new THREE.Mesh(layerGeo, layer1Mat);
    const layer2 = new THREE.Mesh(layerGeo, layer2Mat);
    const layer3 = new THREE.Mesh(layerGeo, layer3Mat);
    layer1.position.y = 0;
    layer2.position.y = 0.2;
    layer3.position.y = 0.4;
    layer1.castShadow = true;
    layer2.castShadow = true;
    layer3.castShadow = true;
    clusterGroup.add(layer1, layer2, layer3);
    scene.add(clusterGroup);

    const busGeometry = new THREE.BoxGeometry(0.05, 0.02, 10);
    const busMaterial = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.3,
    });

    const buses: THREE.Mesh[] = [];
    for (let i = -3; i <= 3; i++) {
      if (i === 0) continue;
      const busLine = new THREE.Mesh(busGeometry, busMaterial);
      busLine.position.set(i * 0.3, -0.89, -6);
      scene.add(busLine);
      buses.push(busLine);
    }

    const scrollTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2,
      },
    });

    scrollTimeline
      .to(camera.position, { x: 1.5, y: 0.5, z: 3, ease: "power1.inOut" }, 0)
      .to(camera.rotation, { x: -0.2, y: 0.4, z: 0, ease: "power1.inOut" }, 0)
      .to(camera.position, { x: 0, y: 1.2, z: -8, ease: "none" }, 1)
      .to(layer3.position, { y: 1.4, ease: "power2.out" }, 2)
      .to(layer2.position, { y: 0.7, ease: "power2.out" }, 2)
      .to(layer1.position, { y: 0.0, ease: "power2.out" }, 2)
      .to(camera.position, { x: -2, y: 2, z: -11, ease: "power1.inOut" }, 2);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setSize(window.innerWidth, window.innerHeight, false);
    };
    window.addEventListener("resize", handleResize, { passive: true });

    let rafId = 0;
    let running = true;

    const animate = () => {
      if (!running) return;
      if (!reduced) {
        coreChip.rotation.y += 0.002;
        pointLight.position.z = Math.sin(Date.now() * 0.001) * 4 - 6;
      }
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
        running = false;
      } else if (!running) {
        running = true;
        rafId = requestAnimationFrame(animate);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", onVisibility);

      scrollTimeline.scrollTrigger?.kill();
      scrollTimeline.kill();

      scene.remove(board, coreChip, clusterGroup, ambientLight, dirLight, pointLight);
      buses.forEach((b) => scene.remove(b));

      coreChipGeo.dispose();
      boardGeo.dispose();
      layerGeo.dispose();
      busGeometry.dispose();
      chipMaterial.dispose();
      boardMaterial.dispose();
      layer1Mat.dispose();
      layer2Mat.dispose();
      layer3Mat.dispose();
      busMaterial.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full overflow-hidden"
      style={{ background: "#111435" }}
    />
  );
}
