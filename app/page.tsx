import { Suspense } from 'react'
import FiltroLetras, { FiltroLetrasConParametros } from '@/app/components/FiltroLetras'
import Listado, { ListadoCompleto } from '@/app/components/Listado'
import PalabraDelDia from '@/app/components/PalabraDelDia'
import { getPalabras } from '@/lib/datos'

export default async function Home() {
  const palabras = await getPalabras()
  const slugs = palabras.map((p) => p.slug)

  return (
    <>
      <Suspense fallback={<FiltroLetras activa={null} />}>
        <FiltroLetrasConParametros />
      </Suspense>
      <Suspense fallback={<ListadoCompleto palabras={palabras} slugs={slugs} inicio={<PalabraDelDia />} />}>
        <Listado palabras={palabras} slugs={slugs} inicio={<PalabraDelDia />} />
      </Suspense>
    </>
  )
}
