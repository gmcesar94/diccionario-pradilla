import type { Metadata } from 'next'
import CuadriculaLetras from '@/app/components/CuadriculaLetras'
import { getPalabras } from '@/lib/datos'
import { contarPorLetra } from '@/lib/letras'

export const metadata: Metadata = { title: 'Índice · ABC Pradilla' }

export default async function Letras() {
  const palabras = await getPalabras()
  return (
    <>
      <h1 className="sr-only">Índice de letras</h1>
      <CuadriculaLetras recuento={contarPorLetra(palabras)} />
    </>
  )
}
