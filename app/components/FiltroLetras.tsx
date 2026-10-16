'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Cerrar } from '@/app/components/iconos'
import { ACTIVA_OSCURO, BOTON, INACTIVA_OSCURO } from '@/lib/estilos'

// Navegación por letras en móvil y tableta: [Todas] [Por letra] [B ✕].
// «Por letra» abre el Índice para elegir de un vistazo y la letra elegida, al
// tocarla, quita el filtro. En escritorio las letras están en <PanelBusqueda>.
// Fija bajo la barra; en móvil se esconde al bajar y reaparece al subir.
// En «Todas», lee ?palabra= (palabra del día filtrada) para no marcar «Todas» como activa.
// Va dentro de <Suspense> con <FiltroLetras activa={null} /> como fallback.
export function FiltroLetrasConParametros() {
  const filtrando = useSearchParams().has('palabra')
  return <FiltroLetras activa={filtrando ? undefined : null} />
}

export default function FiltroLetras({
  activa,
}: {
  // null = «Todas»; undefined = ni «Todas» ni una letra (una sola palabra filtrada)
  activa: string | null | undefined
}) {
  const [oculta, setOculta] = useState(false)
  const tira = useRef<HTMLElement>(null)
  // Marca sin altura justo antes de la tira: indica si la tira ya está pegada arriba.
  const marca = useRef<HTMLDivElement>(null)

  // Altura de la tira, para que las anclas (/#palabra) queden justo debajo.
  useEffect(() => {
    const el = tira.current
    if (!el) return
    // Solo si está visible: en escritorio está oculta y la altura la publica <PanelBusqueda>.
    const medir = new ResizeObserver(() => {
      if (el.offsetHeight > 0) document.documentElement.style.setProperty('--alto-indice', `${el.offsetHeight}px`)
    })
    medir.observe(el)
    return () => {
      medir.disconnect()
      if (el.offsetHeight > 0) document.documentElement.style.setProperty('--alto-indice', '0px')
    }
  }, [])

  // Esconder al bajar y mostrar al subir (solo tiene efecto visual en móvil, ver clases).
  useEffect(() => {
    let pendiente = 0
    let yAnterior = window.scrollY
    // Al abrir o cerrar el teclado en móvil la página se desplaza unos píxeles:
    // durante ese momento no se esconde ni se muestra la tira.
    let ignorarHasta = 0
    const alCambiarVista = () => {
      ignorarHasta = performance.now() + 400
    }
    const calcular = () => {
      pendiente = 0
      const y = window.scrollY
      const alto = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--alto-cabecera')) || 0
      const pegada = (marca.current?.getBoundingClientRect().top ?? 0) < alto
      const escribiendo = document.activeElement?.matches('input, textarea') ?? false
      if (escribiendo || performance.now() < ignorarHasta) {
        yAnterior = y
      } else if (Math.abs(y - yAnterior) > 10) {
        setOculta(pegada && y > yAnterior)
        yAnterior = y
      } else if (!pegada) {
        setOculta(false)
      }
    }
    const alDesplazar = () => {
      if (!pendiente) pendiente = requestAnimationFrame(calcular)
    }
    window.addEventListener('scroll', alDesplazar, { passive: true })
    window.visualViewport?.addEventListener('resize', alCambiarVista)
    return () => {
      window.removeEventListener('scroll', alDesplazar)
      window.visualViewport?.removeEventListener('resize', alCambiarVista)
      cancelAnimationFrame(pendiente)
    }
  }, [])

  return (
    <>
      <div ref={marca} aria-hidden="true" />
      <nav
        ref={tira}
        aria-label="Letras"
        className={`sticky top-(--alto-cabecera) z-10 bg-oscuro text-paper transition-transform lg:hidden duration-200 motion-reduce:transition-none ${
          oculta ? 'max-md:-translate-y-full' : ''
        }`}
      >
        <div className="flex gap-2 px-margen pt-1 pb-6">
          <Link
            href="/"
            aria-current={activa === null ? 'page' : undefined}
            className={`${BOTON} ${activa === null ? ACTIVA_OSCURO : INACTIVA_OSCURO} flex-1 justify-center`}
          >
            Todas
          </Link>
          {/* «Por letra» siempre igual: abre el Índice para elegir (o cambiar) de letra */}
          <Link
            href="/letras"
            aria-label="Por letra: elegir una letra"
            className={`${BOTON} ${INACTIVA_OSCURO} flex-1 justify-center`}
          >
            Por letra
          </Link>
          {/* La letra elegida, en negro con ✕: al tocarla se quita el filtro (como Colabora ✕ o Índice ✕) */}
          {activa && (
            <Link
              href="/"
              aria-label={`Quitar el filtro de la letra ${activa.toUpperCase()}`}
              className={`${BOTON} ${ACTIVA_OSCURO} group gap-2 pr-2.5 sm:pr-2.5`}
            >
              {activa.toUpperCase()}
              <Cerrar invertido />
            </Link>
          )}
        </div>

      </nav>
    </>
  )
}
