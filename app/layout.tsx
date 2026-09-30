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
  title: "factoríacrm · Tu CRM, tus reglas.",
  description:
    "Diseñamos y fabricamos CRMs a medida para equipos comerciales: tu pipeline, tus etapas, tus reglas. Sin licencias por asiento.",
  openGraph: {
    title: "factoríacrm · Tu CRM, tus reglas.",
    description: "CRM a medida sobre Next.js, Supabase y Vercel. El código y los datos son tuyos.",
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
