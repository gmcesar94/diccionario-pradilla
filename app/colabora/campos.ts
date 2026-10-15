// Campos del formulario «Colabora» y sus límites (los mismos que en supabase/sugerencias.sql).
export const CAMPOS = {
  palabra: { etiqueta: 'Palabra', max: 80, obligatorio: true },
  definicion: { etiqueta: 'Definición', max: 1000, obligatorio: true },
  categoria_gramatical: { etiqueta: 'Categoría', max: 30, obligatorio: false },
  ejemplo: { etiqueta: 'Ejemplo de uso', max: 500, obligatorio: false },
  nombre: { etiqueta: 'Tu nombre', max: 80, obligatorio: false },
  contacto: { etiqueta: 'Email o teléfono', max: 120, obligatorio: false },
} as const

export type Campo = keyof typeof CAMPOS

export interface EstadoEnvio {
  id: number
  ok: boolean
  palabra?: string
  error?: string
  errores?: Partial<Record<Campo, string>>
  valores?: Partial<Record<Campo, string>>
}
