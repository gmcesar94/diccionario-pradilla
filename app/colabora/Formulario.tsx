'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { proponerPalabra } from '@/app/colabora/acciones'
import { CAMPOS, GRUPOS, type Campo, type EstadoEnvio } from '@/app/colabora/campos'
import { ACTIVA, INACTIVA, BOTON } from '@/lib/estilos'

const FILA = 'border-b border-rule px-margen py-5 md:grid md:grid-cols-[12rem_1fr] md:gap-6'
const CONTROL =
  'block w-full rounded-3xl border border-ink bg-campo px-4 text-[0.9375rem] placeholder:text-muted pointer-coarse:text-base focus:outline-none focus:ring-1 focus:ring-ink focus:ring-inset aria-invalid:border-error aria-invalid:ring-error'

const AYUDAS: Partial<Record<Campo, string>> = {
  ejemplo: 'Una frase en la que se use la palabra, como «Mira que te avío». Si tienes varias, escribe una en cada línea.',
}

const INICIAL: EstadoEnvio = { id: 0, ok: false }

// Lee ?palabra= (viene del buscador cuando no encuentra nada).
export function FormularioConParametro() {
  return <Formulario palabraInicial={useSearchParams().get('palabra') ?? ''} />
}

export default function Formulario({ palabraInicial = '' }: { palabraInicial?: string }) {
  const [estado, enviar, enviando] = useActionState(proponerPalabra, INICIAL)
  const [exitoCerrado, setExitoCerrado] = useState(0)
  const formulario = useRef<HTMLFormElement>(null)
  const exito = useRef<HTMLDivElement>(null)

  // Tras enviar: el foco va al primer campo con error o al mensaje de agradecimiento.
  useEffect(() => {
    if (!estado.id) return
    if (estado.ok) exito.current?.focus()
    else formulario.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }, [estado])

  if (estado.ok && estado.id !== exitoCerrado) {
    return (
      <div ref={exito} role="status" tabIndex={-1} className={`${FILA} focus:outline-none`}>
        <p className="text-lg font-bold">Gracias</p>
        <div className="mt-1.5 max-w-[60ch] text-[0.9375rem] leading-relaxed md:mt-0.5">
          <p>
            {estado.palabra ? `Revisaremos «${estado.palabra}» y la añadiremos si encaja.` : 'Hemos recibido tu propuesta.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setExitoCerrado(estado.id)}
              className={`${BOTON} ${INACTIVA}`}
            >
              Proponer otra palabra
            </button>
            <Link href="/" className={`${BOTON} ${INACTIVA}`}>
              Volver al diccionario
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const valor = (campo: Campo) => estado.valores?.[campo] ?? (campo === 'palabra' ? palabraInicial : '')

  return (
    <form ref={formulario} action={enviar} noValidate>
      {(Object.keys(GRUPOS) as (keyof typeof GRUPOS)[]).map((grupo) => {
        const { titulo, nota } = GRUPOS[grupo]
        const campos = (Object.keys(CAMPOS) as Campo[]).filter((c) => CAMPOS[c].grupo === grupo)
        return (
          <div key={grupo} role="group" aria-labelledby={`grupo-${grupo}`} className={FILA}>
            <h2 id={`grupo-${grupo}`} className="text-lg font-bold leading-snug">{titulo}</h2>
            <div className="mt-3 grid max-w-[44rem] gap-x-4 gap-y-5 sm:grid-cols-2 md:mt-0.5">
              {campos.map((campo) => (
                <CampoFormulario
                  key={campo}
                  campo={campo}
                  error={estado.errores?.[campo]}
                  defaultValue={valor(campo)}
                />
              ))}
              {/* -mt-3.5: anula parte del hueco de la rejilla para quedar a 6 px, como las notas de cada campo */}
              {nota && <p className="-mt-3.5 text-xs text-muted sm:col-span-2">{nota}</p>}
            </div>
          </div>
        )
      })}

      {/* Campo trampa para robots: invisible para las personas */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label htmlFor="web">Web</label>
        <input id="web" name="web" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className={FILA}>
        <span className="hidden md:block" />
        <div>
          {estado.error && <p className="mb-3 text-sm text-error">{estado.error}</p>}
          <button
            type="submit"
            disabled={enviando}
            className={`${BOTON} ${ACTIVA} disabled:opacity-50`}
          >
            {enviando ? 'Enviando…' : 'Enviar propuesta'}
          </button>
        </div>
      </div>
    </form>
  )
}

function CampoFormulario({ campo, error, defaultValue }: { campo: Campo; error?: string; defaultValue: string }) {
  const { etiqueta, max, obligatorio, ancho } = CAMPOS[campo]
  const ayuda = AYUDAS[campo]
  const props = {
    id: campo,
    name: campo,
    maxLength: max,
    required: obligatorio,
    defaultValue,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${campo}-error` : ayuda ? `${campo}-ayuda` : undefined,
  }

  return (
    <div className={ancho === 'completo' ? 'sm:col-span-2' : ''}>
      <label htmlFor={campo} className="mb-1.5 block text-sm font-medium">
        {etiqueta}
        {obligatorio && (
          <span aria-hidden="true" className="text-muted">
            {' '}
            *
          </span>
        )}
      </label>
      {campo === 'definicion' || campo === 'ejemplo' ? (
        <textarea {...props} rows={campo === 'definicion' ? 3 : 2} className={`${CONTROL} py-2`} />
      ) : (
        <input {...props} type="text" className={`${CONTROL} h-12 rounded-full`} />
      )}
      {error ? (
        <p id={`${campo}-error`} className="mt-1.5 text-sm text-error">{error}</p>
      ) : (
        ayuda && <p id={`${campo}-ayuda`} className="mt-1.5 text-xs text-muted">{ayuda}</p>
      )}
    </div>
  )
}
