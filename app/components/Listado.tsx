'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Entrada from '@/app/components/Entrada'
import IndiceLetras from '@/app/components/IndiceLetras'
import { INACTIVA, BOTON } from '@/lib/estilos'
import { contarPorLetra, letraDe } from '@/lib/letras'
import { slugify } from '@/lib/normalizar'
import type { Palabra } from '@/lib/types'

interface Props {
  palabras: Palabra[]
  separadores?: boolean
}

// Lista de entradas filtrada por ?q=. Mientras se lee la URL (o en el HTML
// estático) se muestra la lista completa con <ListadoCompleto>.
export default function Listado(props: Props) {
  const q = useSearchParams().get('q') ?? ''
  return <Lista {...props} consulta={slugify(q)} textoBuscado={q.trim()} />
}

export function ListadoCompleto(props: Props) {
  return <Lista {...props} consulta="" />
}

// Con un separador al empezar cada letra y el índice de anclas (salvo al buscar).
function Lista({
  palabras,
  separadores = true,
  consulta,
  textoBuscado = '',
}: Props & { consulta: string; textoBuscado?: string }) {
  const visibles = consulta ? palabras.filter((p) => p.slug.includes(consulta)) : palabras
  const conIndice = separadores && !consulta

  if (visibles.length === 0) {
    return <SinResultados texto={textoBuscado} />
  }

  return (
    <>
      {conIndice && <IndiceLetras recuento={contarPorLetra(palabras)} />}
      <div>
        <p className="px-5 pt-5 text-sm text-muted md:px-6">
          {visibles.length} {visibles.length === 1 ? 'palabra' : 'palabras'}
        </p>
        {visibles.map((palabra, i) => {
          const letra = letraDe(palabra.palabra)
          const nuevaLetra = conIndice && (i === 0 || letraDe(visibles[i - 1].palabra) !== letra)
          return (
            <Fragment key={palabra.id}>
              {nuevaLetra && (
                <h2
                  id={`letra-${letra}`}
                  data-letra={letra}
                  className="scroll-mt-[calc(var(--alto-cabecera)+0.5rem)] md:scroll-mt-[calc(var(--alto-cabecera)+4.25rem)] border-b border-rule px-5 pt-8 pb-2 text-sm font-semibold uppercase text-muted md:px-6"
                >
                  {letra}
                </h2>
              )}
              <Entrada palabra={palabra} />
            </Fragment>
          )
        })}
      </div>
    </>
  )
}

// Si una búsqueda no encuentra nada, invita a proponer la palabra.
function SinResultados({ texto }: { texto: string }) {
  return (
    <div className="px-5 py-12 text-center md:px-6">
      <p className="text-muted">No se han encontrado palabras.</p>
      {texto && (
        <Link href={`/colabora?palabra=${encodeURIComponent(texto)}`} className={`${BOTON} ${INACTIVA} mt-4`}>
          ¿Falta «{texto}»? Propónla
        </Link>
      )}
    </div>
  )
}
