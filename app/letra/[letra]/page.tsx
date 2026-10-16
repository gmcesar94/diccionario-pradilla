import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import FiltroLetras from '@/app/components/FiltroLetras'
import Listado, { ListadoCompleto } from '@/app/components/Listado'
import { getPalabras } from '@/lib/datos'
import { LETRAS, letraDe } from '@/lib/letras'

export function generateStaticParams() {
  return LETRAS.map((letra) => ({ letra }))
}

async function leerLetra(params: PageProps<'/letra/[letra]'>['params']) {
  const { letra } = await params
  const decodificada = decodeURIComponent(letra).toLowerCase()
  if (!LETRAS.includes(decodificada)) notFound()
  return decodificada
}

export async function generateMetadata(props: PageProps<'/letra/[letra]'>): Promise<Metadata> {
  const letra = await leerLetra(props.params)
  return { title: `Letra ${letra.toUpperCase()} · ABC Pradilla` }
}

export default async function PaginaLetra(props: PageProps<'/letra/[letra]'>) {
  const letra = await leerLetra(props.params)
  const todas = await getPalabras()
  const palabras = todas.filter((p) => letraDe(p.palabra) === letra)
  const slugs = todas.map((p) => p.slug)

  return (
    <>
      <h1 className="sr-only">Letra {letra.toUpperCase()}</h1>
      <FiltroLetras activa={letra} />

      {palabras.length === 0 ? (
        <p className="px-margen py-12 text-center text-muted">
          Todavía no hay palabras con la {letra.toUpperCase()}.
        </p>
      ) : (
        <Suspense fallback={<ListadoCompleto palabras={palabras} separadores={false} slugs={slugs} />}>
          <Listado palabras={palabras} separadores={false} slugs={slugs} />
        </Suspense>
      )}
    </>
  )
}
