import Reveal from "@/components/Reveal";

const PLANS = [
  { k: "Núcleo", t: "Pipeline y cuentas", price: "[DESDE X €]", note: "pago único", items: ["Pipeline con tus etapas", "Cuentas, contactos e historial", "Roles y permisos", "Informes básicos", "Entrega en 4–6 semanas"], cta: "Hablar del proyecto" },
  { k: "Operación", t: "Equipo de campo", price: "[DESDE X €]", note: "pago único", feat: true, items: ["Todo lo del Núcleo", "Mapas, zonas y rutas", "App móvil con modo sin conexión", "Automatizaciones y alertas", "Firma digital de contratos", "Entrega en 8–10 semanas"], cta: "Pedir propuesta" },
  { k: "Plataforma", t: "Varias líneas de negocio", price: "A medida", note: "", items: ["Todo lo de Operación", "Integraciones con ERP y facturación", "Multiempresa y multipaís", "Portal de cliente", "Equipo dedicado"], cta: "Contactar" },
];

export default function Pricing() {
  return (
    <Reveal id="precios" className="py-32 md:py-40">
      <div className="wrap flex flex-col gap-14">
        <div data-rv className="flex max-w-[720px] flex-col gap-4">
          <div className="mono eyebrow text-muted">Precios</div>
          <h2 className="disp text-[40px] md:text-[60px]">Un precio cerrado por fabricarlo. Sin sorpresas por usarlo.</h2>
          <p className="text-[18px] leading-relaxed text-[#c9cce8]">Cada proyecto se presupuesta tras el descubrimiento. Estos son los puntos de partida habituales.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.k}
              data-rv
              className={`flex flex-col gap-6 rounded-3xl border p-8 transition-transform duration-400 hover:-translate-y-1.5 ${p.feat ? "border-white/30 bg-[linear-gradient(180deg,rgba(255,255,255,.06),#171b45_60%)]" : "border-white/10 bg-surface"}`}
            >
              <div className="flex items-center justify-between">
                <div className={`mono ${p.feat ? "!text-ink" : ""}`}>{p.k}</div>
                {p.feat && <span className="pill">El más habitual</span>}
              </div>
              <h3 className="disp text-[30px]">{p.t}</h3>
              <div className="flex items-baseline gap-2">
                <span className="disp text-[40px]">{p.price}</span>
                {p.note && <span className="mono">{p.note}</span>}
              </div>
              <ul className="flex flex-col gap-3 text-[15px] text-[#d7d9f2]">
                {p.items.map((it) => (
                  <li key={it} className="flex items-start gap-2.5">
                    <span className="mt-0.5 block h-4 w-4 flex-none rounded-full bg-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,.35)]" />
                    {it}
                  </li>
                ))}
              </ul>
              <a href="#contacto" className={`btn mt-auto justify-center ${p.feat ? "btn-lime" : "btn-ghost"}`}>
                {p.cta}
              </a>
            </div>
          ))}
        </div>

        <div data-rv className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-7 py-5">
          <span className="mono !text-ink">Después del lanzamiento</span>
          <span className="text-[17px] text-[#c9cce8]">
            Mantenimiento, hosting y evolución desde <b className="text-ink">[X €/mes]</b>, sin coste por usuario. Puedes cancelarlo y quedarte con el código.
          </span>
        </div>
      </div>
    </Reveal>
  );
}
