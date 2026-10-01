import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-roboto",
  display: "swap",
});
const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-roboto-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "factoríacrm · El CRM que se adapta a tu proyecto",
  description:
    "Una herramienta hecha para tu empresa: organiza clientes, equipos y procesos y automatiza tu día a día.",
  openGraph: {
    title: "factoríacrm · El CRM que se adapta a tu proyecto",
    description: "Software de mejora empresarial. El código y los datos son tuyos.",
    locale: "es_ES",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${roboto.variable} ${robotoMono.variable}`}>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
