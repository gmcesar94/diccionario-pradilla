import { cacheLife } from 'next/cache'
import { getPalabras } from '@/lib/datos'

const ZONA = 'Europe/Madrid'

// Palabra del día: la misma para todo el mundo durante el día (hora de España).
// Se recalcula cada hora, así que cambia como mucho una hora después de medianoche.
export async function getPalabraDelDia() {
  'use cache'
  cacheLife('hours')

  const palabras = await getPalabras()
  const ahora = new Date()
  // Fecha de hoy en España (AAAA-MM-DD) → número de día, independiente de la hora del servidor.
  const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: ZONA }).format(ahora)
  const dia = Math.floor(Date.parse(`${hoy}T00:00:00Z`) / 86_400_000)
  // Salto de 37 posiciones por día para que días seguidos no den palabras vecinas.
  const palabra = palabras[(dia * 37) % palabras.length]

  const fecha = new Intl.DateTimeFormat('es-ES', {
    timeZone: ZONA,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(ahora)

  // «viernes, 16 de…» → «Viernes, 16 de…»
  return { palabra, fecha: fecha.charAt(0).toUpperCase() + fecha.slice(1) }
}
