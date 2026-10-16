'use client'

import Link from 'next/link'
import { guardarPosicion } from '@/lib/volver'

// Palabra del diccionario dentro de una definición o de los sinónimos («mies» en Parva).
// Abre solo esa palabra, arriba del todo; la ✕ devuelve a donde estabas (ver lib/volver.ts).
// Es un enlace dentro del texto: no se amplía a 48 px (excepción de WCAG para enlaces en línea).
export default function EnlacePalabra({ slug, texto }: { slug: string; texto: string }) {
  const href = `/?palabra=${encodeURIComponent(slug)}&desde=enlace`
  return (
    <Link
      href={href}
      onClick={() => guardarPosicion(href)}
      className="text-ink underline underline-offset-2 transition-opacity hover:no-underline active:opacity-70"
    >
      {texto}
    </Link>
  )
}
