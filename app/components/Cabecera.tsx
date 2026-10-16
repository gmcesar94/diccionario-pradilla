'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { CampoBusqueda, useBusqueda } from '@/app/components/Buscador'
import PanelBusqueda from '@/app/components/PanelBusqueda'
import { Cerrar, IconoCerrar, Lupa } from '@/app/components/iconos'
import { volver } from '@/lib/volver'
import { ACTIVA_OSCURO, BOTON, BOTON_CABECERA, PULSADO, SIN_BORDE_OSCURO, VERDE } from '@/lib/estilos'

// Barra fija con el título y Colabora. Debajo, el buscador. La navegación por
// letras está en <FiltroLetras>, en cada página. Cuando el buscador sale de la vista,
// aparece «Buscar» en la barra fija y, al pulsarlo, el buscador se despliega
// bajo la barra con su propio botón de cerrar.
// En escritorio, buscador y letras van juntos en <PanelBusqueda>, dentro de la barra fija.
export default function Cabecera({ recuento }: { recuento: Record<string, number> }) {
  return (
    <Suspense fallback={<Vista valor="" recuento={recuento} />}>
      <ConBusqueda recuento={recuento} />
    </Suspense>
  )
}

function ConBusqueda({ recuento }: { recuento: Record<string, number> }) {
  const [valor, buscar] = useBusqueda()
  // ?palabra=slug: el listado muestra una sola palabra y «Todas» no está activa.
  const parametros = useSearchParams()
  const filtrandoPalabra = parametros.has('palabra')
  const desdeEnlace = filtrandoPalabra && parametros.get('desde') === 'enlace'
  return (
    <Vista
      valor={valor}
      onBuscar={buscar}
      recuento={recuento}
      filtrandoPalabra={filtrandoPalabra}
      desdeEnlace={desdeEnlace}
    />
  )
}

function Vista({
  valor,
  onBuscar,
  recuento,
  filtrandoPalabra = false,
  desdeEnlace = false,
}: {
  valor: string
  onBuscar?: (texto: string) => void
  recuento: Record<string, number>
  filtrandoPalabra?: boolean
  // La palabra se abrió desde un enlace de otra definición: la ✕ vuelve allí.
  desdeEnlace?: boolean
}) {
  const ruta = usePathname()
  const router = useRouter()
  const colabora = ruta === '/colabora'
  const indice = ruta === '/letras'
  // Vista que se abre como una ventana: sin buscador ni letras, con ✕ para volver.
  const ventana = colabora
  const barra = useRef<HTMLElement>(null)
  const fila = useRef<HTMLDivElement>(null)
  const botonBuscar = useRef<HTMLButtonElement>(null)
  // Para devolver el foco a «Buscar» solo cuando el desplegable se cierra a mano.
  const cerradoAMano = useRef(false)
  // Última vista del diccionario (con su búsqueda), para volver desde Colabora o el Índice.
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
    // Al cerrar con el botón o con Escape, el foco vuelve a «Buscar».
    if (!abierto && cerradoAMano.current) {
      cerradoAMano.current = false
      botonBuscar.current?.focus()
    }
  }, [abierto])

  const cerrarDesplegable = () => {
    cerradoAMano.current = true
    setAbierto(false)
  }

  useEffect(() => {
    if (!colabora && !indice) volverA.current = window.location.pathname + window.location.search
  }, [colabora, indice, ruta, valor])

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

  // Altura de la fila del buscador, para que el Índice ajuste su cuadrícula a la pantalla.
  useEffect(() => {
    const el = fila.current
    if (!el) return
    const medir = new ResizeObserver(() => {
      document.documentElement.style.setProperty('--alto-busqueda', `${el.offsetHeight}px`)
    })
    medir.observe(el)
    return () => medir.disconnect()
  }, [ventana])

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
  }, [ventana])

  // Escape cierra el desplegable.
  useEffect(() => {
    if (!abierto) return
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrarDesplegable()
    }
    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [abierto])

  // En Colabora no hay buscador.
  const desplegado = compacta && !ventana && abierto
  const conBotonBuscar = compacta && !ventana && !abierto

  return (
    <>
      {/* COSER: cada bloque oscuro se alarga 1 px hacia abajo para tapar la rendija clara que
          Safari deja entre dos bloques oscuros cuando el borde cae en medio píxel. */}
      <header ref={barra} className={`sticky top-0 z-30 bg-oscuro text-paper ${COSER}`}>
        <div className="flex h-16 items-center gap-2 px-margen">
          <Link
            href="/"
            onClick={(e) => {
              // Ya en el listado completo: en vez de navegar, sube al principio (y quita un #palabra).
              if (window.location.pathname !== '/' || window.location.search) return
              e.preventDefault()
              if (window.location.hash) history.replaceState(null, '', '/')
              const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
              window.scrollTo({ top: 0, behavior: sinMovimiento ? 'auto' : 'smooth' })
              setAbierto(false)
            }}
            className={`mr-auto inline-flex min-h-12 min-w-0 items-center truncate text-2xl font-bold tracking-tight text-acento transition-opacity hover:opacity-70 ${PULSADO}`}
          >
            <span className="font-serif font-medium">ABC</span>&nbsp;Pradilla
          </Link>

          {conBotonBuscar && (
            <button
              ref={botonBuscar}
              type="button"
              onClick={() => setAbierto(true)}
              aria-expanded={false}
              aria-controls="buscador-desplegable"
              aria-label="Buscar"
              className={`${BOTON_CABECERA} ${SIN_BORDE_OSCURO} max-sm:w-9 max-sm:justify-center max-sm:px-0! lg:hidden`}
            >
              <Lupa />
              <span className="hidden sm:inline">Buscar</span>
            </button>
          )}

          {/* Índice: activo, la ✕ vuelve a la vista anterior del diccionario (también en móvil, donde es la salida) */}
          {/* Una sola palabra (del día o enlazada) en móvil y tableta: como una ventana, solo la ✕ (en escritorio, el chip del listado) */}
          {filtrandoPalabra && (
            <Link
              href="/"
              onClick={(e) => {
                e.preventDefault()
                volver(router)
              }}
              aria-label={desdeEnlace ? 'Cerrar la palabra y volver' : 'Cerrar la palabra del día y volver al diccionario'}
              className={`${BOTON_CABECERA} ${ACTIVA_OSCURO} ${COMO_VENTANA} lg:hidden`}
            >
              <IconoCerrar />
            </Link>
          )}

          {/* Índice en escritorio: siempre igual, también dentro del Índice (aria-current lo indica).
              Para salir: el logo o el botón atrás del navegador. */}
          <Link
            href="/letras"
            aria-current={indice ? 'page' : undefined}
            className={`${BOTON_CABECERA} ${SIN_BORDE_OSCURO} max-lg:hidden`}
          >
            Índice
          </Link>
          {/* En móvil y tableta el Índice se abre como una ventana: su ✕ es la salida.
              Fuera de él no se muestra: el botón «Por letra» ya abre el Índice. */}
          {indice && (
            <Link
              href="/"
              onClick={(e) => {
                e.preventDefault()
                router.push(volverA.current)
              }}
              aria-label="Cerrar el índice y volver al diccionario"
              className={`${BOTON_CABECERA} ${SIN_BORDE_OSCURO} ${COMO_VENTANA} lg:hidden`}
            >
              <IconoCerrar />
            </Link>
          )}

          {colabora ? (
            <Link
              href="/"
              onClick={(e) => {
                e.preventDefault()
                router.push(volverA.current)
              }}
              aria-label="Cerrar Colabora y volver al diccionario"
              className={`${BOTON_CABECERA} ${VERDE} ${COMO_VENTANA} group gap-2 lg:pr-2`}
            >
              <ContenidoCierre etiqueta="Colabora" />
            </Link>
          ) : (
            // En móvil y tableta, dentro del Índice solo queda la ✕ (se abre como una ventana).
            <Link href="/colabora" className={`${BOTON_CABECERA} ${VERDE} ${indice || filtrandoPalabra ? 'max-lg:hidden' : ''}`}>
              Colabora
            </Link>
          )}
        </div>

        {desplegado && (
          // top-full cae sobre el borde inferior de la barra: border-t lo vuelve a dibujar
          // y deja el borde inferior del desplegable alineado con el de la tira de letras.
          <div id="buscador-desplegable" className="absolute inset-x-0 top-full bg-oscuro lg:hidden">
            <FilaBusqueda valor={valor} onBuscar={onBuscar} autoFocus onCerrar={cerrarDesplegable} />
          </div>
        )}
      </header>

      {/* Introducción (solo en la home): se va con el scroll; el buscador sí te acompaña */}
      {/* Con una sola palabra abierta (?palabra=), cabecera compacta: sin la introducción */}
      {ruta === '/' && !filtrandoPalabra && <Introduccion />}

      {!ventana && (
        <>
          <PanelBusqueda
            recuento={recuento}
            ruta={ruta}
            valor={valor}
            onBuscar={onBuscar}
            filtrandoPalabra={filtrandoPalabra}
          />
          <div ref={fila} className="lg:hidden">
            <FilaBusqueda valor={valor} onBuscar={onBuscar} />
          </div>
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
    <div role="search" className={`flex gap-2 bg-oscuro px-margen pt-3 pb-4 ${COSER}`}>
      <CampoBusqueda valor={valor} onChange={onBuscar} autoFocus={autoFocus} />
      {onCerrar && (
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar el buscador"
          className={`${BOTON} ${SIN_BORDE_OSCURO} h-11! w-11 justify-center px-0!`}
        >
          <IconoCerrar />
        </button>
      )}
    </div>
  )
}

// Índice, Colabora o una sola palabra abiertos: en móvil y tableta funcionan como una
// ventana y solo muestran una ✕ en la esquina, sin contorno ni fondo (como la lupa);
// en escritorio, «Índice ⓧ» / «Colabora ⓧ».
// Sombra de 1 px del mismo verde oscuro (ver <header>).
const COSER = 'shadow-[0_1px_0_var(--oscuro)]'

const COMO_VENTANA =
  'max-lg:w-9 max-lg:justify-center max-lg:px-0! max-lg:border-transparent max-lg:bg-transparent max-lg:text-paper max-lg:hover:bg-paper/15 max-lg:hover:opacity-100'

function ContenidoCierre({ etiqueta }: { etiqueta: string }) {
  return (
    <>
      <span className="hidden lg:inline">{etiqueta}</span>
      <span className="hidden lg:flex">
        <Cerrar invertido />
      </span>
      <span className="lg:hidden">
        <IconoCerrar />
      </span>
    </>
  )
}

// Franja oscura de la home: «Diccionario / de Pradilla» (serif + sans medium, en verde eléctrico)
// y explicación, alineados arriba.
// Misma rejilla que el listado: la explicación queda bajo las letras en escritorio.
function Introduccion() {
  return (
    <section className={`bg-oscuro px-margen pt-6 pb-4 text-paper ${COSER} lg:grid lg:grid-cols-[minmax(0,1fr)_var(--ancho-letras)] lg:items-start lg:gap-10 lg:pt-10 lg:pb-2`}>
      <h1 className="leading-[1.05] text-acento">
        <span className="block font-serif text-[2.5rem] lg:text-[3.5rem]">Diccionario</span>
        <span className="block text-[2.25rem] font-medium tracking-tight lg:text-[3.25rem]">de Pradilla</span>
      </h1>
      <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-paper/85 lg:mt-[3px] lg:max-w-[52ch] lg:text-lg lg:leading-[1.6]">
        El patrimonio léxico de Pradilla reunido para conservar nuestra memoria. Busca una palabra, explora el
        diccionario por letras o propón las que conozcas.
      </p>
    </section>
  )
}
