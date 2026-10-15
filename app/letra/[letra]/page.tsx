import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
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
  const palabras = (await getPalabras()).filter((p) => letraDe(p.palabra) === letra)

  return (
    <>
      <h1 className="sr-only">Letra {letra.toUpperCase()}</h1>

      {palabras.length === 0 ? (
        <p className="px-5 py-12 text-center text-muted md:px-6">
          Todavía no hay palabras con la {letra.toUpperCase()}.
        </p>
      ) : (
        <Suspense fallback={<ListadoCompleto palabras={palabras} separadores={false} />}>
          <Listado palabras={palabras} separadores={false} />
        </Suspense>
      )}
    </>
  )
}
