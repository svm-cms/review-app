import { supabase } from './supabase/client'

export interface JobTitleSuggestion {
  normalizedTitle: string
  family: string
}

interface JobTitleAliasRow {
  alias: string
  job_titles: { normalized_title: string; family: string } | { normalized_title: string; family: string }[] | null
}

/**
 * Busca puestos normalizados a partir de lo que escribe el usuario,
 * comparando contra el catálogo de variantes (español, inglés, jerga).
 *
 * A diferencia de la empresa, aquí NO forzamos ninguna coincidencia: el
 * catálogo cubre ~250 puestos comunes, pero el mercado laboral tiene
 * muchos más. Si el usuario no elige ninguna sugerencia, su texto libre
 * se guarda tal cual — el objetivo es ayudar a normalizar cuando hay
 * coincidencia clara, no obligar a encajar en una lista cerrada.
 */
export async function searchJobTitleSuggestions(query: string): Promise<JobTitleSuggestion[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  const { data, error } = await supabase
    .from('job_title_aliases')
    .select('alias, job_titles(normalized_title, family)')
    .ilike('alias', `%${trimmed}%`)
    .limit(20)

  if (error || !data) {
    console.error('Error buscando puestos:', error)
    return []
  }

  // Puede haber varios alias que apunten al mismo puesto normalizado
  // (p.ej. "jefe de proyecto" y "gerente de proyectos" -> "Project
  // Manager") -- deduplicamos para no repetir la misma sugerencia.
  const seen = new Map<string, JobTitleSuggestion>()

  for (const row of data as unknown as JobTitleAliasRow[]) {
    const jt = Array.isArray(row.job_titles) ? row.job_titles[0] : row.job_titles
    if (!jt) continue
    if (!seen.has(jt.normalized_title)) {
      seen.set(jt.normalized_title, { normalizedTitle: jt.normalized_title, family: jt.family })
    }
  }

  return Array.from(seen.values()).slice(0, 6)
}
