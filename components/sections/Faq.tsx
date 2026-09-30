import Reveal from "@/components/Reveal";

const QA = [
  ["¿Cuánto tarda un CRM a medida?", "Entre 4 y 10 semanas según el alcance. Desde la primera semana hay una versión desplegada que tu equipo puede probar; no esperas al final para ver resultados."],
  ["¿De quién es el código y los datos?", "Tuyos. El código se entrega en tu repositorio y la base de datos vive en tu propia cuenta de Supabase. Si mañana quieres cambiar de proveedor, te llevas todo."],
  ["¿Qué tecnología usáis?", "Next.js y TypeScript en el frontend, Supabase (PostgreSQL) como base de datos y autenticación, y despliegue en Vercel. Un stack moderno, estándar y fácil de mantener por cualquier equipo."],
  ["¿Podemos migrar desde nuestro CRM actual o desde Excel?", "Sí. La migración forma parte del proyecto: limpiamos, normalizamos e importamos tus cuentas, contactos e historial para que el primer día ya esté todo dentro."],
  ["¿Y si después necesitamos cambios?", "Para eso está el plan de evolución: una cuota mensual fija que cubre hosting, mantenimiento y una bolsa de horas para mejoras. Sin coste por usuario ni por módulo."],
];

export default function Faq() {
  return (
    <Reveal id="faq" className="pb-32 pt-10 md:pb-40">
      <div className="wrap grid gap-12 md:grid-cols-[380px_1fr] md:gap-16">
        <div data-rv className="flex flex-col gap-4">
          <div className="mono eyebrow text-muted">Preguntas frecuentes</div>
          <h2 className="disp text-[36px] md:text-[48px]">Lo que nos preguntan antes de empezar</h2>
        </div>
        <div data-rv>
          {QA.map(([q, a], i) => (
            <details key={q} open={i === 0} className="border-t border-white/10 last:border-b">
              <summary className="disp flex cursor-pointer items-center justify-between gap-6 py-6 text-[20px] font-medium md:text-[22px]">
                {q}
                <span className="plus grid h-8 w-8 flex-none place-items-center rounded-full border border-white/20 transition-all duration-300">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                </span>
              </summary>
              <p className="mb-6 max-w-[720px] text-[17px] leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
