import { supabase } from './supabase/client'

// Colapsa espacios múltiples y quita espacios al principio/final.
// "Amazon   " y " Amazon" deben acabar siendo lo mismo.
function cleanWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

// Capitaliza cada palabra. Es una aproximación razonable para nombres de
// empresa normales ("Banco Santander"), pero no acierta con casos como
// "eBay" o "iOS" — esos habría que curarlos a mano si aparecen, o
// mantener una lista de excepciones más adelante.
function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(' ')
    .map((word) => (word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ')
}

/**
 * Resuelve el nombre "canónico" de una empresa a partir de lo que escribió
 * el usuario en el formulario:
 *
 *  1. Limpia espacios sobrantes.
 *  2. Busca en la tabla `companies` una coincidencia exacta, sin distinguir
 *     mayúsculas/minúsculas. Si ya existe, reutiliza el nombre tal cual
 *     está guardado — así "Amazon", "amazon " y "AMAZON" no generan tres
 *     fichas de empresa distintas que se reparten las reviews entre sí.
 *  3. Si no existe, la crea con capitalización tipo Title Case y la
 *     devuelve como nueva referencia canónica para futuras reviews.
 *
 * Esto es lo que evita que el mínimo de 5 reviews para mostrar el score
 * (ver lib/scoring.ts) se diluya entre variantes del mismo nombre.
 *
 * Nota de infra: asume que la tabla `companies` tiene columnas `name`
 * (text) y `review_count` (int). Si esa tabla no tiene una restricción
 * UNIQUE sobre `name` en Supabase, existe una ventana de carrera muy
 * pequeña en la que dos envíos simultáneos para una empresa nueva podrían
 * crear dos filas — conviene añadir esa constraint en Supabase para
 * blindarlo del todo.
 */
export async function resolveCanonicalCompanyName(rawName: string): Promise<string> {
  const cleaned = cleanWhitespace(rawName)

  const { data: existing } = await supabase
    .from('companies')
    .select('name, review_count')
    .ilike('name', cleaned) // ilike sin comodines = comparación exacta case-insensitive
    .limit(1)
    .maybeSingle()

  if (existing?.name) {
    // Empresa ya conocida: reutilizamos el nombre guardado tal cual,
    // y aprovechamos para mantener el contador de reviews al día.
    await supabase
      .from('companies')
      .update({ review_count: (existing.review_count ?? 0) + 1 })
      .ilike('name', cleaned)

    return existing.name
  }

  // Empresa nueva: normalizamos con Title Case y la damos de alta.
  const canonicalName = titleCase(cleaned)

  const { error: insertError } = await supabase
    .from('companies')
    .insert([{ name: canonicalName, review_count: 1 }])

  if (insertError) {
    // Puede ser una condición de carrera (alguien la creó en paralelo) o
    // que la tabla no tenga exactamente estas columnas. En cualquier caso
    // seguimos adelante con el nombre normalizado para no bloquear al
    // usuario — es preferible un duplicado ocasional a perder la review.
    console.error('No se pudo registrar la empresa en companies:', insertError)
  }

  return canonicalName
}
