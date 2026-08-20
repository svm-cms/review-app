'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Branding */}
          <Link href="/" className="flex items-center gap-2 group">
        
            <span className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition">
              Review Hiring
            </span>
            <span className="hidden sm:inline text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              Beta
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition ${
                isActive('/') 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Inicio
            </Link>
            <Link
              href="/review/new"
              className={`text-sm font-medium transition ${
                isActive('/review/new') 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Compartir experiencia
            </Link>
            <Link
              href="/ranking"
              className={`text-sm font-medium transition ${
                isActive('/ranking')
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Ranking
            </Link>
            <Link
              href="/privacy"
              className={`text-sm font-medium transition ${
                isActive('/privacy') 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Privacidad
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            aria-label="Menú"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`block h-0.5 bg-gray-600 transition-all duration-300 ${
                isMenuOpen ? 'rotate-45 translate-y-2' : ''
              }`} />
              <span className={`block h-0.5 bg-gray-600 transition-all duration-300 ${
                isMenuOpen ? 'opacity-0' : ''
              }`} />
              <span className={`block h-0.5 bg-gray-600 transition-all duration-300 ${
                isMenuOpen ? '-rotate-45 -translate-y-2' : ''
              }`} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${
          isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <nav className="py-4 border-t border-gray-100 flex flex-col gap-3">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className={`text-sm font-medium px-2 py-2 rounded-lg transition ${
                isActive('/') 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Inicio
            </Link>
            <Link
              href="/review/new"
              onClick={() => setIsMenuOpen(false)}
              className={`text-sm font-medium px-2 py-2 rounded-lg transition ${
                isActive('/review/new') 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Compartir experiencia
            </Link>
            <Link
              href="/ranking"
              onClick={() => setIsMenuOpen(false)}
              className={`text-sm font-medium px-2 py-2 rounded-lg transition ${
                isActive('/ranking')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Ranking
            </Link>
            <Link
              href="/privacy"
              onClick={() => setIsMenuOpen(false)}
              className={`text-sm font-medium px-2 py-2 rounded-lg transition ${
                isActive('/privacy') 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Privacidad
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}