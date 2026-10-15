import type { Metadata } from 'next'
import CuadriculaLetras from '@/app/components/CuadriculaLetras'
import { getPalabras } from '@/lib/datos'
import { contarPorLetra } from '@/lib/letras'

export const metadata: Metadata = { title: 'Letras · ABC Pradilla' }

export default async function Letras() {
  const palabras = await getPalabras()
  return <CuadriculaLetras recuento={contarPorLetra(palabras)} />
}
