import Reveal from "@/components/Reveal";

const ROWS = [
  ["Coste por usuario", "Ninguno. Añade a todo el equipo.", "Cuota mensual por asiento"],
  ["Adaptación al proceso", "Total: se construye sobre tu proceso", "Tu equipo se adapta al producto"],
  ["Propiedad de los datos", "Tu base de datos, exportable siempre", "En su nube, con dependencia"],
  ["Propiedad del código", "Tuyo, entregado en tu repositorio", "No existe esa opción"],
  ["Integraciones", "Las que necesitas, a medida", "Las de su marketplace, de pago"],
  ["Evolución", "Tu roadmap, a tu ritmo", "El roadmap del proveedor"],
  ["Formación del equipo", "Mínima: ya trabajan así", "Semanas de onboarding"],
];

export default function Compare() {
  return (
    <Reveal id="comparativa" className="border-y border-white/[0.07] bg-deep py-28 md:py-32">
      <div className="wrap grid items-start gap-12 md:grid-cols-[380px_1fr] md:gap-16">
        <div data-rv className="flex flex-col gap-5 md:sticky md:top-32">
          <div className="mono eyebrow text-muted">A medida vs. genérico</div>
          <h2 className="disp text-[38px] md:text-[52px]">Lo que cambia cuando el CRM es tuyo</h2>
          <p className="text-[17px] leading-relaxed text-[#c9cce8]">Un CRM de suscripción es barato el primer mes y caro el resto de la vida de la empresa. Comparamos lo que de verdad importa.</p>
        </div>
        <div data-rv className="grid grid-cols-[1.2fr_1fr_1fr] border-t border-white/10 text-[14px] md:grid-cols-[1.3fr_1fr_1fr] md:text-[16px]">
          <div className="border-b border-white/10 p-3 md:p-5" />
          <div className="mono border-b border-white/10 bg-white/[0.04] p-3 !text-ink md:p-5">factoríacrm</div>
          <div className="mono border-b border-white/10 p-3 md:p-5">CRM genérico</div>
          {ROWS.map(([l, a, b]) => (
            <div key={l} className="contents">
              <div className="border-b border-white/10 p-3 font-medium text-muted md:p-5">{l}</div>
              <div className="border-b border-white/10 bg-white/[0.04] p-3 md:p-5">{a}</div>
              <div className="border-b border-white/10 p-3 text-muted md:p-5">{b}</div>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
