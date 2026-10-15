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
