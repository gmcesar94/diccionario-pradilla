// Convierte una palabra en su forma de búsqueda/URL: minúsculas, sin tildes
// ni diéresis (la ñ pasa a n) y con guiones en lugar de espacios.
// La usan tanto el importador (para generar slugs) como el buscador.
export function slugify(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Forma de la palabra sin la terminación de femenino al estilo RAE:
// «Ranero, ra» → «Ranero». Es la que da el slug, para que no cambie al añadirla.
export function formaBase(palabra: string): string {
  return palabra.split(',')[0].trim()
}

// Slug del femenino de un adjetivo «Ranero, ra» → «ranera», para que también
// se encuentre al buscarlo. Devuelve null si la palabra no tiene femenino.
export function femenino(palabra: string): string | null {
  if (!palabra.includes(',')) return null
  return slugify(formaBase(palabra)).replace(/o$/, 'a')
}
