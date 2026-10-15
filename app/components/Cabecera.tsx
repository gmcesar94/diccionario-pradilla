'use client'

import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { CampoBusqueda, useBusqueda } from '@/app/components/Buscador'
import { ACTIVA, INACTIVA, BOTON } from '@/lib/estilos'

// Barra fija con el título y Colabora. Debajo, el buscador solo y, en otra
// fila, la vista (Listado | Letras). Cuando el buscador sale de la vista,
// aparece «Buscar» en la barra fija y, al pulsarlo, el buscador se despliega
// bajo la barra con su propio botón de cerrar.
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
  const fila = useRef<HTMLDivElement>(null)
  // Última vista del diccionario (con su búsqueda), para volver desde Colabora.
  const volverA = useRef('/')
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

  // En Colabora no hay buscador ni filas de vista.
  const desplegado = compacta && !colabora && abierto
  const conBotonBuscar = compacta && !colabora && !abierto

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
              onClick={() => setAbierto(true)}
              aria-expanded={false}
              aria-controls="buscador-desplegable"
              aria-label="Buscar"
              className={`${BOTON} ${INACTIVA} max-sm:w-11 max-sm:justify-center max-sm:px-0`}
            >
              <Lupa />
              <span className="hidden sm:inline">Buscar</span>
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
          // top-full cae sobre el borde inferior de la barra: border-t lo vuelve a dibujar
          // y deja el borde inferior del desplegable alineado con el de la tira de letras.
          <div id="buscador-desplegable" className="absolute inset-x-0 top-full border-t border-rule bg-paper">
            <FilaBusqueda valor={valor} onBuscar={onBuscar} autoFocus onCerrar={() => setAbierto(false)} />
          </div>
        )}
      </header>

      {!colabora && (
        <>
          <div ref={fila}>
            <FilaBusqueda valor={valor} onBuscar={onBuscar} />
          </div>
          <FilaVistas ruta={ruta} />
        </>
      )}
    </>
  )
}

function FilaBusqueda({
  valor,
  onBuscar,
  autoFocus,
  onCerrar,
}: {
  valor: string
  onBuscar?: (texto: string) => void
  autoFocus?: boolean
  onCerrar?: () => void
}) {
  return (
    <div role="search" className="flex gap-1.5 border-b border-rule px-5 py-3 md:px-6">
      <CampoBusqueda valor={valor} onChange={onBuscar} autoFocus={autoFocus} />
      {onCerrar && (
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar el buscador"
          className={`${BOTON} ${ACTIVA} w-11 justify-center px-0! hover:opacity-80 md:w-10`}
        >
          {/* Misma caja y trazo que la lupa del campo (16×16, trazo 1.5), con la ✕ ocupándola casi entera */}
          <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0">
            <path d="M2.5 2.5l11 11M13.5 2.5l-11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  )
}

// Vista del diccionario: un filtro al inicio de la página, separado del buscador.
function FilaVistas({ ruta }: { ruta: string }) {
  // En /letra/x el filtro activo es una píldora propia, junto a «Letras», que se cierra con la ✕.
  const filtro = ruta.startsWith('/letra/') ? decodeURIComponent(ruta.split('/')[2] ?? '') : null
  const ancho = 'max-md:flex-1 max-md:justify-center'

  return (
    <nav aria-label="Vistas" className="flex gap-1.5 border-b border-rule px-5 py-3 md:px-6">
      <Pestana href="/" activa={ruta === '/'} className={ancho}>
        Listado
      </Pestana>
      <Pestana href="/letras" activa={ruta === '/letras'} className={ancho}>
        Letras
      </Pestana>

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
  )
}

function Pestana({
  href,
  activa,
  className = '',
  children,
}: {
  href: string
  activa: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      aria-current={activa ? 'page' : undefined}
      className={`${BOTON} ${activa ? ACTIVA : INACTIVA} ${className}`}
    >
      {children}
    </Link>
  )
}

// ✕ dentro de un cuadrado: cierra la píldora activa en la que va (filtro, Colabora).
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
