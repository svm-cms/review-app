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
    <div>
      <label className="text-sm block mb-1">
        {label}: {value}★
      </label>
      <div className="flex gap-1" onMouseLeave={() => setHoverValue(null)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoverValue(star)}
            aria-label={`${label}: ${star} de 5 estrellas`}
            className="text-3xl leading-none transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
          >
            <span className={star <= displayValue ? 'text-yellow-400' : 'text-gray-300'}>★</span>
          </button>
        ))}
      </div>
    </div>
  )
}
