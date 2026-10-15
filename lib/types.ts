export interface Acepcion {
  id: string
  numero: number
  categoria_gramatical: string | null
  definicion: string
  sinonimos: string[] | null
  ejemplo: string | null
}

export interface Palabra {
  id: string
  palabra: string
  slug: string
  etimologia: string | null
  acepciones: Acepcion[]
}
