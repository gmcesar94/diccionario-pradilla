'use client'

import { Fragment, useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Entrada from '@/app/components/Entrada'
import { Cerrar } from '@/app/components/iconos'
import { ACTIVA, INACTIVA, BOTON } from '@/lib/estilos'
import { letraDe } from '@/lib/letras'
import { femenino, slugify } from '@/lib/normalizar'
import type { Palabra } from '@/lib/types'

interface Props {
  palabras: Palabra[]
  separadores?: boolean
  // Todas las palabras del diccionario (no solo las de esta vista), para enlazar sinónimos.
  slugs: string[]
  // Contenido antes de la lista (la palabra del día); se oculta al buscar.
  inicio?: ReactNode
}

// Lista de entradas filtrada por ?q=. Mientras se lee la URL (o en el HTML
// estático) se muestra la lista completa con <ListadoCompleto>.
export default function Listado(props: Props) {
  const parametros = useSearchParams()
  const q = parametros.get('q') ?? ''
  return (
    <Lista {...props} consulta={slugify(q)} textoBuscado={q.trim()} soloPalabra={parametros.get('palabra')} />
  )
}

export function ListadoCompleto(props: Props) {
  return <Lista {...props} consulta="" />
}

// Con un separador al empezar cada letra (salvo al buscar).
function Lista({
  palabras,
  separadores = true,
  slugs,
  inicio,
  consulta,
  textoBuscado = '',
  soloPalabra = null,
}: Props & { consulta: string; textoBuscado?: string; soloPalabra?: string | null }) {
  // ?palabra=slug (desde la palabra del día): solo esa palabra, coincidencia exacta.
  const unica = soloPalabra ? palabras.find((p) => p.slug === soloPalabra) : undefined
  // También encuentra el femenino de los adjetivos («ranera» → «Ranero, ra»).
  const visibles = unica
    ? [unica]
    : consulta
      ? palabras.filter((p) => p.slug.includes(consulta) || femenino(p.palabra)?.includes(consulta))
      : palabras
  const conSeparadores = separadores && !consulta && !unica
  const existentes = new Set(slugs)
  const destacada = usePalabraDestacada()

  if (visibles.length === 0) {
    return <SinResultados texto={textoBuscado} />
  }

  return (
    <>
      {!consulta && !unica && inicio}
      <div>
        {/* Se anuncia a los lectores de pantalla cuando cambia (al buscar) */}
        {unica ? (
          // Filtro de la palabra del día. Escritorio: chip que se quita con la ✕.
          // Móvil y tableta: título; la ✕ está arriba a la derecha, en la cabecera.
          <div className="px-margen pt-5">
            <Link
              href="/"
              aria-label={`Quitar el filtro de la palabra del día (${unica.palabra})`}
              className={`${BOTON} ${ACTIVA} group gap-2 pr-2.5 max-lg:hidden sm:pr-2.5`}
            >
              Palabra del día
              <Cerrar />
            </Link>
            <h2 className="text-xl font-medium lg:hidden">Palabra del día</h2>
          </div>
        ) : (
          <p role="status" aria-live="polite" className="px-margen pt-5 text-sm text-muted">
            {visibles.length} {visibles.length === 1 ? 'palabra' : 'palabras'}
          </p>
        )}
        {visibles.map((palabra, i) => {
          const letra = letraDe(palabra.palabra)
          const nuevaLetra = conSeparadores && (i === 0 || letraDe(visibles[i - 1].palabra) !== letra)
          return (
            <Fragment key={palabra.id}>
              {nuevaLetra && (
                <h2
                  id={`letra-${letra}`}
                  className="scroll-mt-[calc(var(--alto-cabecera)+0.5rem)] md:scroll-mt-[calc(var(--alto-cabecera)+var(--alto-indice)+4px)] border-b border-rule px-margen pt-8 pb-2 text-sm font-semibold uppercase text-muted"
                >
                  {letra}
                </h2>
              )}
              <Entrada
                palabra={palabra}
                nivel={conSeparadores ? 3 : 2}
                slugs={existentes}
                destacada={palabra.slug === destacada}
              />
            </Fragment>
          )
        })}
        <FinDeLista />
      </div>
    </>
  )
}

// Palabra a la que se llega por un enlace (/#rambla): se resalta unos segundos.
// Se hace a mano porque :target no se aplica tras la carga con el router de Next.
function usePalabraDestacada() {
  const [destacada, setDestacada] = useState<string | null>(null)
  useEffect(() => {
    let temporizador = 0
    let recolocar = 0
    const marcar = () => {
      const slug = decodeURIComponent(window.location.hash.slice(1))
      if (!slug || slug.startsWith('letra-')) return
      setDestacada(slug)
      window.clearTimeout(temporizador)
      temporizador = window.setTimeout(() => setDestacada(null), 2500)
      // El navegador salta al #palabra antes de medir la cabecera (y en escritorio
      // la cabecera se comprime al bajar): se recoloca cuando ya tiene su altura final.
      window.clearTimeout(recolocar)
      recolocar = window.setTimeout(() => document.getElementById(slug)?.scrollIntoView({ block: 'start' }), 350)
    }
    const inicio = requestAnimationFrame(marcar)
    window.addEventListener('hashchange', marcar)
    return () => {
      cancelAnimationFrame(inicio)
      window.clearTimeout(temporizador)
      window.clearTimeout(recolocar)
      window.removeEventListener('hashchange', marcar)
    }
  }, [])
  return destacada
}

// Al llegar al final: volver arriba sin tener que hacer todo el scroll.
// Índice y Colabora no se repiten aquí: están siempre en la barra fija.
function FinDeLista() {
  // Solo si la página es bastante más larga que la pantalla: en una letra con
  // pocas palabras ya estás arriba y el botón no tiene sentido.
  const [larga, setLarga] = useState(false)
  useEffect(() => {
    const medir = new ResizeObserver(() => {
      setLarga(document.documentElement.scrollHeight > window.innerHeight * 1.5)
    })
    medir.observe(document.body)
    return () => medir.disconnect()
  }, [])

  const volverArriba = () => {
    const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: sinMovimiento ? 'auto' : 'smooth' })
    // El foco vuelve al inicio del contenido para quien navega con teclado.
    document.getElementById('contenido')?.focus({ preventScroll: true })
  }

  if (!larga) return null

  return (
    <div className="px-margen py-8">
      <button type="button" onClick={volverArriba} className={`${BOTON} ${INACTIVA}`}>
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="size-3.5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" />
        </svg>
        Volver arriba
      </button>
    </div>
  )
}

// Si una búsqueda no encuentra nada, invita a proponer la palabra.
function SinResultados({ texto }: { texto: string }) {
  return (
    <div className="px-margen py-12 text-center">
      <p className="text-muted">No se han encontrado palabras.</p>
      {texto && (
        <Link href={`/colabora?palabra=${encodeURIComponent(texto)}`} className={`${BOTON} ${INACTIVA} mt-4`}>
          ¿Falta «{texto}»? Propónla
        </Link>
      )}
    </div>
  )
}
