import Link from 'next/link'
import { PULSADO } from '@/lib/estilos'
import { LETRAS } from '@/lib/letras'

// Columnas × filas según la forma de la pantalla (27 letras):
// - vertical (móvil): 4 × 7; vertical desde sm (tableta): 5 × 6;
// - horizontal (escritorio, móvil tumbado): 9 × 3.
const REJILLA =
  '[--cols:4] [--filas:7] sm:portrait:[--cols:5] sm:portrait:[--filas:6] landscape:[--cols:9] landscape:[--filas:3] [--hueco:8px] md:[--hueco:10px]'

// Ancho máximo para que la cuadrícula quepa también a lo alto, sin scroll:
// lo que deja libre la pantalla bajo la barra fija, el buscador (móvil) o la fila de
// buscador y letras (escritorio), menos el padding (2 × 20 px).
const ANCHO_QUE_CABE =
  'calc((100dvh - var(--alto-cabecera) - var(--alto-busqueda) - var(--alto-indice) - 40px - (var(--filas) - 1) * var(--hueco)) / var(--filas) * var(--cols) + (var(--cols) - 1) * var(--hueco))'

// Abecedario completo; las letras sin palabras se muestran apagadas.
export default function CuadriculaLetras({ recuento }: { recuento: Record<string, number> }) {
  return (
    <div className="px-margen py-5">
      <ul
        className={`${REJILLA} mx-auto grid grid-cols-[repeat(var(--cols),minmax(0,1fr))] gap-(--hueco)`}
        style={{ width: `min(100%, ${ANCHO_QUE_CABE})` }}
      >
        {LETRAS.map((letra) => {
          const total = recuento[letra] ?? 0
          // @container: la letra y el recuento se escalan con el tamaño de la casilla.
          const base =
            '@container group relative flex aspect-square items-center justify-center rounded-[12%] border leading-none'

          if (total === 0) {
            return (
              <li key={letra}>
                <span className={`${base} border-rule text-rule`}>
                  <span className="text-[36cqw]">{letra}</span>
                  <span className="sr-only"> (sin palabras)</span>
                </span>
              </li>
            )
          }

          return (
            <li key={letra}>
              <Link
                href={`/letra/${letra}`}
                aria-label={`${letra.toUpperCase()}, ${total} ${total === 1 ? 'palabra' : 'palabras'}`}
                className={`${base} ${PULSADO} border-ink transition-[color,background-color,opacity] duration-100 hover:bg-ink hover:text-paper`}
              >
                <span className="text-[36cqw]">{letra}</span>
                <span className="absolute top-[6cqw] right-[8cqw] text-[clamp(10px,10cqw,14px)] text-muted transition-colors group-hover:text-paper/70">
                  {total}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
