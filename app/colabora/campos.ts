// Campos del formulario «Colabora» y sus límites (los mismos que en supabase/sugerencias.sql).
export const CAMPOS = {
  palabra: { etiqueta: 'Palabra', max: 80, obligatorio: true, grupo: 'palabra', ancho: 'completo' },
  definicion: { etiqueta: 'Definición', max: 1000, obligatorio: true, grupo: 'palabra', ancho: 'completo' },
  ejemplo: { etiqueta: 'Ejemplo de uso', max: 500, obligatorio: false, grupo: 'palabra', ancho: 'completo' },
  nombre: { etiqueta: 'Nombre', max: 80, obligatorio: false, grupo: 'contacto', ancho: 'medio' },
  contacto: { etiqueta: 'Email o teléfono', max: 120, obligatorio: false, grupo: 'contacto', ancho: 'medio' },
} as const

export const GRUPOS = {
  palabra: { titulo: 'La palabra', nota: null },
  contacto: {
    titulo: 'Contacto',
    nota: 'Tus datos están protegidos. Solo los usaremos para contactarte si tenemos dudas sobre la palabra.',
  },
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
