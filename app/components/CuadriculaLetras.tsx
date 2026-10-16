import Link from 'next/link'
import type { CSSProperties } from 'react'
import { PULSADO } from '@/lib/estilos'
import { LETRAS } from '@/lib/letras'

// Columnas × filas según la forma de la pantalla (27 letras):
// - vertical (móvil): 4 × 7; vertical desde sm (tableta): 5 × 6;
// - horizontal (escritorio, móvil tumbado): 9 × 3.
const REJILLA =
  '[--cols:4] [--filas:7] sm:portrait:[--cols:5] sm:portrait:[--filas:6] landscape:[--cols:9] landscape:[--filas:3] [--hueco:8px] md:[--hueco:10px]'

// La cuadrícula ocupa siempre el ancho entre los márgenes de la web y cabe sin scroll:
// - alto libre: la pantalla bajo la barra fija, el buscador (móvil) o la fila de buscador
//   y letras (escritorio), menos el padding (2 × 20 px);
// - alto con casillas cuadradas: el que saldría repartiendo el ancho (100cqw del contenedor);
// - se usa el menor de los dos. Si la pantalla es baja, las casillas se ensanchan en vez
//   de dejar huecos a los lados;
// - mínimo 48 px de alto por casilla.
const ESTILO = {
  '--alto-libre': 'calc(100dvh - var(--alto-cabecera) - var(--alto-busqueda) - var(--alto-indice) - 40px)',
  '--alto-cuadrado': 'calc((100cqw - (var(--cols) - 1) * var(--hueco)) / var(--cols) * var(--filas) + (var(--filas) - 1) * var(--hueco))',
  // Nunca casillas de menos de 48 px de alto (área táctil): en pantallas muy bajas, algo de scroll.
  '--alto-rejilla':
    'max(min(var(--alto-libre), var(--alto-cuadrado)), calc(48px * var(--filas) + (var(--filas) - 1) * var(--hueco)))',
  // Alto de cada fila: es el lado corto de la casilla, la medida para letra, número y esquinas.
  '--lado': 'calc((var(--alto-rejilla) - (var(--filas) - 1) * var(--hueco)) / var(--filas))',
  height: 'var(--alto-rejilla)',
} as CSSProperties

// Abecedario completo; las letras sin palabras se muestran apagadas.
export default function CuadriculaLetras({ recuento }: { recuento: Record<string, number> }) {
  return (
    <div className="@container px-margen py-5">
      <ul
        className={`${REJILLA} grid grid-cols-[repeat(var(--cols),minmax(0,1fr))] grid-rows-[repeat(var(--filas),minmax(0,1fr))] gap-(--hueco)`}
        style={ESTILO}
      >
        {LETRAS.map((letra) => {
          const total = recuento[letra] ?? 0
          const base =
            'group relative flex h-full items-center justify-center rounded-[calc(var(--lado)*0.12)] border text-[calc(var(--lado)*0.36)] leading-none'

          if (total === 0) {
            return (
              <li key={letra}>
                <span className={`${base} border-rule text-rule`}>
                  {letra}
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
                {letra}
                <span className="absolute top-[calc(var(--lado)*0.07)] right-[calc(var(--lado)*0.09)] text-[clamp(10px,calc(var(--lado)*0.1),14px)] text-muted transition-colors group-hover:text-paper/70">
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
