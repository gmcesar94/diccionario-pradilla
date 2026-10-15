'use client'

import { useEffect, useRef, useState } from 'react'
import { LETRAS } from '@/lib/letras'

// Índice de anclas del listado: fijo arriba, salta a cada letra y marca
// en negativo la letra que se está leyendo.
export default function IndiceLetras({ recuento }: { recuento: Record<string, number> }) {
  const [actual, setActual] = useState<string | null>(null)
  const tira = useRef<HTMLElement>(null)

  useEffect(() => {
    let pendiente = 0
    const calcular = () => {
      pendiente = 0
      const limite = tira.current?.getBoundingClientRect().bottom ?? 0
      let ultima: string | null = null
      for (const el of document.querySelectorAll<HTMLElement>('[data-letra]')) {
        if (el.getBoundingClientRect().top > limite + 1) break
        ultima = el.dataset.letra ?? null
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

  return (
    <nav ref={tira} aria-label="Índice alfabético" className="sticky top-(--alto-cabecera) z-10 border-b border-rule bg-paper">
      <ul className="flex gap-1.5 overflow-x-auto px-5 py-3 md:px-6">
        {LETRAS.map((letra) => {
          const base = 'flex size-10 shrink-0 items-center justify-center rounded-md border text-lg leading-none'

          if (!recuento[letra]) {
            return (
              <li key={letra}>
                <span aria-disabled="true" className={`${base} border-rule text-rule`}>
                  {letra}
                </span>
              </li>
            )
          }

          const esActual = letra === actual
          return (
            <li key={letra}>
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
  )
}
