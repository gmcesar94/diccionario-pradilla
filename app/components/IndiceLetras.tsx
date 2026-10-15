'use client'

import { useEffect, useRef, useState } from 'react'
import { LETRAS } from '@/lib/letras'

// Índice de anclas del listado: fijo arriba, salta a cada letra y marca
// en negativo la letra que se está leyendo. En móvil se esconde al bajar
// y reaparece al subir, para dejar más sitio a las palabras.
export default function IndiceLetras({ recuento }: { recuento: Record<string, number> }) {
  const [actual, setActual] = useState<string | null>(null)
  const [oculta, setOculta] = useState(false)
  const tira = useRef<HTMLElement>(null)
  // Marca sin altura justo antes de la tira: indica si la tira ya está pegada arriba.
  const marca = useRef<HTMLDivElement>(null)
  const lista = useRef<HTMLUListElement>(null)

  useEffect(() => {
    let pendiente = 0
    let yAnterior = window.scrollY
    const calcular = () => {
      pendiente = 0

      // Dirección del scroll (solo tiene efecto visual en móvil, ver clases).
      const y = window.scrollY
      const alto = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--alto-cabecera')) || 0
      const pegada = (marca.current?.getBoundingClientRect().top ?? 0) < alto
      if (Math.abs(y - yAnterior) > 4) {
        setOculta(pegada && y > yAnterior)
        yAnterior = y
      } else if (!pegada) {
        setOculta(false)
      }

      const limite = tira.current?.getBoundingClientRect().bottom ?? 0
      let ultima: string | null = null
      for (const el of document.querySelectorAll<HTMLElement>('[data-letra]')) {
        // Margen de 12 px: las anclas dejan un pequeño aire bajo la tira (o bajo la barra en móvil).
        if (el.getBoundingClientRect().top > limite + 12) break
        ultima = el.dataset.letra ?? null
      }
      // Al final de la página las últimas letras no llegan arriba: se marca la última visible.
      if (window.innerHeight + y >= document.documentElement.scrollHeight - 2) {
        const visibles = [...document.querySelectorAll<HTMLElement>('[data-letra]')].filter(
          (el) => el.getBoundingClientRect().top < window.innerHeight
        )
        ultima = visibles.at(-1)?.dataset.letra ?? ultima
      }
      setActual(ultima)
    }
    const alDesplazar = () => {
      if (!pendiente) pendiente = requestAnimationFrame(calcular)
    }
    alDesplazar()
    window.addEventListener('scroll', alDesplazar, { passive: true })
    return () => {
      window.removeEventListener('scroll', alDesplazar)
      cancelAnimationFrame(pendiente)
    }
  }, [])

  // Cuando la tira se desliza (móvil y tablet), centra la letra actual para
  // que siempre se vea, también al reaparecer. scrollTo sobre la tira y no
  // scrollIntoView, que movería también la página.
  useEffect(() => {
    const ul = lista.current
    const casilla = ul?.querySelector<HTMLElement>('[aria-current="location"]')
    if (!ul || !casilla || ul.scrollWidth <= ul.clientWidth) return
    const r = casilla.getBoundingClientRect()
    const izquierda = ul.scrollLeft + (r.left - ul.getBoundingClientRect().left) - (ul.clientWidth - r.width) / 2
    const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ul.scrollTo({ left: izquierda, behavior: sinMovimiento ? 'auto' : 'smooth' })
  }, [actual])

  return (
    <>
      <div ref={marca} aria-hidden="true" />
      <nav
        ref={tira}
        aria-label="Índice alfabético"
        className={`sticky top-(--alto-cabecera) z-10 border-b border-rule bg-paper transition-transform duration-200 motion-reduce:transition-none ${
          oculta ? 'max-md:-translate-y-full' : ''
        }`}
      >
        {/* Móvil y tablet: la tira se desliza. Desde lg las letras se reparten el ancho. */}
        <ul ref={lista} className="flex gap-1.5 overflow-x-auto px-5 py-3 md:px-6 lg:overflow-visible">
          {LETRAS.map((letra) => {
            const base =
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-md border text-lg leading-none md:h-10 md:w-10 lg:w-full'

            if (!recuento[letra]) {
              return (
                <li key={letra} className="lg:min-w-0 lg:flex-1">
                  <span aria-disabled="true" className={`${base} border-rule text-rule`}>
                    {letra}
                  </span>
                </li>
              )
            }

            const esActual = letra === actual
            return (
              <li key={letra} className="lg:min-w-0 lg:flex-1">
                <a
                  href={`#letra-${letra}`}
                  onClick={() => setActual(letra)}
                  aria-current={esActual ? 'location' : undefined}
                  className={`${base} border-ink transition-colors ${
                    esActual ? 'bg-ink text-paper' : 'hover:bg-ink hover:text-paper'
                  }`}
                >
                  {letra}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
