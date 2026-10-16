import { createClient } from '@supabase/supabase-js'

// Cliente con la clave secreta. Solo para código de servidor (Server Actions):
// nunca importarlo desde un componente de cliente.
export function supabaseServidor() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  // En local vienen de .env.local; en Vercel, de Settings → Environment Variables (y hay que redesplegar).
  const faltan = [!url && 'NEXT_PUBLIC_SUPABASE_URL', !key && 'SUPABASE_SERVICE_ROLE_KEY'].filter(Boolean)
  if (!url || !key) throw new Error(`Faltan variables de entorno: ${faltan.join(', ')}`)
  return createClient(url, key, { auth: { persistSession: false } })
}
