import Link from 'next/link'
import { getPalabraDelDia } from '@/lib/palabraDelDia'

// Fila al inicio del listado: «Palabra del día» (primer nivel), la fecha (segundo)
// y la palabra, algo mayor que los lemas porque es una pieza destacada, con una
// flecha. Al pulsarla, el listado muestra solo esa palabra (/?palabra=slug), con ✕ para volver.
// Misma rejilla que las entradas: la palabra queda bajo las letras en escritorio.
export default async function PalabraDelDia() {
  const { palabra, fecha } = await getPalabraDelDia()

  return (
    <Link
      href={`/?palabra=${palabra.slug}`}
      aria-label={`Palabra del día, ${fecha}: ${palabra.palabra}. Ver definición`}
      className="group block border-b border-rule bg-campo px-margen py-5 transition-[background-color,opacity] duration-100 hover:bg-ink/5 active:opacity-70 motion-reduce:transition-none md:grid md:grid-cols-[12rem_1fr] md:items-center md:gap-6 lg:grid-cols-[minmax(0,1fr)_var(--ancho-letras)] lg:gap-10 lg:py-6"
    >
      <span className="block">
        <span className="block text-xl font-medium">Palabra del día</span>
        <span className="mt-0.5 block text-sm text-muted">{fecha}</span>
      </span>
      <span className="mt-3 flex items-baseline gap-2 md:mt-0">
        <span className="min-w-0 truncate font-serif text-[2rem] leading-tight lg:text-5xl">{palabra.palabra}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="size-5 shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transition-none lg:size-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 8h12M9.5 3.5 14 8l-4.5 4.5" />
        </svg>
      </span>
    </Link>
  )
}
