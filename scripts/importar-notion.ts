// Importa el diccionario exportado de Notion (JSON) a Supabase.
//
//   npm run importar -- data/notion.json --dry-run   (solo valida)
//   npm run importar -- data/notion.json             (valida e importa)
//   añadir --borrar-sobrantes para eliminar de Supabase las palabras que ya no están en el JSON
//
// Es idempotente: se puede ejecutar varias veces sin duplicar nada.
// Requiere un índice UNIQUE en palabras.slug.

import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { slugify } from '../lib/normalizar.ts'

// Nombre de la columna de acepciones que apunta a palabras.id.
const FK_PALABRA = 'palabra_id'
const LOTE = 500

interface AcepcionImport {
  numero: number
  categoria_gramatical: string | null
  definicion: string
  sinonimos: string[]
  ejemplo: string | null
}

interface PalabraImport {
  palabra: string
  slug: string
  etimologia: string | null
  acepciones: AcepcionImport[]
}

type Obj = Record<string, unknown>

// --- Mapeo desde el formato de Notion --------------------------------------
// Si tu JSON usa otros nombres de campo, este es el único bloque a ajustar.

// Busca un campo por varios nombres posibles, sin importar mayúsculas ni tildes.
function campo(obj: Obj, ...nombres: string[]): unknown {
  const buscados = nombres.map(slugify)
  for (const [clave, valor] of Object.entries(obj)) {
    if (buscados.includes(slugify(clave))) return valor
  }
  return undefined
}

function texto(valor: unknown): string | null {
  if (valor == null) return null
  const t = String(valor).trim()
  return t === '' ? null : t
}

function lista(valor: unknown): string[] {
  if (Array.isArray(valor)) return valor.map((v) => String(v).trim()).filter(Boolean)
  const t = texto(valor)
  return t ? t.split(/[,;]/).map((s) => s.trim()).filter(Boolean) : []
}

// Uno o varios ejemplos (texto o lista). Se guardan en una sola columna,
// un ejemplo por línea, y la web pinta cada línea por separado.
function ejemplos(valor: unknown): string | null {
  const lineas = (Array.isArray(valor) ? valor : String(valor ?? '').split('\n'))
    .map((v) => String(v).trim().replace(/^["“”«»]+|["“”«»]+$/g, '').trim())
    .filter(Boolean)
  return lineas.length > 0 ? lineas.join('\n') : null
}

function mapearAcepcion(raw: Obj, indice: number): AcepcionImport {
  const numero = Number(campo(raw, 'numero', 'n', 'num', 'orden'))
  return {
    numero: Number.isFinite(numero) && numero > 0 ? numero : indice + 1,
    categoria_gramatical: texto(campo(raw, 'categoria_gramatical', 'categoria', 'cat', 'tipo')),
    definicion: texto(campo(raw, 'definicion', 'texto', 'significado')) ?? '',
    sinonimos: lista(campo(raw, 'sinonimos', 'sin')),
    ejemplo: ejemplos(campo(raw, 'ejemplo', 'ejemplos', 'uso')),
  }
}

function mapearEntrada(raw: Obj): Omit<PalabraImport, 'slug'> {
  const acepciones = campo(raw, 'acepciones', 'definiciones', 'significados')
  return {
    palabra: texto(campo(raw, 'palabra', 'lema', 'nombre', 'titulo', 'title')) ?? '',
    etimologia: texto(campo(raw, 'etimologia', 'origen')),
    acepciones: Array.isArray(acepciones)
      ? acepciones.map((a, i) => mapearAcepcion(a as Obj, i))
      : [],
  }
}

function extraerEntradas(json: unknown): Obj[] {
  if (Array.isArray(json)) return json as Obj[]
  if (json && typeof json === 'object') {
    const lista = campo(json as Obj, 'palabras', 'entradas', 'results', 'data')
    if (Array.isArray(lista)) return lista as Obj[]
  }
  throw new Error('El JSON debe ser un array de palabras o un objeto con la clave "palabras".')
}

// --- Validación --------------------------------------------------------------

function preparar(entradas: Obj[]): { palabras: PalabraImport[]; errores: string[] } {
  const errores: string[] = []
  const usados = new Map<string, number>()
  const palabras: PalabraImport[] = []

  entradas.forEach((raw, i) => {
    const p = mapearEntrada(raw)
    const donde = `#${i + 1} (${p.palabra || 'sin nombre'})`

    if (!p.palabra) return void errores.push(`${donde}: falta la palabra`)
    if (p.acepciones.length === 0) errores.push(`${donde}: no tiene acepciones`)
    p.acepciones.forEach((a) => {
      if (!a.definicion) errores.push(`${donde}: la acepción ${a.numero} no tiene definición`)
    })
    const numeros = p.acepciones.map((a) => a.numero)
    if (new Set(numeros).size !== numeros.length) errores.push(`${donde}: números de acepción repetidos`)

    // Homógrafos: la segunda aparición recibe "-2", la tercera "-3"...
    const base = slugify(p.palabra)
    const veces = (usados.get(base) ?? 0) + 1
    usados.set(base, veces)
    palabras.push({ ...p, slug: veces === 1 ? base : `${base}-${veces}` })
  })

  return { palabras, errores }
}

// --- Importación -------------------------------------------------------------

function lotes<T>(items: T[], tamano: number): T[][] {
  const res: T[][] = []
  for (let i = 0; i < items.length; i += tamano) res.push(items.slice(i, i + tamano))
  return res
}

async function importar(palabras: PalabraImport[], borrarSobrantes: boolean) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local')

  const supabase = createClient(url, key, { auth: { persistSession: false } })
  const idPorSlug = new Map<string, string>()

  for (const lote of lotes(palabras, LOTE)) {
    const { data, error } = await supabase
      .from('palabras')
      .upsert(
        lote.map(({ palabra, slug, etimologia }) => ({ palabra, slug, etimologia })),
        { onConflict: 'slug' }
      )
      .select('id, slug')
    if (error) throw new Error(`Error guardando palabras: ${error.message}`)
    data.forEach((fila) => idPorSlug.set(fila.slug, fila.id))
  }

  // Se borran y recrean las acepciones de las palabras importadas.
  const ids = [...idPorSlug.values()]
  for (const lote of lotes(ids, 200)) {
    const { error } = await supabase.from('acepciones').delete().in(FK_PALABRA, lote)
    if (error) throw new Error(`Error borrando acepciones antiguas: ${error.message}`)
  }

  const acepciones = palabras.flatMap((p) =>
    p.acepciones.map((a) => ({ ...a, [FK_PALABRA]: idPorSlug.get(p.slug) }))
  )
  for (const lote of lotes(acepciones, LOTE)) {
    const { error } = await supabase.from('acepciones').insert(lote)
    if (error) throw new Error(`Error guardando acepciones: ${error.message}`)
  }

  console.log(`✓ Importadas ${idPorSlug.size} palabras y ${acepciones.length} acepciones.`)

  // Palabras que siguen en Supabase pero ya no están en el JSON.
  const { data: todas, error } = await supabase.from('palabras').select('id, slug, palabra')
  if (error) throw new Error(`Error leyendo palabras: ${error.message}`)
  const sobrantes = todas.filter((fila) => !idPorSlug.has(fila.slug))
  if (sobrantes.length === 0) return

  const nombres = sobrantes.map((fila) => fila.palabra).join(', ')
  if (!borrarSobrantes) {
    console.log(`\n${sobrantes.length} palabra(s) en Supabase que no están en el JSON: ${nombres}`)
    console.log('Vuelve a ejecutar con --borrar-sobrantes para eliminarlas.')
    return
  }
  for (const lote of lotes(sobrantes.map((fila) => fila.id), 200)) {
    const borrarAcepciones = await supabase.from('acepciones').delete().in(FK_PALABRA, lote)
    if (borrarAcepciones.error) throw new Error(`Error borrando acepciones: ${borrarAcepciones.error.message}`)
    const borrarPalabras = await supabase.from('palabras').delete().in('id', lote)
    if (borrarPalabras.error) throw new Error(`Error borrando palabras: ${borrarPalabras.error.message}`)
  }
  console.log(`✓ Borradas ${sobrantes.length} palabra(s) que ya no están en el JSON: ${nombres}`)
}

// --- Main --------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2)
  const ruta = args.find((a) => !a.startsWith('--'))
  const dryRun = args.includes('--dry-run')
  if (!ruta) {
    console.error('Uso: npm run importar -- <ruta.json> [--dry-run] [--borrar-sobrantes]')
    process.exit(1)
  }

  try {
    process.loadEnvFile('.env.local')
  } catch {
    // Sin .env.local: se usan las variables de entorno del sistema.
  }

  const { palabras, errores } = preparar(extraerEntradas(JSON.parse(readFileSync(ruta, 'utf8'))))
  const totalAcepciones = palabras.reduce((n, p) => n + p.acepciones.length, 0)
  console.log(`Leídas ${palabras.length} palabras y ${totalAcepciones} acepciones.`)

  if (errores.length > 0) {
    console.error(`\n${errores.length} problema(s):`)
    errores.forEach((e) => console.error(`  · ${e}`))
    console.error('\nCorrige el JSON (o el mapeo en mapearEntrada) y vuelve a intentarlo.')
    process.exit(1)
  }

  if (dryRun) {
    console.log('\nEjemplo de la primera entrada:')
    console.log(JSON.stringify(palabras[0], null, 2))
    console.log('\n--dry-run: no se ha escrito nada en Supabase.')
    return
  }

  await importar(palabras, args.includes('--borrar-sobrantes'))
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
