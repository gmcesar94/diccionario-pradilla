'use server'

import { supabaseServidor } from '@/lib/supabase-servidor'
import { CAMPOS, type Campo, type EstadoEnvio } from '@/app/colabora/campos'
import { emailSugerencia } from '@/lib/emailSugerencia'

export async function proponerPalabra(_anterior: EstadoEnvio, formData: FormData): Promise<EstadoEnvio> {
  const id = Date.now()

  // Campo trampa invisible: solo lo rellenan los robots.
  if (String(formData.get('web') ?? '') !== '') return { id, ok: true, palabra: '' }

  const valores = {} as Record<Campo, string>
  const errores: Partial<Record<Campo, string>> = {}
  for (const [campo, regla] of Object.entries(CAMPOS) as [Campo, (typeof CAMPOS)[Campo]][]) {
    const valor = String(formData.get(campo) ?? '').trim()
    valores[campo] = valor
    if (regla.obligatorio && !valor) errores[campo] = 'Este campo es necesario.'
    else if (valor.length > regla.max) errores[campo] = `Como máximo ${regla.max} caracteres.`
  }
  if (Object.keys(errores).length > 0) return { id, ok: false, errores, valores }

  const fila = Object.fromEntries(
    Object.entries(valores).map(([campo, valor]) => [campo, valor || null])
  )
  // Cualquier fallo (Supabase, red, variables de entorno sin cargar) acaba en el
  // mensaje amable del formulario, nunca en la pantalla de error de Next.
  let guardada: string
  try {
    const { data, error } = await supabaseServidor().from('sugerencias').insert(fila).select('id').single()
    if (error) throw error
    guardada = data.id
  } catch (error) {
    console.error('Error guardando la sugerencia:', error)
    return { id, ok: false, valores, error: 'No se ha podido enviar. Inténtalo de nuevo en un rato.' }
  }

  await avisarPorEmail(guardada, valores)
  return { id, ok: true, palabra: valores.palabra }
}

// Aviso por email con Resend. Si no está configurado o falla, la propuesta
// ya está guardada en Supabase, así que solo se anota en la consola.
async function avisarPorEmail(id: string, valores: Record<Campo, string>) {
  const clave = process.env.RESEND_API_KEY
  const destino = process.env.AVISO_EMAIL
  if (!clave || !destino) {
    console.error('Aviso por email desactivado: faltan RESEND_API_KEY o AVISO_EMAIL')
    return
  }

  // Con enlaces a Supabase y el SQL ya preparado para añadir la palabra (ver lib/emailSugerencia.ts).
  const email = emailSugerencia({ id, ...valores }, process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')

  try {
    const respuesta = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${clave}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'ABC Pradilla <onboarding@resend.dev>',
        to: [destino],
        subject: email.subject,
        text: email.text,
        html: email.html,
      }),
    })
    if (!respuesta.ok) console.error('Resend respondió', respuesta.status, await respuesta.text())
  } catch (e) {
    console.error('No se ha podido enviar el aviso por email:', e)
  }
}
