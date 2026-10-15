'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { CampoBusqueda, useBusqueda } from '@/app/components/Buscador'
import { ACTIVA, INACTIVA, BOTON } from '@/lib/estilos'

// Barra fija con el título y, debajo, la fila del buscador y las pestañas.
// Cuando esa fila sale de la vista, aparece «Buscar» en la barra fija y,
// al pulsarlo, la misma fila se despliega bajo la barra.
export default function Cabecera() {
  return (
    <Suspense fallback={<Vista valor="" />}>
      <ConBusqueda />
    </Suspense>
  )
}

function ConBusqueda() {
  const [valor, buscar] = useBusqueda()
  return <Vista valor={valor} onBuscar={buscar} />
}

function Vista({ valor, onBuscar }: { valor: string; onBuscar?: (texto: string) => void }) {
  const ruta = usePathname()
  const router = useRouter()
  const colabora = ruta === '/colabora'
  const barra = useRef<HTMLElement>(null)
  // Última vista del diccionario (con su búsqueda), para volver desde Colabora.
  const volverA = useRef('/')
  const fila = useRef<HTMLDivElement>(null)
  const [compacta, setCompacta] = useState(false)
  const [abierto, setAbierto] = useState(false)
  const abiertoRef = useRef(abierto)
  const [rutaAnterior, setRutaAnterior] = useState(ruta)

  // Al cambiar de vista se cierra el desplegable.
  if (ruta !== rutaAnterior) {
    setRutaAnterior(ruta)
    setAbierto(false)
  }

  useEffect(() => {
    abiertoRef.current = abierto
  }, [abierto])

  useEffect(() => {
    if (!colabora) volverA.current = window.location.pathname + window.location.search
  }, [colabora, ruta, valor])

  // Altura de la barra fija, para el índice de letras y las anclas.
  useEffect(() => {
    const el = barra.current
    if (!el) return
    const medir = new ResizeObserver(() => {
      document.documentElement.style.setProperty('--alto-cabecera', `${el.offsetHeight}px`)
    })
    medir.observe(el)
    return () => medir.disconnect()
  }, [])

  useEffect(() => {
    const el = barra.current
    const filaBusqueda = fila.current
    if (!el || !filaBusqueda) return

    // Si la fila vuelve a verse (p. ej. porque la búsqueda acorta la página),
    // se cierra el desplegable y el foco pasa al buscador de la fila.
    const vigilar = new IntersectionObserver(
      ([entrada]) => {
        setCompacta(!entrada.isIntersecting)
        if (!entrada.isIntersecting) return
        const campo = el.querySelector('#buscador-desplegable input')
        if (abiertoRef.current && campo && document.activeElement === campo) {
          const destino = filaBusqueda.querySelector('input')
          destino?.focus()
          destino?.setSelectionRange(destino.value.length, destino.value.length)
        }
        setAbierto(false)
      },
      { rootMargin: `-${el.offsetHeight}px 0px 0px 0px` }
    )
    vigilar.observe(filaBusqueda)

    return () => vigilar.disconnect()
  }, [colabora])

  // Escape cierra el desplegable.
  useEffect(() => {
    if (!abierto) return
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false)
    }
    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [abierto])

  // En Colabora no hay buscador: solo la barra con la salida de vuelta.
  const conBotonBuscar = compacta && !colabora
  const desplegado = conBotonBuscar && abierto

  return (
    <>
      <header ref={barra} className="sticky top-0 z-30 border-b border-rule bg-paper">
        <div className="flex h-16 items-center gap-1.5 px-5 md:px-6">
          <Link href="/" className="mr-auto truncate text-2xl font-bold tracking-tight">
            ABC Pradilla
          </Link>

          {conBotonBuscar && (
            <button
              type="button"
              onClick={() => setAbierto((a) => !a)}
              aria-expanded={desplegado}
              aria-controls="buscador-desplegable"
              aria-label={desplegado ? 'Cerrar el buscador' : 'Buscar'}
              className={`${BOTON} ${desplegado ? `${ACTIVA} group gap-2 sm:pr-2.5` : INACTIVA} max-sm:w-10 max-sm:justify-center max-sm:px-0`}
            >
              {desplegado ? (
                <>
                  <span className="hidden sm:inline">Buscar</span>
                  <Cerrar />
                </>
              ) : (
                <>
                  <Lupa />
                  <span className="hidden sm:inline">Buscar</span>
                </>
              )}
            </button>
          )}

          {colabora ? (
            <Link
              href="/"
              onClick={(e) => {
                e.preventDefault()
                router.push(volverA.current)
              }}
              aria-label="Cerrar Colabora y volver al diccionario"
              className={`${BOTON} ${ACTIVA} group gap-2 pr-2.5 sm:pr-2.5`}
            >
              Colabora
              <Cerrar />
            </Link>
          ) : (
            <Link href="/colabora" className={`${BOTON} ${INACTIVA}`}>
              Colabora
            </Link>
          )}
        </div>

        {desplegado && (
          <div id="buscador-desplegable" className="absolute inset-x-0 top-full bg-paper">
            <FilaBusqueda ruta={ruta} valor={valor} onBuscar={onBuscar} autoFocus />
          </div>
        )}
      </header>

      {!colabora && (
        <div ref={fila}>
          <FilaBusqueda ruta={ruta} valor={valor} onBuscar={onBuscar} />
        </div>
      )}
    </>
  )
}

function FilaBusqueda({
  ruta,
  valor,
  onBuscar,
  autoFocus,
}: {
  ruta: string
  valor: string
  onBuscar?: (texto: string) => void
  autoFocus?: boolean
}) {
  // En /letra/x el filtro activo es una píldora propia, junto a «Letras», que se cierra con la ✕.
  const filtro = ruta.startsWith('/letra/') ? decodeURIComponent(ruta.split('/')[2] ?? '') : null

  return (
    <div role="search" className="flex items-center gap-1.5 border-b border-rule px-5 py-3 md:px-6">
      <CampoBusqueda valor={valor} onChange={onBuscar} autoFocus={autoFocus} />

      <nav aria-label="Vistas" className="flex gap-1.5">
        <Link
          href="/"
          aria-current={ruta === '/' ? 'page' : undefined}
          className={`${BOTON} ${ruta === '/' ? ACTIVA : INACTIVA}`}
        >
          Listado
        </Link>
        <Link
          href="/letras"
          aria-current={ruta === '/letras' ? 'page' : undefined}
          className={`${BOTON} ${ruta === '/letras' ? ACTIVA : INACTIVA}`}
        >
          Letras
        </Link>

        {filtro && (
          <Link
            href="/letras"
            aria-label={`Quitar el filtro de la letra ${filtro.toUpperCase()}`}
            className={`${BOTON} ${ACTIVA} group gap-2 pr-2.5 sm:pr-2.5`}
          >
            {filtro}
            <Cerrar />
          </Link>
        )}
      </nav>
    </div>
  )
}

// ✕ dentro de un cuadrado: cierra la píldora activa en la que va (filtro, Colabora, Buscar).
function Cerrar() {
  return (
    <span
      aria-hidden="true"
      className="flex size-5 items-center justify-center rounded-sm bg-paper text-ink transition-opacity group-hover:opacity-80"
    >
      <svg viewBox="0 0 10 10" className="size-2">
        <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  )
}

function Lupa() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5 shrink-0">
      <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="m11 11 3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
