import Image from "next/image";
import Reveal from "@/components/Reveal";

export default function Cta() {
  return (
    <>
      <Reveal id="contacto" className="pb-28 pt-6">
        <div className="wrap">
          <div
            data-rv
            className="relative grid items-center gap-12 overflow-hidden rounded-[32px] border border-white/10 p-8 md:grid-cols-[1.1fr_.9fr] md:p-16"
            style={{ background: "radial-gradient(ellipse 60% 80% at 20% 50%, rgba(52,73,255,.55), transparent 60%), radial-gradient(ellipse 40% 60% at 90% 20%, rgba(193,255,40,.25), transparent 60%), #171b45" }}
          >
            <div className="flex flex-col gap-5">
              <div className="mono eyebrow text-muted">Empecemos</div>
              <h2 className="disp text-[40px] md:text-[60px]">
                Cuéntanos cómo vendes. <span className="font-light text-[#c9cce8]">Nosotros lo fabricamos.</span>
              </h2>
              <p className="max-w-[520px] text-[18px] leading-relaxed text-[#c9cce8]">Una llamada de 30 minutos para entender tu proceso. Te devolvemos una propuesta con alcance, plazo y precio cerrado.</p>
            </div>
            <form className="flex flex-col gap-3.5" action="#" method="post">
              <label htmlFor="f-nombre" className="mono">Nombre</label>
              <input id="f-nombre" name="nombre" type="text" placeholder="Tu nombre" autoComplete="name" className="fld" />
              <label htmlFor="f-email" className="mono">Email de empresa</label>
              <input id="f-email" name="email" type="email" placeholder="nombre@tuempresa.com" autoComplete="email" className="fld" />
              <label htmlFor="f-equipo" className="mono">Tamaño del equipo comercial</label>
              <input id="f-equipo" name="equipo" type="text" placeholder="p. ej. 12 comerciales en 3 zonas" className="fld" />
              <button type="submit" className="btn btn-lime mt-2 justify-center">Pedir propuesta</button>
              <span className="text-[13px] text-muted">Respondemos en menos de 24 h laborables.</span>
            </form>
          </div>
        </div>
      </Reveal>

      <footer className="border-t border-white/[0.08] bg-deep py-10">
        <div className="wrap flex flex-wrap items-center justify-between gap-6">
          <Image src="/logo.png" alt="factoríacrm" width={599} height={101} className="h-8 w-auto" />
          <div className="mono">© 2026 factoríacrm · un producto de Latency · A Coruña</div>
          <div className="flex gap-6 text-[14px] text-muted">
            <a href="#">Privacidad</a>
            <a href="#">Aviso legal</a>
            <a href="mailto:hola@factoriacrm.com">hola@factoriacrm.com</a>
          </div>
        </div>
      </footer>
    </>
  );
}
