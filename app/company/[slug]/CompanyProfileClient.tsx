'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import {
  calculateCompanyStats,
  getScoreColor,
  MIN_REVIEWS_FOR_SCORE,
  type CompanyStats,
} from '@/lib/scoring'

interface Review {
  id: string
  company: string
  position: string
  process_type: string
  received_response: boolean
  interview_count: number
  received_feedback: boolean
  process_duration: string
  rating_communication: number
  rating_clarity: number
  rating_respect: number
  would_reapply: boolean
  improvement_text: string
  created_at: string
}

const scoreColorClasses = {
  green: { bg: 'bg-green-50', ring: 'ring-green-200', text: 'text-green-700' },
  amber: { bg: 'bg-amber-50', ring: 'ring-amber-200', text: 'text-amber-700' },
  red: { bg: 'bg-red-50', ring: 'ring-red-200', text: 'text-red-700' },
}

function ScoreCircle({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <div className="flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-100 ring-4 ring-gray-50 flex-shrink-0">
        <span className="text-xs text-gray-400 text-center px-1">Sin score aún</span>
      </div>
    )
  }

  const color = scoreColorClasses[getScoreColor(score)]

  return (
    <div
      className={`flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full ${color.bg} ring-4 ${color.ring} flex-shrink-0`}
    >
      <span className={`text-2xl sm:text-3xl font-bold ${color.text}`}>{score}</span>
      <span className={`text-[10px] sm:text-xs ${color.text}`}>/100</span>
    </div>
  )
}

export default function CompanyProfileClient({ companyName }: { companyName: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<CompanyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCompanyData = async () => {
      setLoading(true)
      setError(null)

      try {
        const { data: reviewsData, error: fetchError } = await supabase
          .from('reviews')
          .select('*')
          .ilike('company', companyName)
          .order('created_at', { ascending: false })

        if (fetchError) {
          console.error('Error fetching reviews:', fetchError)
          setError('Error al cargar las experiencias')
          setLoading(false)
          return
        }

        setReviews(reviewsData || [])
        setStats(calculateCompanyStats(reviewsData || []))
      } catch (err) {
        console.error('Error:', err)
        setError('Error al cargar los datos')
      }

      setLoading(false)
    }

    if (companyName) {
      loadCompanyData()
    }
  }, [companyName])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 text-center">Cargando experiencias de {companyName}...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header con score */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <ScoreCircle score={stats?.score ?? null} />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold break-words">{companyName}</h1>
                <p className="text-sm sm:text-base text-gray-500">
                  {stats?.totalReviews || 0} experiencias compartidas
                </p>
              </div>
            </div>
            <Link
              href="/review/new"
              className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-center text-sm sm:text-base whitespace-nowrap"
            >
              Compartir experiencia
            </Link>
          </div>

          {stats && stats.score === null && stats.totalReviews > 0 && (
            <p className="mt-4 text-xs sm:text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
              Todavía no mostramos un score para {companyName} — necesitamos al menos{' '}
              {MIN_REVIEWS_FOR_SCORE} experiencias para que el número sea representativo
              (llevamos {stats.totalReviews}).
            </p>
          )}

          {/* Stats - KPIs visuales */}
          {stats && stats.totalReviews > 0 ? (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-blue-50 p-3 sm:p-4 rounded-lg text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                  {stats.responseRate}%
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Respuesta recibida</div>
              </div>
              <div className="bg-green-50 p-3 sm:p-4 rounded-lg text-center">
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {stats.feedbackRate}%
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Feedback final</div>
              </div>
              <div className="bg-red-50 p-3 sm:p-4 rounded-lg text-center">
                <div className="text-xl sm:text-2xl font-bold text-red-600">
                  {stats.ghostingRate}%
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Ghosting</div>
              </div>
              <div className="bg-purple-50 p-3 sm:p-4 rounded-lg text-center">
                <div className="text-sm sm:text-xl font-bold text-purple-600">
                  {stats.commonDuration}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Duración más común</div>
              </div>
            </div>
          ) : (
            <div className="mt-6 p-6 sm:p-8 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-500 text-sm sm:text-base">
                No hay experiencias aún para {companyName}
              </p>
              <Link
                href="/review/new"
                className="inline-block mt-3 px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-sm sm:text-base"
              >
                Sé el primero en compartir tu experiencia
              </Link>
            </div>
          )}

          {stats && stats.totalReviews > 0 && (
            <p className="mt-4 text-xs text-gray-400">
              El score pondera respuesta (25%), feedback (25%), si volverían a aplicar (20%),
              valoraciones (20%) y duración del proceso (10%).
            </p>
          )}
        </div>

        {/* Ratings breakdown */}
        {stats && stats.totalReviews > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
            <h2 className="text-base sm:text-lg font-semibold mb-4">Valoración media</h2>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-yellow-500">
                  ★ {stats.avgCommunication}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Comunicación</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-yellow-500">
                  ★ {stats.avgClarity}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Claridad durante el proceso</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-yellow-500">
                  ★ {stats.avgRespect}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Trato recibido</div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de reviews */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold">Experiencias recientes</h2>

          {reviews.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 text-center text-gray-500 text-sm sm:text-base">
              No hay experiencias para mostrar
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg break-words">
                      {review.position}
                    </h3>
                    <div className="text-xs sm:text-sm text-gray-500">
                      {review.process_type} • Hace{' '}
                      {new Date(review.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                  <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-yellow-400 text-sm sm:text-base">
                        {star <=
                        (review.rating_communication +
                          review.rating_clarity +
                          review.rating_respect) /
                          3
                          ? '★'
                          : '☆'}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
                  <span
                    className={`px-2 py-1 rounded-full ${
                      review.received_response
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {review.received_response ? '✔ Respuesta' : '✖ Sin respuesta'}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full ${
                      review.received_feedback
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {review.received_feedback ? '✔ Feedback' : '✖ Sin feedback'}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 rounded-full">
                    {review.interview_count === 4 ? '4+' : review.interview_count}{' '}
                    {review.interview_count === 1 ? 'entrevista' : 'entrevistas'}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 rounded-full">
                    {review.process_duration}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full ${
                      review.would_reapply
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {review.would_reapply ? '👍 Volvería a aplicar' : '👎 No volvería a aplicar'}
                  </span>
                </div>

                {review.improvement_text && (
                  <p className="mt-3 text-gray-700 text-sm border-t pt-3 break-words">
                    "{review.improvement_text}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
