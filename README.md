# factoríacrm · landing

Landing cinematográfica para **factoríacrm** (CRM a medida). Next.js 15 (App Router) + Tailwind v4 + GSAP ScrollTrigger + Lenis + React Three Fiber.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # producción
```

Fuentes (Outfit, Instrument Sans, JetBrains Mono) se descargan de Google Fonts en el build vía `next/font`; en Vercel y en local funciona sin más.

## Estructura

```
app/
  layout.tsx          fuentes, metadata, <SmoothScroll>
  page.tsx            orden de secciones
  globals.css         tokens de marca (@theme), utilidades .btn .card .kcard…
components/
  SmoothScroll.tsx    Lenis enganchado al ticker de GSAP (un solo reloj para todo)
  Reveal.tsx          reveal por lotes para bloques estáticos ([data-rv])
  CanvasBoundary.tsx  si WebGL falla, la sección conserva su copy; la página nunca se cae
  sections/
    Nav.tsx           barra transparente (solo un degradado al hacer scroll, sin caja tras el logo)
    Hero.tsx          titular + fondo GLSL (AuroraBackground)
    Manifesto.tsx     palabras que se encienden con scrub
    Immersion.tsx     "Nos inundamos de tu proyecto" + scrub de fotogramas WebP (FrameSequence)
    Process.tsx       4 pasos pineados con timeline scrub
    Devices.tsx       portátil → tablet → móvil con la UI real del CRM en cada pantalla (DevicesScene)
    Pieces / Compare / Pricing / Faq / Cta
  scenes/
    AuroraBackground.tsx  shader de fondo del hero  ← sustituible por un export de HorizonX
    DevicesScene.tsx      tres dispositivos procedurales + <Html transform> con CrmBoard
  FrameSequence.tsx   canvas que pinta fotogramas WebP según el scrub del scroll
  ui/CrmBoard.tsx     la interfaz del CRM (variantes desktop / tablet / phone)
lib/
  gsap.ts             registro de plugins
  scrollProgress.ts   usePinnedProgress(): pin + progreso 0..1 en un ref
  immersionFrames.ts  rutas y conteo de la secuencia (`public/immersion/frame-XXX.webp`)
  textures.ts         texturas canvas (fachadas, pantalla del CRM) y el GLSL del hero
```

## Cómo funcionan las secciones cinematográficas

- **Inmersión**: `usePinnedProgress` pinea la sección 5 alturas de viewport. `FrameSequence` precarga ~50 WebP (~800 KB total, 960px) y pinta el fotograma correspondiente al progreso en un canvas (`object-fit: cover`). Fuente: MP4 cinematográfico → `npm run frames:immersion`. Letterbox CSS (`--bar`). El titular baja y encoge; cambian pie de foto y contador.
- **Dispositivos**: misma mecánica de pin, con paradas (la cámara "sujeta" cada dispositivo y planea entre ellos: `remap()`). Las pantallas son DOM real proyectado con `<Html transform occlude="blending">`. La escena vive en un `<group scale={100}>`: drei proyecta el DOM en CSS 3D con 1 unidad = 1 px y, con la cámara a pocas unidades, el compositor pierde precisión y la UI se desplaza del cristal; a escala ×100 encaja al píxel.

## Sustituir el hero por HorizonX

`components/scenes/AuroraBackground.tsx` es la única dependencia del hero. Desde Cursor con el MCP de HorizonX:

> Exporta el hero "Orvane Particle" (o el que prefieras) como componente React y colócalo en `components/scenes/HorizonHero.tsx`.

Luego en `Hero.tsx` cambia el `dynamic(() => import(...AuroraBackground))` por el nuevo componente. Marca el archivo con `"use client"` y, si toca `window`, mantén `ssr: false`.

## Pendientes de contenido

- Precios: `[DESDE X €]` y `[X €/mes]` en `Pricing.tsx`.
- Formulario de contacto: `Cta.tsx` tiene `action="#"`; conéctalo a una Server Action o a Supabase.
- Enlaces legales del footer.
- `latency.es` en el hero: ajusta la URL si es otra.

## Rendimiento

- Inmersión: secuencia WebP (~800 KB) en canvas 2D; sin WebGL.
- `dpr` limitado a 1.6–1.75 en los canvas 3D restantes; `Bloom` sin multisampling.
- `prefers-reduced-motion`: Lenis no se instancia y las animaciones de entrada se desactivan (`globals.css`). Las escenas 3D siguen respondiendo al scroll sin inercia.
- En móvil Devices se renderiza igual; si quieres ahorrar batería, condiciona `<Canvas>` a `matchMedia("(min-width: 768px)")` en `Devices.tsx` y deja el texto.
