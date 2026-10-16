import { formaBase, slugify } from '@/lib/normalizar'

// Email de aviso de una propuesta de «Colabora»: los datos, enlaces directos a
// Supabase y el SQL ya preparado para añadir la palabra al diccionario en un paso
// (se puede hacer desde el móvil: el panel de Supabase funciona en el navegador).

export interface Propuesta {
  id: string
  palabra: string
  definicion: string
  ejemplo: string
  nombre: string
  contacto: string
}

// Texto como literal SQL: comillas simples duplicadas; vacío → null.
const literal = (texto: string) => (texto.trim() ? `'${texto.trim().replace(/'/g, "''")}'` : 'null')

const html = (texto: string) =>
  texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function sqlAceptar(p: Propuesta): string {
  const slug = slugify(formaBase(p.palabra))
  return `-- Añade «${p.palabra}» al diccionario. Revisa el texto y pulsa Run.
-- categoria_gramatical: f., m., adj., v., loc. adv.… (o null)
with nueva as (
  insert into palabras (palabra, slug)
  values (${literal(p.palabra)}, '${slug}')
  on conflict (slug) do nothing
  returning id
)
insert into acepciones (palabra_id, numero, categoria_gramatical, definicion, ejemplo)
select id, 1, null, ${literal(p.definicion)}, ${literal(p.ejemplo)}
from nueva;

update sugerencias set estado = 'aceptada' where id = '${p.id}';`
}

export function sqlDescartar(p: Propuesta): string {
  return `update sugerencias set estado = 'descartada' where id = '${p.id}';`
}

export function emailSugerencia(p: Propuesta, urlSupabase: string) {
  const proyecto = new URL(urlSupabase).hostname.split('.')[0]
  const panel = `https://supabase.com/dashboard/project/${proyecto}`
  const tabla = `${panel}/editor`
  const sql = (consulta: string) => `${panel}/sql/new?content=${encodeURIComponent(consulta)}`
  const aceptar = sqlAceptar(p)
  const descartar = sqlDescartar(p)

  const datos: [string, string][] = [
    ['Palabra', p.palabra],
    ['Definición', p.definicion],
    ['Ejemplo de uso', p.ejemplo],
    ['Nombre', p.nombre],
    ['Email o teléfono', p.contacto],
  ]

  const pasos = [
    'Toca «Añadir al diccionario». Se abre Supabase (inicia sesión si te lo pide) con el SQL ya escrito.',
    'Revisa el texto: corrige la definición si hace falta y cambia null por la categoría (por ejemplo \'f.\' o \'adj.\').',
    'Pulsa Run (abajo a la derecha en el móvil). Si avisa de que la consulta modifica datos, confirma.',
    'Listo: la palabra aparece en la web en menos de una hora y la propuesta queda como «aceptada».',
  ]

  const text = `Nueva palabra propuesta en ABC Pradilla

${datos.map(([etiqueta, valor]) => `${etiqueta}: ${valor || '—'}`).join('\n')}

CÓMO AÑADIRLA (también desde el móvil)
${pasos.map((paso, i) => `${i + 1}. ${paso}`).join('\n')}

Añadir al diccionario: ${sql(aceptar)}
Descartar: ${sql(descartar)}
Ver todas las propuestas: ${tabla} (tabla «sugerencias»)

Si el SQL no aparece ya escrito, abre ${panel}/sql/new, pega esto y pulsa Run:

${aceptar}
`

  const fila = ([etiqueta, valor]: [string, string]) =>
    `<tr><td style="padding:6px 16px 6px 0;color:#6b6b6b;vertical-align:top;white-space:nowrap">${etiqueta}</td><td style="padding:6px 0;color:#111111">${valor ? html(valor).replace(/\n/g, '<br>') : '—'}</td></tr>`
  const boton = (texto: string, enlace: string, fondo: string, color: string, borde: string) =>
    `<a href="${html(enlace)}" style="display:inline-block;margin:0 8px 8px 0;padding:12px 20px;border-radius:999px;background:${fondo};color:${color};border:1px solid ${borde};font-weight:600;text-decoration:none">${texto}</a>`

  const cuerpo = `<!doctype html>
<html lang="es"><body style="margin:0;padding:24px;background:#f1f2ea;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.5;color:#111111">
<div style="max-width:560px;margin:0 auto">
  <div style="background:#10291b;color:#7df079;padding:20px 24px;border-radius:16px 16px 0 0;font-size:20px;font-weight:700">ABC Pradilla · Nueva palabra</div>
  <div style="background:#fbfcf7;padding:24px;border-radius:0 0 16px 16px;border:1px solid #d6dacb;border-top:0">
    <p style="margin:0 0 4px;color:#6b6b6b;font-size:14px">Propuesta</p>
    <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:32px;line-height:1.2">${html(p.palabra)}</p>
    <table role="presentation" style="border-collapse:collapse;margin-bottom:24px">${datos.slice(1).map(fila).join('')}</table>

    ${boton('Añadir al diccionario', sql(aceptar), '#10291b', '#f1f2ea', '#10291b')}
    ${boton('Descartar', sql(descartar), '#fbfcf7', '#111111', '#111111')}
    <p style="margin:4px 0 24px"><a href="${html(tabla)}" style="color:#111111">Ver todas las propuestas en Supabase</a> <span style="color:#6b6b6b">(tabla «sugerencias»)</span></p>

    <p style="margin:0 0 8px;font-weight:700">Cómo añadirla, también desde el móvil</p>
    <ol style="margin:0 0 24px;padding-left:20px">${pasos.map((paso) => `<li style="margin-bottom:6px">${html(paso)}</li>`).join('')}</ol>

    <p style="margin:0 0 8px;color:#6b6b6b;font-size:14px">Si el SQL no aparece ya escrito, abre el <a href="${html(`${panel}/sql/new`)}" style="color:#111111">editor SQL</a>, pega esto y pulsa Run:</p>
    <pre style="margin:0;padding:12px;background:#f1f2ea;border-radius:8px;font-size:12px;line-height:1.5;white-space:pre-wrap;word-break:break-word">${html(aceptar)}</pre>
  </div>
</div>
</body></html>`

  return { subject: `Nueva palabra propuesta: ${p.palabra}`, text, html: cuerpo }
}
