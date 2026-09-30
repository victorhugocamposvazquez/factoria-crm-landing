/**
 * The CRM interface that appears on every screen. Pure markup so it can be
 * rendered inside a 3D device (drei <Html transform>) or as a normal block.
 * Sample data, clearly non-real.
 */
type Variant = "desktop" | "tablet" | "phone";

const COLS = [
  { t: "Contacto", n: 4, cards: [["Talleres Mendoza", "Llamada mañana 10:00"], ["Panadería Souto", "Visita a puerta · hoy"], ["Clínica Ría", "Formulario web"]] },
  { t: "Visita hecha", n: 3, cards: [["Hostal Marola", "Pide 2ª visita técnica"], ["Frutas Lago", "Decide el jueves"]] },
  { t: "Presupuesto", n: 5, hot: true, cards: [["Grupo Vilar", "Recordatorio automático"], ["Ferretería Ares", "Negociando plazo"], ["Óptica Coruña", "Pendiente firma"]] },
  { t: "Firmado", n: 2, done: true, cards: [["Autos Bergantiños", "Alta en facturación ✓"], ["Náutica Sada", "Instalación programada"]] },
];

export default function CrmBoard({ variant = "desktop", className = "" }: { variant?: Variant; className?: string }) {
  const isPhone = variant === "phone";
  const isTablet = variant === "tablet";
  const cols = isPhone ? COLS.slice(0, 2) : COLS;

  return (
    <div className={`flex h-full w-full flex-col overflow-hidden bg-navy text-ink ${className}`} style={{ fontFamily: "var(--font-instrument), system-ui, sans-serif" }}>
      {/* top bar */}
      <div className={`flex items-center justify-between border-b border-white/10 bg-deep ${isPhone ? "h-16 px-5 pt-5" : "h-12 px-5"}`}>
        <span className="mono !text-[11px]">{isPhone ? "Hoy · Zona Norte" : isTablet ? "Ruta del día · Zona Norte" : "app.tuempresa.com / pipeline"}</span>
        <span className="pill !text-[10px]">+ Nueva</span>
      </div>

      <div className="flex min-h-0 flex-1">
        {variant === "desktop" && (
          <aside className="flex w-[190px] flex-none flex-col gap-1 border-r border-white/10 p-3 text-[13px]">
            <div className="mono mb-2 px-2 !text-[10px]">Tu empresa</div>
            <div className="rounded-lg bg-blue/30 px-3 py-2 font-semibold">Pipeline</div>
            {["Cuentas", "Visitas de hoy", "Mapa de zonas", "Informes", "Automatizaciones"].map((l) => (
              <div key={l} className="px-3 py-2 text-muted">
                {l}
              </div>
            ))}
            <div className="mt-auto rounded-xl border border-lime/25 bg-lime/10 p-3 text-[11px] text-[#daff6e]">3 contratos pendientes de firma</div>
          </aside>
        )}

        <div className={`flex min-w-0 flex-1 flex-col gap-3 overflow-hidden ${isPhone ? "p-3" : "p-4"}`}>
          {!isPhone && (
            <div className="flex items-center justify-between">
              <h3 className="disp text-[20px]">{isTablet ? "Visitas asignadas" : "Pipeline · Zona Norte"}</h3>
              <span className="mono !text-[10px]">{isTablet ? "Jefe de zona" : "Dirección"}</span>
            </div>
          )}

          {isTablet && (
            <div className="relative h-[190px] overflow-hidden rounded-xl border border-white/10" style={{ background: "radial-gradient(circle at 30% 40%, rgba(52,73,255,.55), transparent 40%), radial-gradient(circle at 70% 65%, rgba(193,255,40,.4), transparent 35%), repeating-linear-gradient(0deg, rgba(255,255,255,.05) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, rgba(255,255,255,.05) 0 1px, transparent 1px 24px), #0b0d24" }}>
              <span className="absolute left-[28%] top-[36%] h-3 w-3 rounded-full bg-blue shadow-[0_0_0_6px_rgba(52,73,255,.25)]" />
              <span className="absolute left-[66%] top-[60%] h-3 w-3 rounded-full bg-lime shadow-[0_0_0_6px_rgba(193,255,40,.25)]" />
              <span className="absolute left-[48%] top-[30%] h-3 w-3 rounded-full bg-white/70" />
              <div className="absolute bottom-3 left-3 rounded-lg bg-deep/80 px-3 py-1.5 text-[11px]">Ruta óptima · 6 visitas · 42 km</div>
            </div>
          )}

          {isPhone ? (
            <div className="flex flex-col gap-2.5">
              <div className="kcard border-lime/40">
                <span className="pill">Siguiente visita · 10:00</span>
                <b>Talleres Mendoza</b>
                <small>Rúa da Pasaxe 12 · 1,2 km</small>
                <div className="mt-1 flex gap-2">
                  <span className="rounded-full bg-lime px-3 py-1 text-[11px] font-semibold text-deep">Navegar</span>
                  <span className="rounded-full border border-white/20 px-3 py-1 text-[11px]">Llamar</span>
                </div>
              </div>
              <div className="mono !text-[10px]">Después</div>
              {[["Panadería Souto", "11:15 · Visita a puerta"], ["Hostal Marola", "12:30 · 2ª visita técnica"], ["Frutas Lago", "16:00 · Cierre"]].map((c) => (
                <div key={c[0]} className="kcard">
                  <b>{c[0]}</b>
                  <small>{c[1]}</small>
                </div>
              ))}
              <div className="kcard bg-blue/30">
                <b>Sin cobertura</b>
                <small>2 visitas guardadas · se sincronizan al volver</small>
              </div>
            </div>
          ) : (
            <div className={`grid min-h-0 flex-1 gap-3 ${isTablet ? "grid-cols-2" : "grid-cols-4"}`}>
              {(isTablet ? cols.slice(0, 2) : cols).map((col) => (
                <div key={col.t} className={`kcol ${col.hot ? "border-lime/40" : ""}`}>
                  <div className="mono flex justify-between !text-[10px]">
                    <span className={col.hot ? "text-lime" : ""}>{col.t}</span>
                    <span className="text-ink">{col.n}</span>
                  </div>
                  {col.cards.map((c, j) => (
                    <div key={c[0]} className={`kcard ${col.done ? "bg-blue/30" : ""} ${col.hot && j === 0 ? "border-lime/40" : ""}`}>
                      <b>{c[0]}</b>
                      <small>{c[1]}</small>
                      {col.hot && j === 0 && <span className="pill">Recordatorio auto</span>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {variant === "desktop" && (
            <div className="grid grid-cols-3 gap-3">
              {[["Visitas esta semana", "38"], ["Presupuestos abiertos", "12"], ["Tiempo medio de respuesta", "14 min"]].map((k, i) => (
                <div key={k[0]} className={`kcard !py-3 ${i === 2 ? "border-lime/40" : ""}`}>
                  <small>{k[0]}</small>
                  <b className={`disp text-[22px] ${i === 2 ? "text-lime" : ""}`}>{k[1]}</b>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isPhone && (
        <div className="flex h-14 flex-none items-center justify-around border-t border-white/10 bg-deep text-[11px] font-semibold text-muted">
          <span className="text-lime">Hoy</span>
          <span>Ruta</span>
          <span>Visita</span>
          <span>Cuentas</span>
        </div>
      )}
    </div>
  );
}
