import Reveal from "@/components/Reveal";

const I = {
  pipeline: <><rect x="3" y="4" width="5" height="16" rx="1.5" /><rect x="10" y="4" width="5" height="10" rx="1.5" /><rect x="17" y="4" width="4" height="13" rx="1.5" /></>,
  people: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4a3.5 3.5 0 0 1 0 7" /><path d="M18 14a6.5 6.5 0 0 1 3.5 6" /></>,
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  pin: <><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
  chart: <><path d="M3 20h18" /><path d="M6 16V9" /><path d="M11 16V4" /><path d="M16 16v-6" /></>,
  link: <><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" /></>,
  phone: <><rect x="6" y="2" width="12" height="20" rx="2.5" /><path d="M11 18h2" /></>,
};

function Icon({ d }: { d: React.ReactNode }) {
  return (
    <div className="grid h-11 w-11 place-items-center rounded-xl border border-blue/35 bg-blue/20 text-[#b8c0ff]">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
    </div>
  );
}

function Card({ icon, title, text, big, className = "", children }: { icon: React.ReactNode; title: string; text: string; big?: boolean; className?: string; children?: React.ReactNode }) {
  return (
    <div data-rv className={`card flex min-h-[260px] flex-col justify-between gap-6 ${className}`}>
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(52,73,255,.35),transparent_70%)] opacity-50 transition-opacity duration-400 group-hover:opacity-100" />
      <Icon d={icon} />
      <div className="flex flex-col gap-2.5">
        <h3 className={`disp ${big ? "text-[30px]" : "text-[26px]"}`}>{title}</h3>
        <p className="max-w-[560px] text-[16px] leading-relaxed text-[#c9cce8] md:text-[17px]">{text}</p>
      </div>
      {children}
    </div>
  );
}

export default function Pieces() {
  return (
    <Reveal id="piezas" className="py-32 md:py-40">
      <div className="wrap flex flex-col gap-14">
        <div className="grid items-end gap-10 md:grid-cols-2">
          <div data-rv className="flex flex-col gap-4">
            <div className="mono eyebrow text-muted">Las piezas</div>
            <h2 className="disp text-[40px] md:text-[60px]">Montamos solo lo que tu proceso necesita</h2>
          </div>
          <p data-rv className="max-w-[520px] text-[18px] leading-relaxed text-[#c9cce8]">
            Cada CRM se ensambla con piezas que ya hemos fabricado antes y piezas nuevas para ti. Pagas por lo que usas, no por un catálogo.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card big className="md:col-span-2" icon={I.pipeline} title="Pipeline con tus etapas" text="Kanban, lista o mapa: las mismas oportunidades vistas como las necesita cada rol. Etapas, motivos de pérdida y probabilidades definidas por ti." />
          <Card icon={I.people} title="Cuentas y contactos" text="Ficha única con historial completo: llamadas, visitas, documentos y contratos." />
          <Card icon={I.bolt} title="Automatizaciones" text="Asignación de leads, recordatorios, alertas de inactividad, generación de presupuestos. Sin Zapier de por medio." />
          <Card big className="md:col-span-2" icon={I.pin} title="Mapas, zonas y rutas comerciales" text="Asigna carteras por zona, planifica la ruta del día y registra la visita con geolocalización. Pensado para venta a puerta y equipos de campo." />
          <Card icon={I.chart} title="Informes en tiempo real" text="Los KPIs que miras cada lunes, sin exportar a Excel." />
          <Card icon={I.link} title="Integraciones" text="Email, WhatsApp, SMS, telefonía, facturación, firma digital. Las que usas, conectadas de verdad." />
          <Card icon={I.phone} title="App de campo" text="Móvil y tablet, funciona sin cobertura y sincroniza al volver. Firma de contratos in situ." />
        </div>
      </div>
    </Reveal>
  );
}
