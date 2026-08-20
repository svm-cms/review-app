import { supabase } from './supabase/client'
import { hashEmail } from './emailHash'

const COOLDOWN_DAYS = 180

export interface SpamCheckResult {
  blocked: boolean
  reason?: string
}

/**
 * Comprueba si este email ya dejó una review para esta misma empresa
 * dentro del periodo de "enfriamiento" (180 días). No identifica quién
 * es la persona -- solo compara hashes -- pero sí evita que un mismo
 * email publique varias reviews seguidas sobre la misma empresa para
 * manipular el score.
 *
 * Requiere una tabla `review_verifications` en Supabase con columnas:
 *   id           uuid, PK, default gen_random_uuid()
 *   review_id    uuid, referencia a reviews.id
 *   company      text  (guardamos el nombre canónico aquí también,
 *                        para no depender de un JOIN a `reviews`)
 *   email_hash   text
 *   created_at   timestamptz, default now()
 */
export async function checkSpamCooldown(
  emailHash: string,
  canonicalCompany: string
): Promise<SpamCheckResult> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - COOLDOWN_DAYS)

  const { data, error } = await supabase
    .from('review_verifications')
    .select('id')
    .eq('email_hash', emailHash)
    .ilike('company', canonicalCompany)
    .gte('created_at', cutoff.toISOString())
    .limit(1)

  if (error) {
    // Si la comprobación falla (p.ej. la tabla aún no existe), dejamos
    // pasar la review en vez de bloquear a un usuario legítimo por un
    // problema nuestro de infraestructura -- pero lo dejamos en el log.
    console.error('Error comprobando cooldown anti-spam:', error)
    return { blocked: false }
  }

  if (data && data.length > 0) {
    return {
      blocked: true,
      reason: 'Ya has compartido una experiencia para esta empresa recientemente.',
    }
  }

  return { blocked: false }
}

/**
 * Registra la verificación (hash de email, no el email) vinculada a la
 * review recién creada. Vive en su propia tabla para poder borrarse sin
 * afectar a la review pública, que permanece anónima.
 */
export async function recordVerification(
  reviewId: string,
  canonicalCompany: string,
  emailHash: string
): Promise<void> {
  const { error } = await supabase.from('review_verifications').insert([
    {
      review_id: reviewId,
      company: canonicalCompany,
      email_hash: emailHash,
    },
  ])

  if (error) {
    console.error('Error registrando verificación:', error)
  }
}

export { hashEmail }
