const ITEMS = ["Pipeline propio", "Datos en tu Supabase", "Automatizaciones", "Mapas y rutas comerciales", "App de campo", "Integraciones reales", "Sin lock-in"];

export default function Marquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="overflow-hidden border-y border-white/[0.09] bg-deep py-4" aria-hidden="true">
      <div className="flex w-max gap-16 whitespace-nowrap motion-safe:animate-[marq_28s_linear_infinite]">
        {row.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-16 font-display text-[14px] uppercase tracking-[0.2em] text-muted">
            {t}
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
          </span>
        ))}
      </div>
    </div>
  );
}
