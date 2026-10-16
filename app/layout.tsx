import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Serif } from "next/font/google";
import Cabecera from "@/app/components/Cabecera";
import { getPalabras } from "@/lib/datos";
import { contarPorLetra } from "@/lib/letras";
import "./globals.css";

// IBM Plex: sans para la interfaz y los textos; serif para los lemas y el título.
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const plexSerif = IBM_Plex_Serif({
  variable: "--font-plex-serif",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "ABC Pradilla",
  description: "Vocabulario tradicional, dichos y expresiones de Pradilla.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Recuento de palabras por letra para el panel de escritorio (datos en caché).
  const recuento = contarPorLetra(await getPalabras());

  return (
    <html lang="es" data-scroll-behavior="smooth" className={`${plexSans.variable} ${plexSerif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* Primer elemento al tabular: salta la cabecera, el buscador y el índice.
            Sin las clases de BOTON mientras está oculto: su «relative» anularía el
            «absolute» de sr-only y el enlace ocuparía hueco arriba de la página. */}
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:inline-flex focus:h-12 focus:items-center focus:rounded-full focus:bg-ink focus:px-4 focus:text-base focus:text-paper"
        >
          Saltar al contenido
        </a>
        <Cabecera recuento={recuento} />
        <main id="contenido" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>
      </body>
    </html>
  );
}
