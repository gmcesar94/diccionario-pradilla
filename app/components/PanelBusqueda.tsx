'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { CampoBusqueda } from '@/app/components/Buscador'
import { PULSADO } from '@/lib/estilos'
import { LETRAS } from '@/lib/letras'

// Escritorio: buscador y filtro por letras en una misma fila, fija justo debajo
// de la barra oscura (la introducción de la home se va con el scroll; esto no).
// Solo aparecen las letras con palabras: las 27 no caben junto al buscador;
// el abecedario completo está en el Índice.
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
  const letras = useRef<HTMLElement>(null)
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

  const activa = ruta.startsWith('/letra/') ? decodeURIComponent(ruta.split('/')[2] ?? '') : ruta === '/' && !filtrandoPalabra ? null : undefined
  // Misma altura que el buscador (40 px). Entre 1024 y 1280 px las letras son
  // algo más estrechas para que el buscador conserve un ancho cómodo.
  const casilla = `inline-flex h-10 items-center justify-center rounded-full border text-sm transition-[color,background-color,opacity] duration-100 ${PULSADO}`
  // Sobre la franja oscura: activa en crema; el resto con borde claro.
  const estado = (activo: boolean) =>
    activo ? 'border-paper bg-paper text-oscuro hover:opacity-85' : 'border-paper/50 hover:bg-paper hover:text-oscuro'

  return (
    <div ref={fila} className="sticky top-(--alto-cabecera) z-20 hidden items-center gap-10 bg-oscuro px-margen pt-0 pb-8 text-paper lg:flex">
      <div role="search" className="flex min-w-0 flex-1">
        <CampoBusqueda valor={valor} onChange={onBuscar} />
      </div>

      <nav ref={letras} aria-label="Letras" className="shrink-0">
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
                className={`${casilla} ${estado(letra === activa)} w-8 uppercase xl:w-10`}
              >
                {letra}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
