// Convierte un email en un hash SHA-256 antes de enviarlo a ningún sitio.
// El objetivo NO es criptografía de nivel bancario, es privacidad por
// diseño: ni nosotros como operadores del sitio llegamos a ver ni
// almacenar el email en texto plano en ningún momento. Solo guardamos
// el hash, que sirve para comparar "¿es el mismo email de antes?" sin
// poder recuperar el email original a partir de él.
//
// Nota honesta: al ser un hash sin "sal" secreta del lado servidor
// (no tenemos infraestructura de backend propia más allá de Supabase),
// alguien con acceso a la base de datos y mucha paciencia podría
// intentar fuerza bruta contra listas de emails conocidos. Para el
// propósito de anti-spam del MVP es una barrera razonable; si el
// proyecto escala, esto debería moverse a una Edge Function con una
// sal secreta que nunca toque el cliente.

export async function hashEmail(email: string): Promise<string> {
  const normalized = email.trim().toLowerCase()
  const encoder = new TextEncoder()
  const data = encoder.encode(normalized)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

// Validación básica de formato de email (no exhaustiva, solo evita
// errores de tecleo obvios antes de gastar una llamada a Supabase).
export function isValidEmailFormat(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}
