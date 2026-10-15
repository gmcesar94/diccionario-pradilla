// Muestra las propuestas de «Colabora» marcadas como aceptadas en Supabase,
// ya en el formato de data/diccionario.json, listas para pegar.
//
//   npm run sugerencias              (aceptadas)
//   npm run sugerencias -- pendiente (o descartada)

import { createClient } from '@supabase/supabase-js'

async function main() {
  try {
    process.loadEnvFile('.env.local')
  } catch {
    // Sin .env.local: se usan las variables de entorno del sistema.
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local')

  const estado = process.argv[2] ?? 'aceptada'
  const supabase = createClient(url, key, { auth: { persistSession: false } })
  const { data, error } = await supabase
    .from('sugerencias')
    .select('*')
    .eq('estado', estado)
    .order('created_at')
  if (error) throw new Error(error.message)

  if (data.length === 0) {
    console.log(`No hay propuestas con estado «${estado}».`)
    return
  }

  console.log(`${data.length} propuesta(s) «${estado}». Pégalas en data/diccionario.json:\n`)
  for (const s of data) {
    const acepcion: Record<string, string | string[] | null> = {
      categoria_gramatical: s.categoria_gramatical,
      definicion: s.definicion,
    }
    if (s.ejemplo) {
      const lineas = String(s.ejemplo).split('\n').map((l) => l.trim()).filter(Boolean)
      acepcion.ejemplo = lineas.length > 1 ? lineas : lineas[0]
    }
    console.log(`    ${JSON.stringify({ palabra: s.palabra, acepciones: [acepcion] })},`)
    if (s.nombre || s.contacto) console.error(`      ↳ propuesta por ${[s.nombre, s.contacto].filter(Boolean).join(' · ')}`)
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
