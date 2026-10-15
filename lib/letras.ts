import { slugify } from '@/lib/normalizar'

export const LETRAS = 'abcdefghijklmnñopqrstuvwxyz'.split('')

// Letra del abecedario bajo la que va una palabra. La ñ es letra propia;
// el resto se toma sin tildes («Ábrego» va en la A).
export function letraDe(palabra: string): string {
  const inicial = palabra.trim().charAt(0).toLowerCase()
  return inicial === 'ñ' ? 'ñ' : slugify(palabra).charAt(0)
}

export function contarPorLetra(palabras: { palabra: string }[]): Record<string, number> {
  const recuento: Record<string, number> = {}
  for (const { palabra } of palabras) {
    const letra = letraDe(palabra)
    recuento[letra] = (recuento[letra] ?? 0) + 1
  }
  return recuento
}
