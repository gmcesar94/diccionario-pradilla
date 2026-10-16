import type { Metadata } from 'next'
import { Suspense } from 'react'
import Formulario, { FormularioConParametro } from '@/app/colabora/Formulario'

export const metadata: Metadata = { title: 'Colabora · ABC Pradilla' }

export default function Colabora() {
  return (
    <>
      <div className="border-b border-rule px-margen py-5 md:grid md:grid-cols-[12rem_1fr] md:gap-6">
        <h1 className="text-lg font-bold leading-snug">Colabora</h1>
        <p className="mt-1.5 max-w-[60ch] text-[0.9375rem] leading-relaxed md:mt-0.5">
          ¿Conoces alguna palabra o expresión de Pradilla que falte? Propónla y la revisaremos antes de
          añadirla al diccionario.
        </p>
      </div>
      <Suspense fallback={<Formulario />}>
        <FormularioConParametro />
      </Suspense>
    </>
  )
}
