'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { PULSADO } from '@/lib/estilos'
import { LETRAS } from '@/lib/letras'

// Columnas iniciales (antes de medir) según la forma de la pantalla.
// En móvil en vertical siempre 4 (ver <CuadriculaLetras>).
const REJILLA =
  '[--cols:4] sm:portrait:[--cols:5] landscape:[--cols:9] [--hueco:8px] md:[--hueco:10px]'

// Casillas siempre cuadradas y cuadrícula de margen a margen. Lo que se adapta es el
// número de columnas: el menor con el que la cuadrícula, ocupando todo el ancho, cabe a
// lo alto (casillas lo más grandes posible). Nunca casillas de menos de 48 px: en una
// pantalla extremadamente baja, antes un poco de scroll que casillas más pequeñas.
function elegirColumnas(ancho: number, alto: number, hueco: number): number {
  let elegidas = 3
  for (let cols = 3; cols <= LETRAS.length; cols++) {
    const lado = (ancho - (cols - 1) * hueco) / cols
    if (lado < 48) break
    elegidas = cols
    const filas = Math.ceil(LETRAS.length / cols)
    if (filas * lado + (filas - 1) * hueco <= alto) break
  }
  return elegidas
}

// Móvil en vertical: siempre 4 columnas. Si a lo alto no caben, las casillas se
// encogen (siguen cuadradas) y la cuadrícula, algo más estrecha que los márgenes, se centra.
const MOVIL = '(max-width: 639px) and (orientation: portrait)'

// Abecedario completo; las letras sin palabras se muestran apagadas.
export default function CuadriculaLetras({ recuento }: { recuento: Record<string, number> }) {
  const lista = useRef<HTMLUListElement>(null)
  const [cols, setCols] = useState<number | null>(null)
  // Lado de la casilla en móvil (null: casillas de margen a margen).
  const [lado, setLado] = useState<number | null>(null)

  useEffect(() => {
    const ul = lista.current
    if (!ul) return
    const medir = () => {
      const raiz = getComputedStyle(document.documentElement)
      const px = (nombre: string) => parseFloat(raiz.getPropertyValue(nombre)) || 0
      // Alto libre bajo la barra fija, el buscador (móvil) o la fila de buscador y letras (escritorio).
      const alto = window.innerHeight - px('--alto-cabecera') - px('--alto-busqueda') - px('--alto-indice') - 40
      const hueco = parseFloat(getComputedStyle(ul).columnGap) || 8
      // Ancho disponible (el del contenedor sin márgenes): la lista puede ser más estrecha.
      const caja = ul.parentElement ?? ul
      const estilo = getComputedStyle(caja)
      const ancho = caja.clientWidth - parseFloat(estilo.paddingLeft) - parseFloat(estilo.paddingRight)
      if (window.matchMedia(MOVIL).matches) {
        const filas = Math.ceil(LETRAS.length / 4)
        const porAncho = (ancho - 3 * hueco) / 4
        const porAlto = (alto - (filas - 1) * hueco) / filas
        setCols(4)
        // Nunca menos de 48 px: en una pantalla muy baja, antes un poco de scroll.
        setLado(porAlto < porAncho ? Math.floor(Math.max(48, porAlto)) : null)
      } else {
        setCols(elegirColumnas(ancho, alto, hueco))
        setLado(null)
      }
    }
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(ul.parentElement ?? ul)
    window.addEventListener('resize', medir)
    return () => {
      observador.disconnect()
      window.removeEventListener('resize', medir)
    }
  }, [])

  return (
    <div className="px-margen py-5">
      <ul
        ref={lista}
        className={`${REJILLA} grid grid-cols-[repeat(var(--cols),minmax(0,1fr))] gap-(--hueco) max-sm:portrait:[--cols:4] ${lado ? 'mx-auto' : ''}`}
        style={
          cols
            ? ({ '--cols': cols, width: lado ? `calc(${lado * 4}px + 3 * var(--hueco))` : undefined } as CSSProperties)
            : undefined
        }
      >
        {LETRAS.map((letra) => {
          const total = recuento[letra] ?? 0
          // @container: la letra, el número y las esquinas se escalan con la casilla.
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
                <span className="absolute top-[7cqw] right-[9cqw] text-[clamp(10px,10cqw,14px)] text-muted transition-colors group-hover:text-paper/70">
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
