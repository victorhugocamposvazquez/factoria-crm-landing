"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const LINKS = [
  ["#inmersion", "Método"],
  ["#proceso", "Proceso"],
  ["#dispositivos", "Dispositivos"],
  ["#piezas", "Piezas"],
  ["#precios", "Precios"],
  ["#faq", "FAQ"],
];

/** Transparent always: only a soft top fade appears on scroll, never a box behind the logo. */
export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32 transition-opacity duration-500"
        style={{ background: "linear-gradient(180deg, rgba(11,13,36,.85), rgba(11,13,36,0))", opacity: scrolled ? 1 : 0 }}
      />
      <div className="wrap relative flex h-[76px] items-center justify-between">
        <a href="#top" aria-label="factoríacrm, inicio" className="flex items-center">
          <Image src="/logo.png" alt="factoríacrm — Tu CRM, tus reglas." width={599} height={101} priority className="h-9 w-auto" />
        </a>
        <nav aria-label="Secciones" className="hidden items-center gap-9 md:flex">
          {LINKS.map(([href, label]) => (
            <a key={href} href={href} className="text-[14px] font-medium text-muted transition-colors hover:text-white">
              {label}
            </a>
          ))}
        </nav>
        <a href="#contacto" className="btn btn-lime !h-11 !px-5 !text-[15px]">
          Pedir propuesta
        </a>
      </div>
    </header>
  );
}
