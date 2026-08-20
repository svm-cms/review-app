// ============================================
// MOTOR DE SCORING — fuente única de verdad
// ============================================
//
// El score de una empresa (0-100) combina 5 señales, ponderadas según
// lo que más le importa a un candidato en un proceso de selección:
//
//   25% — ¿Recibió respuesta a su candidatura?
//   25% — ¿Recibió feedback final (le dijeron si seguía o no)?
//   20% — ¿Volvería a aplicar a esta empresa?
//   20% — Valoración media (comunicación + claridad + respeto)
//   10% — Duración del proceso (procesos más cortos puntúan más alto)
//
// No usamos "interview_count" en el score: es informativo (cuántas fases
// tuvo el proceso) pero no es en sí mismo bueno ni malo — una empresa con
// 3 entrevistas y feedback claro es mejor experiencia que una con 1 sola
// entrevista seguida de silencio.

export const MIN_REVIEWS_FOR_SCORE = 5

export interface ScoreableReview {
  company: string
  received_response: boolean
  received_feedback: boolean
  would_reapply: boolean
  process_duration: string
  rating_communication: number
  rating_clarity: number
  rating_respect: number
}

export interface CompanyStats {
  totalReviews: number
  score: number | null // null si no llega al mínimo de reviews
  avgCommunication: number
  avgClarity: number
  avgRespect: number
  responseRate: number
  feedbackRate: number
  ghostingRate: number // = 100 - responseRate (nunca recibió ni respuesta)
  reapplyRate: number
  commonDuration: string
}

// Puntos asignados a cada franja de duración (100 = mejor, 0 = peor)
const DURATION_POINTS: Record<string, number> = {
  '<1 semana': 100,
  '1-2 semanas': 75,
  '2-4 semanas': 40,
  '+1 mes': 10,
}

function average(nums: number[]): number {
  if (nums.length === 0) return 0
  return nums.reduce((sum, n) => sum + n, 0) / nums.length
}

function percentage(count: number, total: number): number {
  if (total === 0) return 0
  return Math.round((count / total) * 100)
}

export function calculateCompanyStats(reviews: ScoreableReview[]): CompanyStats | null {
  const total = reviews.length
  if (total === 0) return null

  const responded = reviews.filter((r) => r.received_response).length
  const feedback = reviews.filter((r) => r.received_feedback).length
  const reapply = reviews.filter((r) => r.would_reapply).length

  const avgCommunication = average(reviews.map((r) => r.rating_communication))
  const avgClarity = average(reviews.map((r) => r.rating_clarity))
  const avgRespect = average(reviews.map((r) => r.rating_respect))

  // Duración más común (moda) — solo para mostrar como dato descriptivo
  const durationCounts = reviews.reduce((acc: Record<string, number>, r) => {
    acc[r.process_duration] = (acc[r.process_duration] || 0) + 1
    return acc
  }, {})
  const commonDuration = Object.keys(durationCounts).reduce((a, b) =>
    durationCounts[a] > durationCounts[b] ? a : b
  )

  const responseRate = percentage(responded, total)
  const feedbackRate = percentage(feedback, total)
  const reapplyRate = percentage(reapply, total)
  const ghostingRate = 100 - responseRate

  // Score de duración: promedio de puntos por review (no solo la moda),
  // para que una empresa con procesos mayoritariamente rápidos pero un
  // outlier larguísimo no se vea penalizada de forma desproporcionada.
  const durationScore = average(
    reviews.map((r) => DURATION_POINTS[r.process_duration] ?? 50)
  )

  // Ratings de 1-5 normalizados a 0-100
  const ratingsScore = ((avgCommunication + avgClarity + avgRespect) / 3 / 5) * 100

  const rawScore =
    responseRate * 0.25 +
    feedbackRate * 0.25 +
    reapplyRate * 0.2 +
    ratingsScore * 0.2 +
    durationScore * 0.1

  const score = total >= MIN_REVIEWS_FOR_SCORE ? Math.round(rawScore) : null

  return {
    totalReviews: total,
    score,
    avgCommunication: Math.round(avgCommunication * 10) / 10,
    avgClarity: Math.round(avgClarity * 10) / 10,
    avgRespect: Math.round(avgRespect * 10) / 10,
    responseRate,
    feedbackRate,
    ghostingRate,
    reapplyRate,
    commonDuration,
  }
}

// Color semántico del score, pensado para dar de un vistazo la lectura
// correcta: verde = proceso sano, ámbar = mixto, rojo = evítalo si puedes.
export function getScoreColor(score: number): 'green' | 'amber' | 'red' {
  if (score >= 70) return 'green'
  if (score >= 40) return 'amber'
  return 'red'
}

export interface CompanyRanking extends CompanyStats {
  company: string
}

// Agrupa todas las reviews por empresa y calcula el ranking. Solo incluye
// empresas que ya alcanzan el mínimo de reviews (ver MIN_REVIEWS_FOR_SCORE) —
// no tendría sentido "rankear" una empresa con 1 sola experiencia.
export function rankCompanies(reviews: ScoreableReview[]): CompanyRanking[] {
  const grouped = new Map<string, ScoreableReview[]>()

  for (const review of reviews) {
    const key = review.company
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(review)
  }

  const rankings: CompanyRanking[] = []

  for (const [company, companyReviews] of grouped) {
    const stats = calculateCompanyStats(companyReviews)
    if (stats && stats.score !== null) {
      rankings.push({ company, ...stats })
    }
  }

  return rankings.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
}
