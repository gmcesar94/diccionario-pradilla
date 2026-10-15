import { Suspense } from 'react'
import Listado, { ListadoCompleto } from '@/app/components/Listado'
import { getPalabras } from '@/lib/datos'

export default async function Home() {
  const palabras = await getPalabras()

  return (
    <Suspense fallback={<ListadoCompleto palabras={palabras} />}>
      <Listado palabras={palabras} />
    </Suspense>
  )
}
