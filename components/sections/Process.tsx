"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const STEPS = [
  { n: "01", t: "Descubrimiento", d: "Dos semanas con tu equipo comercial, no con un formulario. Cómo entra un lead, quién lo toca, dónde se pierde y qué necesitas ver cada lunes por la mañana.", e: "Entregable · Mapa del proceso comercial" },
  { n: "02", t: "Modelado", d: "Tu proceso se convierte en un esquema de datos propio: entidades, estados, permisos y reglas. Nada heredado de un CRM pensado para otro sector.", e: "Entregable · Modelo de datos y prototipo navegable" },
  { n: "03", t: "Fabricación", d: "Sprints semanales con cada entrega desplegada en un entorno real. Tu equipo lo prueba desde la primera semana y corrige el rumbo antes de que cueste caro.", e: "Entregable · Versiones semanales en producción" },
  { n: "04", t: "Evolución", d: "Lanzamos, medimos y seguimos. El CRM crece con el negocio: nuevas líneas, nuevos canales, nuevos informes. Tu roadmap, no el de un proveedor.", e: "Entregable · Mantenimiento y mejora continua" },
];

/**
 * Pinned, scrubbed timeline: each step slides in as the previous one
 * lifts away; the big number counts along; a lime bar tracks progress.
 */
export default function Process() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const steps = gsap.utils.toArray<HTMLElement>(".pstep");
      const visuals = gsap.utils.toArray<HTMLElement>(".pvis");
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pin.current,
          start: "top top",
          end: () => `+=${STEPS.length * window.innerHeight * 0.9}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
        },
      });
      gsap.set(steps.slice(1), { autoAlpha: 0, y: 40 });
      gsap.set(visuals.slice(1), { autoAlpha: 0, scale: 0.92, y: 30 });
      steps.forEach((step, i) => {
        if (i === 0) return;
        tl.to(steps[i - 1], { autoAlpha: 0, y: -40, duration: 0.5, ease: "power2.in" }, i)
          .to(visuals[i - 1], { autoAlpha: 0, scale: 1.06, y: -20, duration: 0.5, ease: "power2.in" }, i)
          .to(step, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }, i + 0.35)
          .to(visuals[i], { autoAlpha: 1, scale: 1, y: 0, duration: 0.8, ease: "power3.out" }, i + 0.35);
      });
      tl.to(".pbar", { scaleX: 1, ease: "none", duration: STEPS.length }, 0);
    },
    { scope: root },
  );

  return (
    <section id="proceso" ref={root} className="relative bg-[linear-gradient(180deg,#111435,#0b0d24_20%,#0b0d24_80%,#111435)]">
      <div ref={pin} className="flex h-screen items-center overflow-hidden">
        <div className="wrap grid w-full items-center gap-16 md:grid-cols-2">
          <div className="flex flex-col gap-10">
            <div className="mono eyebrow text-muted">Cómo lo fabricamos</div>
            <div className="relative min-h-[340px]">
              {STEPS.map((s) => (
                <div key={s.n} className="pstep absolute inset-0 flex flex-col gap-5">
                  <div className="disp text-[96px] font-light leading-none text-ink/90 md:text-[120px]">{s.n}</div>
                  <h3 className="disp text-[36px] md:text-[44px]">{s.t}</h3>
                  <p className="max-w-[520px] text-[17px] leading-relaxed text-[#c9cce8] md:text-[19px]">{s.d}</p>
                  <div className="mono">{s.e}</div>
                </div>
              ))}
            </div>
            <div className="h-0.5 max-w-[420px] overflow-hidden rounded bg-white/10">
              <div className="pbar h-full origin-left scale-x-0 bg-ink" />
            </div>
          </div>

          <div className="relative hidden h-[520px] md:block">
            {/* 01: process map */}
            <div className="pvis absolute inset-0 flex flex-col justify-center gap-3.5 p-6">
              <div className="grid grid-cols-3 gap-3.5">
                <div className="kcard border-blue/60"><span className="pill pill-b">Entrada</span><b>Web / formulario</b><small>lead sin cualificar</small></div>
                <div className="kcard"><span className="pill pill-b">Entrada</span><b>Llamada</b><small>recepción</small></div>
                <div className="kcard"><span className="pill pill-b">Entrada</span><b>Visita a puerta</b><small>captación en calle</small></div>
              </div>
              <Arrow />
              <div className="kcard border-lime/50"><span className="pill">Cuello de botella detectado</span><b>Asignación manual al comercial</b><small>media de 2 días de espera → lead frío</small></div>
              <Arrow />
              <div className="grid grid-cols-2 gap-3.5">
                <div className="kcard"><b>Visita + presupuesto</b><small>3 plantillas distintas</small></div>
                <div className="kcard"><b>Contrato firmado</b><small>papel + foto por WhatsApp</small></div>
              </div>
            </div>
            {/* 02: data model */}
            <div className="pvis absolute inset-0 grid grid-cols-2 content-center gap-4 p-6 font-mono text-[12px]">
              <Entity k="entidad" name="cuenta" rows={["razon_social", "cif", "zona_comercial", "estado: activa | baja"]} />
              <Entity k="entidad" name="oportunidad" hot rows={["cuenta_id", "etapa: 7 estados propios", "importe · probabilidad", "comercial_id"]} />
              <Entity k="entidad" name="visita" rows={["geolocalización", "resultado", "siguiente_accion"]} />
              <Entity k="regla" name="permisos por rol" rows={["comercial → su cartera", "jefe de zona → su zona", "dirección → todo"]} />
            </div>
            {/* 03: sprints */}
            <div className="pvis absolute inset-0 flex flex-col justify-center gap-3 p-6">
              {[["Sem 1", "Contactos + cuentas", 55], ["Sem 2", "Pipeline y etapas", 70], ["Sem 3", "App de campo", 62], ["Sem 4", "Automatizaciones + informes", 85]].map(([w, l, pct], i) => (
                <div key={w} className="grid grid-cols-[80px_1fr] items-center gap-3.5">
                  <span className="mono">{w}</span>
                  <div className={`flex h-10 items-center rounded-[10px] px-3.5 text-[13px] font-semibold ${i === 3 ? "bg-lime text-deep" : "bg-blue"}`} style={{ width: `${pct}%` }}>{l}</div>
                </div>
              ))}
              <div className="grid grid-cols-[80px_1fr] items-center gap-3.5">
                <span className="mono">Sem 5</span>
                <div className="flex h-10 w-[45%] items-center rounded-[10px] border border-dashed border-white/30 px-3.5 text-[13px] text-muted">Integraciones</div>
              </div>
              <div className="mono mt-4">Cada barra = una versión desplegada y probada por tu equipo</div>
            </div>
            {/* 04: growth */}
            <div className="pvis absolute inset-0 flex flex-col justify-center gap-5 p-6">
              <svg viewBox="0 0 520 260" className="w-full overflow-visible" aria-hidden="true">
                <defs>
                  <linearGradient id="gl" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#c1ff28" stopOpacity=".35" />
                    <stop offset="1" stopColor="#c1ff28" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 220 C 80 200, 120 190, 180 160 S 300 110, 360 90 S 460 40, 520 20 L 520 260 L 0 260 Z" fill="url(#gl)" />
                <path d="M0 220 C 80 200, 120 190, 180 160 S 300 110, 360 90 S 460 40, 520 20" fill="none" stroke="#c1ff28" strokeWidth="3" strokeLinecap="round" />
                <g fill="#111435" stroke="#c1ff28" strokeWidth="3">
                  <circle cx="180" cy="160" r="7" /><circle cx="360" cy="90" r="7" /><circle cx="520" cy="20" r="7" />
                </g>
                <g fontFamily="var(--font-jetbrains), monospace" fontSize="12" fill="#a2a6c8">
                  <text x="150" y="195">Lanzamiento</text><text x="325" y="125">Nueva línea de negocio</text><text x="420" y="60">Segundo país</text>
                </g>
              </svg>
              <div className="mono">El CRM cambia cuando cambia tu negocio, no cuando lo decide un proveedor</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Arrow() {
  return (
    <div className="flex justify-center text-lime" aria-hidden="true">
      <svg width="24" height="30" viewBox="0 0 24 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v30" /><path d="m5 25 7 7 7-7" />
      </svg>
    </div>
  );
}

function Entity({ k, name, rows, hot }: { k: string; name: string; rows: string[]; hot?: boolean }) {
  return (
    <div className={`kcard gap-2.5 ${hot ? "border-lime/50" : ""}`}>
      <span className={`pill ${hot ? "" : "pill-b"}`}>{k}</span>
      <b className="text-[14px]">{name}</b>
      <small className="leading-[1.8]">
        {rows.map((r) => (
          <span key={r} className="block">{r}</span>
        ))}
      </small>
    </div>
  );
}
