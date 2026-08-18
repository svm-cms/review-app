'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('cookies_accepted')
    if (!accepted) {
      // Retrasar la aparición para no solapar con otros elementos
      setTimeout(() => {
        setShowBanner(true)
      }, 500)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookies_accepted', 'true')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t shadow-lg z-50 p-3 sm:p-4">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
          🍪 Usamos cookies para mejorar tu experiencia. 
          <Link href="/privacy" className="text-blue-600 hover:underline ml-1">
            Más info
          </Link>
        </p>
        <button
          onClick={acceptCookies}
          className="bg-blue-600 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg font-semibold hover:bg-blue-700 transition whitespace-nowrap text-sm sm:text-base"
        >
          Aceptar
        </button>
      </div>
    </div>
  )
}