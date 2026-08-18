'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [totalReviews, setTotalReviews] = useState(0)
  const [stats, setStats] = useState({
    noFeedback: 0,
    ghosting: 0
  })

  useEffect(() => {
    const loadStats = async () => {
      const { count } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
      
      setTotalReviews(count || 0)

      const { count: noFeedbackCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('received_feedback', false)

      setStats({
        noFeedback: noFeedbackCount || 0,
        ghosting: Math.round(((noFeedbackCount || 0) / (count || 1)) * 100)
      })
    }

    loadStats()
  }, [])

  const handleSearch = async (value: string) => {
    setSearchTerm(value)
    
    if (value.length > 1) {
      const { data } = await supabase
        .from('companies')
        .select('name')
        .ilike('name', `%${value}%`)
        .order('review_count', { ascending: false })
        .limit(5)

      setSuggestions(data?.map(item => item.name) || [])
    } else {
      setSuggestions([])
    }
  }

  const handleSelectCompany = (company: string) => {
    setSearchTerm(company)
    setSuggestions([])
    window.location.href = `/company/${encodeURIComponent(company)}`
  }

  return (
    <>
      {/* Contenido principal */}
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 md:py-16 pb-32 md:pb-16">
          {/* Hero */}
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              ¿Cómo fue realmente el proceso de selección en esta empresa?
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8">
              Descubre experiencias reales de candidatos (sin toxicidad, solo datos útiles)
            </p>

            {/* Buscador */}
            <div className="max-w-2xl mx-auto mb-4 relative">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Buscar empresa (ej: Glovo, Amazon, Inditex)"
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && suggestions.length > 0) {
                      handleSelectCompany(suggestions[0])
                    }
                  }}
                />
                <Link
                  href={`/company/${encodeURIComponent(searchTerm)}`}
                  className={`px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition text-center ${
                    !searchTerm ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  Buscar 🔍
                </Link>
              </div>

              {/* Sugerencias autocomplete */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-xl shadow-lg z-10">
                  {suggestions.map((company) => (
                    <button
                      key={company}
                      onClick={() => handleSelectCompany(company)}
                      className="w-full px-6 py-3 text-left hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl transition"
                    >
                      {company}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Botón secundario (visible en desktop) */}
            <Link
              href="/review/new"
              className="hidden md:inline-block px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
            >
              Compartir experiencia ✍️
            </Link>
          </div>

          {/* Prueba social */}
          <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">{totalReviews}+</div>
              <div className="text-sm sm:text-base text-gray-600">Experiencias compartidas</div>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-bold text-red-600">{stats.noFeedback}</div>
              <div className="text-sm sm:text-base text-gray-600">No recibieron feedback</div>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-bold text-orange-600">{stats.ghosting}%</div>
              <div className="text-sm sm:text-base text-gray-600">Ghosteados</div>
            </div>
          </div>

          {/* Cómo funciona */}
          <div className="mt-16 sm:mt-20">
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8">Cómo funciona</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-3">🔍</div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Busca una empresa</h3>
                <p className="text-sm sm:text-base text-gray-600">Encuentra la empresa que te interesa</p>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-3">📊</div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Ve experiencias reales</h3>
                <p className="text-sm sm:text-base text-gray-600">Datos estructurados, no opiniones</p>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-3">✍️</div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Comparte la tuya</h3>
                <p className="text-sm sm:text-base text-gray-600">En menos de 1 minuto</p>
              </div>
            </div>
          </div>

          {/* CTA final (visible en desktop) */}
          <div className="mt-16 sm:mt-20 text-center hidden md:block">
            <Link
              href="/review/new"
              className="inline-block px-10 sm:px-12 py-3 sm:py-4 bg-blue-600 text-white text-base sm:text-lg rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              👉 Comparte tu experiencia
            </Link>
          </div>
        </div>
      </div>

      {/* Botón flotante para móvil - ajustado para no solapar con cookie banner */}
      <div className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden">
        <Link
          href="/review/new"
          className="bg-green-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-lg font-semibold hover:bg-green-700 transition flex items-center gap-2 text-sm sm:text-base"
        >
          ✍️ Compartir experiencia
        </Link>
      </div>
    </>
  )
}