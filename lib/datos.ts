import { cacheLife } from 'next/cache'
import { supabase } from '@/lib/supabase'
import type { Palabra } from '@/lib/types'

const ORDEN_ES = new Intl.Collator('es', { sensitivity: 'base' })

// Todo el diccionario de una vez: son pocas palabras y así la búsqueda
// puede filtrar en el navegador sin consultar a Supabase en cada tecla.
export async function getPalabras(): Promise<Palabra[]> {
  'use cache'
  cacheLife('hours')

  const { data, error } = await supabase
    .from('palabras')
    .select('*, acepciones (*)')
    .order('numero', { referencedTable: 'acepciones', ascending: true })

  if (error) throw new Error(`No se ha podido cargar el diccionario: ${error.message}`)

  return (data as Palabra[]).sort((a, b) => ORDEN_ES.compare(a.palabra, b.palabra))
}
