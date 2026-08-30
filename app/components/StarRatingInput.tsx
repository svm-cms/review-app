'use client'

import { useState } from 'react'

interface StarRatingInputProps {
  label: string
  value: number
  onChange: (value: number) => void
}

// Input de valoración por estrellas clicables (escala 1-5), con vista previa
// al pasar el ratón. Sustituye a las barras deslizantes anteriores — misma
// escala de datos (1-5), solo cambia cómo se interactúa con ella.
export default function StarRatingInput({ label, value, onChange }: StarRatingInputProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)
  const displayValue = hoverValue ?? value

  return (
    <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
      <label className="text-sm text-center sm:text-left">{label}</label>
      <div className="flex gap-1 justify-center" onMouseLeave={() => setHoverValue(null)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoverValue(star)}
            aria-label={`${label}: ${star} de 5 estrellas`}
            className="text-3xl leading-none transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-sky-400 rounded"
          >
            <span className={star <= displayValue ? 'text-yellow-400' : 'text-gray-300'}>★</span>
          </button>
        ))}
      </div>
    </div>
  )
}
