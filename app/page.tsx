'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import {
  Search,
  BarChart3,
  Star,
  Mail,
  MessageSquare,
  RotateCcw,
  Sparkles,
  User,
  Building2,
  CheckCircle2,
  Ban,
  Handshake,
  ArrowRight,
  PenLine,
  Clock,
  Check,
} from 'lucide-react'

export default function Home() {
  const faqItems = [
    {
      question: '¿Las reviews son anónimas?',
      answer:
        'Sí, siempre de cara al público. Pedimos un email solo para evitar spam y reviews duplicadas — se convierte en un código encriptado antes de guardarse y nunca se muestra ni se publica.',
    },
    {
      question: '¿Cómo evitáis reviews falsas?',
      answer:
        'Filtramos lenguaje ofensivo automáticamente, limitamos el texto libre a comentarios breves y estructurados, y evitamos que el mismo candidato publique varias reviews sobre la misma empresa en poco tiempo.',
    },
    {
      question: '¿Puede una empresa responder a una review?',
      answer:
        'Todavía no — es una función que tenemos en el roadmap. Por ahora, si una empresa considera que una review incumple las normas, puede contactarnos para que la revisemos.',
    },
    {
      question: '¿Puedo modificar o eliminar mi review?',
      answer:
        'De momento no hay autoservicio para editar o borrar directamente. Escríbenos y lo gestionamos lo antes posible.',
    },
    {
      question: '¿Se pueden publicar comentarios negativos?',
      answer:
        'Sí, siempre que describan hechos verificables de tu experiencia real (plazos, respuesta, feedback) — no insultos ni acusaciones sin base.',
    },
    {
      question: '¿Cómo se calcula el score de una empresa?',
      answer:
        'Combinamos 5 variables con distinto peso: respuesta recibida (25%), feedback final (25%), si volverías a aplicar (20%), valoraciones (20%) y duración del proceso (10%). Solo se muestra a partir de 5 experiencias.',
    },
  ]

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

      // Ghosting real = nunca hubo respuesta a la candidatura,
      // distinto de "no feedback" (que puede incluir procesos donde
      // sí respondieron pero no dieron un cierre final).
      const { count: noResponseCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('received_response', false)

      setStats({
        noFeedback: noFeedbackCount || 0,
        ghosting: Math.round(((noResponseCount || 0) / (count || 1)) * 100)
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
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 md:py-20 pb-32 md:pb-20">
          {/* Hero */}
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              Antes de aplicar, entérate de cómo es realmente su proceso de selección
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8">
              Experiencias reales de candidatos — sin dramas, solo los datos que necesitas para decidir
            </p>

            <p className="text-sm sm:text-base text-gray-500 italic mb-6 sm:mb-8 max-w-xl mx-auto">
              Cada proceso de selección cuesta tiempo e ilusión. Creemos que mereces saberlo
              de antemano: cómo trata esa empresa a quien aplica.
            </p>

            {/* Buscador */}
            <div className="max-w-2xl mx-auto mb-4 relative">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Buscar empresa (ej: Glovo, Amazon, Inditex)"
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 rounded-xl focus:border-sky-500 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && suggestions.length > 0) {
                      handleSelectCompany(suggestions[0])
                    }
                  }}
                />
                <Link
                  href={`/company/${encodeURIComponent(searchTerm)}`}
                  className={`px-6 sm:px-8 py-3 sm:py-4 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition text-center inline-flex items-center justify-center gap-2 ${
                    !searchTerm ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <Search className="w-5 h-5" strokeWidth={2} />
                  Buscar
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
              Compartir experiencia
            </Link>
          </div>

          {/* Prueba social — solo se muestra con masa crítica de datos, */}
          {/* un contador en cero mata la confianza en vez de generarla. */}
          {totalReviews >= 20 && (
            <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
              <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-sky-600">{totalReviews}+</div>
                <div className="text-sm sm:text-base text-gray-600">Experiencias compartidas</div>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-red-600">{stats.noFeedback}</div>
                <div className="text-sm sm:text-base text-gray-600">No recibieron feedback</div>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-red-600">{stats.ghosting}%</div>
                <div className="text-sm sm:text-base text-gray-600">Ghosteados</div>
              </div>
            </div>
          )}

          {/* Cómo funciona */}
          <div className="mt-20 sm:mt-28">
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8">Cómo funciona</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
              <div className="flex flex-col items-center text-center">
                <Search className="w-8 h-8 sm:w-10 sm:h-10 mb-3 text-sky-600" strokeWidth={1.5} />
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Busca una empresa</h3>
                <p className="text-sm sm:text-base text-gray-600">Consulta su historial antes de aplicar</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10 mb-3 text-sky-600" strokeWidth={1.5} />
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Ve experiencias reales</h3>
                <p className="text-sm sm:text-base text-gray-600">Datos estructurados, no opiniones</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <PenLine className="w-8 h-8 sm:w-10 sm:h-10 mb-3 text-sky-600" strokeWidth={1.5} />
                <h3 className="font-semibold mb-2 text-sm sm:text-base">Comparte la tuya</h3>
                <p className="text-sm sm:text-base text-gray-600">En menos de 1 minuto</p>
              </div>
            </div>
          </div>

          {/* Cómo se valora */}
          <div className="mt-20 sm:mt-28">
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-2">
              ¿Cómo se valora un proceso?
            </h2>
            <p className="text-center text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-xl mx-auto">
              Esto no es una web para criticar empresas. El score combina 5 datos objetivos,
              cada uno con un peso distinto.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
              <div className="flex flex-col items-center bg-white p-3 sm:p-4 rounded-xl border border-gray-200 text-center">
                <Mail className="w-6 h-6 sm:w-7 sm:h-7 mb-1 text-sky-600" strokeWidth={1.5} />
                <div className="font-bold text-sky-600 text-sm sm:text-base">25%</div>
                <div className="text-xs sm:text-sm text-gray-600">Respuesta</div>
              </div>
              <div className="flex flex-col items-center bg-white p-3 sm:p-4 rounded-xl border border-gray-200 text-center">
                <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 mb-1 text-sky-600" strokeWidth={1.5} />
                <div className="font-bold text-sky-600 text-sm sm:text-base">25%</div>
                <div className="text-xs sm:text-sm text-gray-600">Feedback</div>
              </div>
              <div className="flex flex-col items-center bg-white p-3 sm:p-4 rounded-xl border border-gray-200 text-center">
                <RotateCcw className="w-6 h-6 sm:w-7 sm:h-7 mb-1 text-sky-600" strokeWidth={1.5} />
                <div className="font-bold text-sky-600 text-sm sm:text-base">20%</div>
                <div className="text-xs sm:text-sm text-gray-600">Volvería a aplicar</div>
              </div>
              <div className="flex flex-col items-center bg-white p-3 sm:p-4 rounded-xl border border-gray-200 text-center">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 mb-1 text-sky-600" strokeWidth={1.5} />
                <div className="font-bold text-sky-600 text-sm sm:text-base">20%</div>
                <div className="text-xs sm:text-sm text-gray-600">Valoraciones</div>
              </div>
              <div className="flex flex-col items-center bg-white p-3 sm:p-4 rounded-xl border border-gray-200 text-center">
                <Clock className="w-6 h-6 sm:w-7 sm:h-7 mb-1 text-sky-600" strokeWidth={1.5} />
                <div className="font-bold text-sky-600 text-sm sm:text-base">10%</div>
                <div className="text-xs sm:text-sm text-gray-600">Duración</div>
              </div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">
              El score se publica únicamente a partir de 5 experiencias por empresa, para garantizar su representatividad.
            </p>
          </div>

          {/* Para candidatos / Para empresas */}
          <div className="mt-20 sm:mt-28 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200">
              <User className="w-7 h-7 sm:w-8 sm:h-8 mb-2 text-sky-600" strokeWidth={1.5} />
              <h3 className="text-lg sm:text-xl font-bold mb-3">Para candidatos</h3>
              <ul className="space-y-2 text-sm sm:text-base text-gray-600">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-1 text-sky-600 flex-shrink-0" strokeWidth={2} />
                  Saber qué esperar antes de aplicar
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-1 text-sky-600 flex-shrink-0" strokeWidth={2} />
                  Comparar procesos entre empresas
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-1 text-sky-600 flex-shrink-0" strokeWidth={2} />
                  Compartir tu experiencia y ayudar a otros candidatos
                </li>
              </ul>
            </div>
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200">
              <Building2 className="w-7 h-7 sm:w-8 sm:h-8 mb-2 text-sky-600" strokeWidth={1.5} />
              <h3 className="text-lg sm:text-xl font-bold mb-3">Para empresas</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-3">
                La transparencia también ayuda a las empresas a mejorar sus procesos de selección.
              </p>
              <ul className="space-y-2 text-sm sm:text-base text-gray-600">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-1 text-sky-600 flex-shrink-0" strokeWidth={2} />
                  Ver cómo perciben los candidatos su proceso de selección
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-1 text-sky-600 flex-shrink-0" strokeWidth={2} />
                  Detectar qué mejorar antes de que impacte en la marca empleadora
                </li>
                <li className="flex items-start gap-2 text-gray-400">
                  <Check className="w-4 h-4 mt-1 flex-shrink-0" strokeWidth={2} />
                  Panel de analytics — próximamente
                </li>
              </ul>
            </div>
          </div>

          {/* Principios */}
          <div className="mt-20 sm:mt-28">
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-6">Nuestros principios</h2>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-sky-50 text-sky-700 rounded-full text-xs sm:text-sm font-medium">
                <BarChart3 className="w-4 h-4" strokeWidth={2} />
                Datos antes que opiniones
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-sky-50 text-sky-700 rounded-full text-xs sm:text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                Experiencias reales
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-sky-50 text-sky-700 rounded-full text-xs sm:text-sm font-medium">
                <Ban className="w-4 h-4" strokeWidth={2} />
                Sin ataques personales
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-sky-50 text-sky-700 rounded-full text-xs sm:text-sm font-medium">
                <Handshake className="w-4 h-4" strokeWidth={2} />
                Transparencia para candidatos y empresas
              </span>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-20 sm:mt-28 max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8">
              Preguntas frecuentes
            </h2>
            <div className="space-y-3">
              {faqItems.map((item) => (
                <div key={item.question} className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200">
                  <h3 className="font-semibold text-sm sm:text-base mb-1.5">{item.question}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Datos estructurados para Google (FAQ) */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: faqItems.map((item) => ({
                  '@type': 'Question',
                  name: item.question,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: item.answer,
                  },
                })),
              }),
            }}
          />

          {/* CTA final (visible en desktop) */}
          <div className="mt-20 sm:mt-28 text-center hidden md:block">
            <Link
              href="/review/new"
              className="inline-flex items-center gap-2 px-10 sm:px-12 py-3 sm:py-4 bg-sky-600 text-white text-base sm:text-lg rounded-xl font-semibold hover:bg-sky-700 transition"
            >
              Comparte tu experiencia
              <ArrowRight className="w-5 h-5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>

      {/* Botón flotante para móvil - ajustado para no solapar con cookie banner */}
      <div className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden">
        <Link
          href="/review/new"
          className="bg-sky-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-lg font-semibold hover:bg-sky-700 transition flex items-center gap-2 text-sm sm:text-base"
        >
          <PenLine className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
          Compartir experiencia
        </Link>
      </div>
    </>
  )
}