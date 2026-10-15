import Link from 'next/link'
import { LETRAS } from '@/lib/letras'

// Abecedario completo; las letras sin palabras se muestran apagadas.
export default function CuadriculaLetras({ recuento }: { recuento: Record<string, number> }) {
  return (
    <ul className="grid grid-cols-4 gap-2 px-5 py-5 sm:grid-cols-7 md:gap-2.5 md:px-6">
      {LETRAS.map((letra) => {
        const total = recuento[letra] ?? 0
        const base =
          'group relative flex aspect-square items-center justify-center rounded-lg border leading-none text-5xl sm:text-6xl md:text-7xl'

        if (total === 0) {
          return (
            <li key={letra}>
              <span aria-disabled="true" className={`${base} border-rule text-rule`}>
                {letra}
              </span>
            </li>
          )
        }

        return (
          <li key={letra}>
            <Link
              href={`/letra/${letra}`}
              aria-label={`${letra.toUpperCase()}, ${total} ${total === 1 ? 'palabra' : 'palabras'}`}
              className={`${base} border-ink transition-colors hover:bg-ink hover:text-paper`}
            >
              {letra}
              <span className="absolute top-1.5 right-2 text-xs text-muted transition-colors group-hover:text-paper/70">
                {total}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
