import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Cabecera from "@/app/components/Cabecera";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "ABC Pradilla",
  description: "Vocabulario tradicional, dichos y expresiones de Pradilla.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" data-scroll-behavior="smooth" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Cabecera />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
