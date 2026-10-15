'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { proponerPalabra } from '@/app/colabora/acciones'
import { CAMPOS, GRUPOS, type Campo, type EstadoEnvio } from '@/app/colabora/campos'
import { ACTIVA, INACTIVA, BOTON } from '@/lib/estilos'

const FILA = 'border-b border-rule px-5 py-5 md:grid md:grid-cols-[12rem_1fr] md:gap-6 md:px-6'
const CONTROL =
  'w-full rounded-md border border-ink bg-paper px-4 text-[0.9375rem] placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-ink aria-invalid:border-error aria-invalid:ring-error'

const AYUDAS: Partial<Record<Campo, string>> = {
  categoria_gramatical: 'Por ejemplo: v., m., f., adj.',
  ejemplo: 'Una frase como se diría en el pueblo.',
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
    <form action={enviar} noValidate>
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
              {nota && <p className="text-xs text-muted sm:col-span-2">{nota}</p>}
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
            className={`${BOTON} ${ACTIVA} hover:opacity-80 disabled:opacity-50`}
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
        {obligatorio && <span className="text-muted"> *</span>}
      </label>
      {campo === 'definicion' || campo === 'ejemplo' ? (
        <textarea {...props} rows={campo === 'definicion' ? 3 : 2} className={`${CONTROL} py-2`} />
      ) : (
        <input {...props} type="text" className={`${CONTROL} h-10`} />
      )}
      {error ? (
        <p id={`${campo}-error`} className="mt-1.5 text-sm text-error">{error}</p>
      ) : (
        ayuda && <p id={`${campo}-ayuda`} className="mt-1.5 text-xs text-muted">{ayuda}</p>
      )}
    </div>
  )
}
