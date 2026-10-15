'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { proponerPalabra } from '@/app/colabora/acciones'
import { CAMPOS, type Campo, type EstadoEnvio } from '@/app/colabora/campos'
import { ACTIVA, INACTIVA, PILDORA } from '@/lib/estilos'

const FILA = 'border-b border-rule px-5 py-5 md:grid md:grid-cols-[12rem_1fr] md:gap-6 md:px-6'
const CONTROL =
  'w-full max-w-[60ch] border border-ink bg-paper px-4 text-[0.9375rem] placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-ink aria-invalid:border-error aria-invalid:ring-error'

const AYUDAS: Partial<Record<Campo, string>> = {
  categoria_gramatical: 'Opcional. Por ejemplo: v., m., f., adj.',
  ejemplo: 'Opcional. Una frase como se diría en el pueblo.',
  nombre: 'Opcional. Por si quieres que conste quién la aportó.',
  contacto: 'Opcional. Solo por si necesitamos preguntarte algo.',
}

const INICIAL: EstadoEnvio = { id: 0, ok: false }

// Lee ?palabra= (viene del buscador cuando no encuentra nada).
export function FormularioConParametro() {
  return <Formulario palabraInicial={useSearchParams().get('palabra') ?? ''} />
}

export default function Formulario({ palabraInicial = '' }: { palabraInicial?: string }) {
  const [estado, enviar, enviando] = useActionState(proponerPalabra, INICIAL)
  const [exitoCerrado, setExitoCerrado] = useState(0)

  if (estado.ok && estado.id !== exitoCerrado) {
    return (
      <div className={FILA}>
        <p className="text-lg font-bold">Gracias</p>
        <div className="mt-1.5 max-w-[60ch] text-[0.9375rem] leading-relaxed md:mt-0.5">
          <p>
            {estado.palabra ? `Revisaremos «${estado.palabra}» y la añadiremos si encaja.` : 'Hemos recibido tu propuesta.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setExitoCerrado(estado.id)}
              className={`${PILDORA} ${INACTIVA}`}
            >
              Proponer otra palabra
            </button>
            <Link href="/" className={`${PILDORA} ${INACTIVA}`}>
              Volver al diccionario
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const valor = (campo: Campo) => estado.valores?.[campo] ?? (campo === 'palabra' ? palabraInicial : '')

  return (
    <form action={enviar} noValidate>
      {(Object.keys(CAMPOS) as Campo[]).map((campo) => {
        const { etiqueta, max, obligatorio } = CAMPOS[campo]
        const error = estado.errores?.[campo]
        const ayuda = AYUDAS[campo]
        const props = {
          id: campo,
          name: campo,
          maxLength: max,
          required: obligatorio,
          defaultValue: valor(campo),
          'aria-invalid': error ? true : undefined,
          'aria-describedby': error ? `${campo}-error` : ayuda ? `${campo}-ayuda` : undefined,
        }
        return (
          <div key={campo} className={FILA}>
            <label htmlFor={campo} className="text-lg font-bold leading-snug">
              {etiqueta}
              {obligatorio && <span className="text-muted"> *</span>}
            </label>
            <div className="mt-1.5 md:mt-0">
              {campo === 'definicion' || campo === 'ejemplo' ? (
                <textarea {...props} rows={campo === 'definicion' ? 3 : 2} className={`${CONTROL} rounded-2xl py-2`} />
              ) : (
                <input {...props} type="text" className={`${CONTROL} h-10 rounded-full`} />
              )}
              {error ? (
                <p id={`${campo}-error`} className="mt-1.5 text-sm text-error">{error}</p>
              ) : (
                ayuda && <p id={`${campo}-ayuda`} className="mt-1.5 text-xs text-muted">{ayuda}</p>
              )}
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
            className={`${PILDORA} ${ACTIVA} hover:opacity-80 disabled:opacity-50`}
          >
            {enviando ? 'Enviando…' : 'Enviar propuesta'}
          </button>
        </div>
      </div>
    </form>
  )
}
