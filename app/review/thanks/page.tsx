'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function ThanksPage() {
  const [show, setShow] = useState(false)
  const [confetti, setConfetti] = useState<{ id: number; x: number; color: string; size: number; delay: number }[]>([])

  useEffect(() => {
    // Activar animación de entrada después de 100ms
    const timer = setTimeout(() => {
      setShow(true)
    }, 100)

    // Generar confeti
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE']
    const newConfetti = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      delay: Math.random() * 2
    }))
    setConfetti(newConfetti)

    return () => clearTimeout(timer)
  }, [])

  // Función para trackear eventos en Google Analytics
  const trackEvent = (action: string, label: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('event', action, {
        event_category: 'Compartir',
        event_label: label,
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* Confeti animado */}
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute top-0 animate-confetti"
          style={{
            left: `${piece.x}%`,
            width: `${piece.size}px`,
            height: `${piece.size * 2}px`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            transform: 'rotate(45deg)'
          }}
        />
      ))}

      {/* Contenido principal con animación de entrada */}
      <div 
        className={`text-center max-w-md relative z-10 transition-all duration-700 ${
          show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Emoji con rebote */}
        <div className="text-7xl mb-6 animate-bounce-custom">
          🙌
        </div>

        {/* Título con gradiente */}
        <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          ¡Gracias por compartir tu experiencia!
        </h1>

        {/* Subtítulo con animación más lenta */}
        <p className={`text-gray-600 mb-8 transition-all duration-700 delay-200 ${
          show ? 'opacity-100' : 'opacity-0'
        }`}>
          Estás ayudando a hacer los procesos de selección más transparentes para otros candidatos.
        </p>

        {/* Tarjeta de estadística animada */}
        <div className={`bg-white rounded-xl shadow-md p-4 mb-8 transition-all duration-700 delay-300 ${
          show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          <p className="text-sm text-gray-500">
            📊 Tu experiencia se ha sumado a las reviews de otros candidatos
          </p>
          <div className="flex justify-center gap-6 mt-2 text-xs text-gray-400">
            <span>✅ Anónimo</span>
            <span>•</span>
            <span>🔒 Seguro</span>
            <span>•</span>
            <span>🌟 Útil</span>
          </div>
        </div>

        {/* Botones con animación escalonada */}
        <div className="space-y-3">
          <button
            onClick={() => {
              trackEvent('click_compartir', 'LinkedIn')
              window.open('https://www.linkedin.com/shareArticle?mini=true&url=' + encodeURIComponent(window.location.origin), '_blank')
            }}
            className={`w-full bg-[#0A66C2] text-white py-3 rounded-lg font-semibold hover:bg-[#004182] transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 ${
              show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            <span>📱</span> Compartir en LinkedIn
          </button>
          
          <button
            onClick={() => {
              trackEvent('click_compartir', 'WhatsApp')
              window.open(`https://wa.me/?text=${encodeURIComponent('Acabo de compartir mi experiencia en procesos de selección en ' + window.location.origin + ' - Ayuda a hacer el hiring más transparente')}`, '_blank')
            }}
            className={`w-full bg-[#25D366] text-white py-3 rounded-lg font-semibold hover:bg-[#1da851] transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 ${
              show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '500ms' }}
          >
            <span>💬</span> Compartir en WhatsApp
          </button>
          
          <Link href="/">
            <button
              className={`w-full bg-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300 transform hover:scale-105 ${
                show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '600ms' }}
            >
              Volver al inicio
            </button>
          </Link>
        </div>

        {/* Mensaje adicional animado */}
        <p className={`mt-6 text-xs text-gray-400 transition-all duration-700 delay-700 ${
          show ? 'opacity-100' : 'opacity-0'
        }`}>
          🌟 Cada experiencia compartida hace el hiring más justo
        </p>
      </div>

      {/* Estilos CSS para animaciones */}
      <style jsx>{`
        @keyframes bounce-custom {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-bounce-custom {
          animation: bounce-custom 2s ease-in-out infinite;
        }
        
        @keyframes confetti-fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti-fall 3s ease-in forwards;
        }
      `}</style>
    </div>
  )
}