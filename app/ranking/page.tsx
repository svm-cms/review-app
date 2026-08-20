import Link from 'next/link'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase/client'
import { rankCompanies, getScoreColor, MIN_REVIEWS_FOR_SCORE } from '@/lib/scoring'

export const metadata: Metadata = {
  title: 'Ranking de empresas: procesos de selección más transparentes',
  description:
    'Descubre qué empresas responden, dan feedback y respetan el tiempo de los candidatos — y cuáles no. Ranking basado en experiencias reales de procesos de selección.',
}

// Revalida la página cada hora — no hace falta recalcular en cada visita.
export const revalidate = 3600

const scoreBadgeClasses = {
  green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
}

export default async function RankingPage() {
  const { data: reviews } = await supabase.from('reviews').select('*')
  const rankings = rankCompanies(reviews || [])

  const top10 = rankings.slice(0, 10)
  const bottom10 = [...rankings].reverse().slice(0, 10)

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Ranking de procesos de selección
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Qué empresas responden, dan feedback y respetan el tiempo de los candidatos —
            según experiencias reales, no según lo que dicen de sí mismas.
          </p>
        </div>

        {rankings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 sm:p-10 text-center">
            <p className="text-gray-600 mb-2">
              Todavía no hay suficientes datos para publicar un ranking.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Cada empresa necesita al menos {MIN_REVIEWS_FOR_SCORE} experiencias compartidas
              antes de entrar en el ranking.
            </p>
            <Link
              href="/review/new"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Sé el primero en compartir tu experiencia
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-bold text-green-700 mb-4">
                🏆 Mejores procesos de selección
              </h2>
              <ol className="space-y-2">
                {top10.map((r, i) => (
                  <li key={r.company}>
                    <Link
                      href={`/company/${encodeURIComponent(r.company)}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition"
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-gray-400 text-sm w-5">{i + 1}</span>
                        <span className="font-medium text-gray-900">{r.company}</span>
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-sm font-bold ${
                          scoreBadgeClasses[getScoreColor(r.score!)]
                        }`}
                      >
                        {r.score}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-bold text-red-700 mb-4">
                ⚠️ Procesos que más fallan
              </h2>
              <ol className="space-y-2">
                {bottom10.map((r, i) => (
                  <li key={r.company}>
                    <Link
                      href={`/company/${encodeURIComponent(r.company)}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition"
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-gray-400 text-sm w-5">{i + 1}</span>
                        <span className="font-medium text-gray-900">{r.company}</span>
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-sm font-bold ${
                          scoreBadgeClasses[getScoreColor(r.score!)]
                        }`}
                      >
                        {r.score}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          Ranking calculado a partir de respuesta, feedback, valoraciones, si volverían a
          aplicar y duración del proceso. Empresas con menos de {MIN_REVIEWS_FOR_SCORE}{' '}
          experiencias no aparecen todavía.
        </p>
      </div>
    </div>
  )
}
