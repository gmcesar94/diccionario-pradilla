'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { CampoBusqueda } from '@/app/components/Buscador'
import { Cerrar } from '@/app/components/iconos'
import { PULSADO } from '@/lib/estilos'
import { LETRAS } from '@/lib/letras'

// Escritorio: buscador y filtro por letras en una misma fila, fija justo debajo
// de la barra oscura (la introducción de la home se va con el scroll; esto no).
// En escritorio todo mide 36 px, como los botones de la barra. Desde 1184 px: «Todas» y
// las letras con palabras, en círculos (las 27 no caben junto al buscador; el abecedario
// completo está en el Índice). Entre 1024 y 1183 px no caben: [Todas] [Por letra] [B ⓧ], como en móvil.
export default function PanelBusqueda({
  recuento,
  ruta,
  valor,
  onBuscar,
  filtrandoPalabra = false,
}: {
  recuento: Record<string, number>
  ruta: string
  valor: string
  onBuscar?: (texto: string) => void
  // Con una sola palabra filtrada (?palabra=) «Todas» no está activa.
  filtrandoPalabra?: boolean
}) {
  const letras = useRef<HTMLDivElement>(null)
  const fila = useRef<HTMLDivElement>(null)

  // Altura de la fila fija: las anclas (/#palabra) y el Índice la descuentan.
  // Solo se publica si está visible (en móvil es <FiltroLetras> quien la publica).
  useEffect(() => {
    const el = fila.current
    if (!el) return
    const medir = new ResizeObserver(() => {
      if (el.offsetHeight > 0) document.documentElement.style.setProperty('--alto-indice', `${el.offsetHeight}px`)
    })
    medir.observe(el)
    return () => {
      medir.disconnect()
      if (el.offsetHeight > 0) document.documentElement.style.setProperty('--alto-indice', '0px')
    }
  }, [])

  // Ancho del bloque de letras: es la columna de las definiciones del listado,
  // para que empiecen justo donde empieza «Todas» (misma rejilla).
  useEffect(() => {
    const el = letras.current
    if (!el) return
    const medir = new ResizeObserver(() => {
      if (el.offsetWidth > 0) document.documentElement.style.setProperty('--ancho-letras', `${el.offsetWidth}px`)
    })
    medir.observe(el)
    return () => medir.disconnect()
  }, [])

  const activa = ruta.startsWith('/letra/')
    ? decodeURIComponent(ruta.split('/')[2] ?? '')
    : ruta === '/' && !filtrandoPalabra
      ? null
      : undefined
  // Misma altura que el buscador y que los botones de la barra (36 px).
  const casilla = `inline-flex h-9 items-center justify-center rounded-full border text-sm transition-[color,background-color,opacity] duration-100 ${PULSADO}`
  // Sobre la franja oscura: activa en crema; el resto con borde claro.
  const estado = (activo: boolean) =>
    activo ? 'border-paper bg-paper text-oscuro hover:opacity-85' : 'border-paper/50 hover:bg-paper hover:text-oscuro'

  return (
    <div
      ref={fila}
      className={`sticky top-(--alto-cabecera) z-20 hidden items-center gap-10 bg-oscuro px-margen pt-4 pb-8 text-paper lg:flex`}
    >
      <div role="search" className="flex min-w-0 flex-1">
        <CampoBusqueda valor={valor} onChange={onBuscar} />
      </div>

      {/* Su ancho (--ancho-letras) es la columna de las definiciones: entre 1024 y 1183 px, 30rem
          fijos (la versión compacta es corta); desde 1184 px, el de las letras. */}
      <div ref={letras} className="w-[30rem] shrink-0 min-[1184px]:w-auto">
        <nav aria-label="Letras" className="flex gap-2 min-[1184px]:hidden">
          <Link
            href="/"
            aria-current={activa === null ? 'page' : undefined}
            className={`${casilla} ${estado(activa === null)} px-4`}
          >
            Todas
          </Link>
          <Link href="/letras" aria-label="Por letra: elegir una letra" className={`${casilla} ${estado(false)} px-4`}>
            Por letra
          </Link>
          {activa && (
            <Link
              href="/"
              aria-label={`Quitar el filtro de la letra ${activa.toUpperCase()}`}
              className={`${casilla} ${estado(true)} group gap-2 pr-2.5 pl-4`}
            >
              {activa.toUpperCase()}
              <Cerrar invertido />
            </Link>
          )}
        </nav>
        <nav aria-label="Letras" className="hidden min-[1184px]:block">
          <ul className="flex gap-1">
            <li>
              <Link
                href="/"
                aria-current={activa === null ? 'page' : undefined}
                className={`${casilla} ${estado(activa === null)} px-3`}
              >
                Todas
              </Link>
            </li>
            {LETRAS.filter((letra) => (recuento[letra] ?? 0) > 0).map((letra) => (
              <li key={letra}>
                <Link
                  href={`/letra/${letra}`}
                  aria-current={letra === activa ? 'page' : undefined}
                  aria-label={`Letra ${letra.toUpperCase()}, ${recuento[letra]} ${recuento[letra] === 1 ? 'palabra' : 'palabras'}`}
                  className={`${casilla} ${estado(letra === activa)} w-9 uppercase`}
                >
                  {letra}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}
