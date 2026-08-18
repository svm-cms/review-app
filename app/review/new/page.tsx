'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Turnstile } from '@marsidev/react-turnstile'
import { supabase } from '@/lib/supabase/client'

// ============================================
// VALIDACIÓN ANTI-TOXICIDAD (FUERA DEL COMPONENTE)
// ============================================

// Lista de palabras prohibidas
const prohibitedWords = [
  'insulto', 'puta', 'cabron', 'gilipollas', 'mierda',
  'joder', 'coño', 'hostia', 'tonto', 'estupido',
  'imbecil', 'subnormal', 'retrasado', 'mongolo',
  'maricon', 'maricón', 'zorra', 'perra', 'cerdo',
  'hijo de puta', 'capullo', 'payaso', 'basura',
  'escoria', 'desgraciado', 'malparido', 'culebra','asco','cabrón', 'puto', 'maldito'
]

// Función para validar texto (definida UNA SOLA VEZ)
const validateText = (text: string): { valid: boolean; message: string } => {
  const lowerText = text.toLowerCase()
  
  for (const word of prohibitedWords) {
    if (lowerText.includes(word)) {
      return {
        valid: false,
        message: `La palabra "${word}" no está permitida. Por favor, sé respetuoso.`
      }
    }
  }
  
  return { valid: true, message: '' }
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function NewReviewPage() {
  const router = useRouter()
  
  const [companySuggestions, setCompanySuggestions] = useState<string[]>([])
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaError, setCaptchaError] = useState(false)
  const [textError, setTextError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    process_type: 'online',
    received_response: true,
    interview_count: 1,
    received_feedback: true,
    process_duration: '<1 semana',
    rating_communication: 3,
    rating_clarity: 3,
    rating_respect: 3,
    would_reapply: true,
    improvement_text: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCompanySearch = async (value: string) => {
    setFormData({...formData, company: value})
    
    if (value.length > 1) {
      const { data } = await supabase
        .from('companies')
        .select('name')
        .ilike('name', `%${value}%`)
        .limit(5)
      
      setCompanySuggestions(data?.map(item => item.name) || [])
    } else {
      setCompanySuggestions([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 1. Validar captcha
    if (!captchaToken) {
      setCaptchaError(true)
      return
    }
    setCaptchaError(false)
    
    // 2. Validar texto anti-toxicidad
    if (formData.improvement_text) {
      const validation = validateText(formData.improvement_text)
      if (!validation.valid) {
        alert(validation.message)
        return
      }
    }
    
    setIsSubmitting(true)

    // 3. Verificar el token con el backend
    try {
      const verification = await fetch('/api/verify-turnstile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: captchaToken })
      })
      
      const verificationData = await verification.json()
      
      if (!verificationData.success) {
        alert('Error de verificación. Por favor, intenta de nuevo.')
        setIsSubmitting(false)
        setCaptchaToken(null)
        return
      }
    } catch (error) {
      alert('Error de conexión. Por favor, intenta de nuevo.')
      setIsSubmitting(false)
      return
    }

    // 4. Normalizar y guardar la review
    const normalizedData = {
      ...formData,
      company: formData.company.charAt(0).toUpperCase() + formData.company.slice(1).toLowerCase()
    }

    const { error } = await supabase
      .from('reviews')
      .insert([normalizedData])

    setIsSubmitting(false)

    if (error) {
      alert('Error al publicar: ' + error.message)
    } else {
      router.push('/review/thanks')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-6">Compartir experiencia</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Empresa con autocomplete */}
          <div className="relative">
            <label className="block text-sm font-medium mb-1">Empresa *</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border rounded-lg"
              value={formData.company}
              onChange={(e) => handleCompanySearch(e.target.value)}
              placeholder="Ej: Glovo, Amazon"
            />
            
            {companySuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10">
                {companySuggestions.map((company) => (
                  <button
                    key={company}
                    type="button"
                    onClick={() => {
                      setFormData({...formData, company})
                      setCompanySuggestions([])
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {company}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Puesto */}
          <div>
            <label className="block text-sm font-medium mb-1">Puesto *</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border rounded-lg"
              value={formData.position}
              onChange={(e) => setFormData({...formData, position: e.target.value})}
              placeholder="Ej: Product Manager"
            />
          </div>

          {/* Tipo de proceso */}
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de proceso</label>
            <select
              className="w-full px-4 py-2 border rounded-lg"
              value={formData.process_type}
              onChange={(e) => setFormData({...formData, process_type: e.target.value as any})}
            >
              <option value="online">Online</option>
              <option value="presencial">Presencial</option>
              <option value="mixto">Mixto</option>
            </select>
          </div>

          {/* Valoraciones */}
          <div className="space-y-2">
            <h3 className="font-medium">Valoración</h3>
            
            <div>
              <label className="text-sm">Comunicación: {formData.rating_communication}★</label>
              <input
                type="range"
                min="1"
                max="5"
                className="w-full"
                value={formData.rating_communication}
                onChange={(e) => setFormData({...formData, rating_communication: parseInt(e.target.value)})}
              />
            </div>

            <div>
              <label className="text-sm">Claridad: {formData.rating_clarity}★</label>
              <input
                type="range"
                min="1"
                max="5"
                className="w-full"
                value={formData.rating_clarity}
                onChange={(e) => setFormData({...formData, rating_clarity: parseInt(e.target.value)})}
              />
            </div>

            <div>
              <label className="text-sm">Respeto: {formData.rating_respect}★</label>
              <input
                type="range"
                min="1"
                max="5"
                className="w-full"
                value={formData.rating_respect}
                onChange={(e) => setFormData({...formData, rating_respect: parseInt(e.target.value)})}
              />
            </div>
          </div>

          {/* Comentario con validación anti-toxicidad */}
          <div>
            <label className="block text-sm font-medium mb-1">
              ¿Algo que mejorarías? (opcional, 200 caracteres)
            </label>
            <textarea
              maxLength={200}
              className={`w-full px-4 py-2 border rounded-lg ${
                textError ? 'border-red-500 bg-red-50' : 'border-gray-300'
              } transition-colors`}
              rows={3}
              value={formData.improvement_text}
              onChange={(e) => {
                const value = e.target.value
                setFormData({...formData, improvement_text: value})
                
                if (value) {
                  const validation = validateText(value)
                  if (!validation.valid) {
                    setTextError(validation.message)
                  } else {
                    setTextError(null)
                  }
                } else {
                  setTextError(null)
                }
              }}
              placeholder="Ej: El proceso fue largo, pero la comunicación fue buena..."
            />
            
            <div className="flex justify-between mt-1">
              <p className={`text-xs ${textError ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                {textError || `${formData.improvement_text.length}/200 caracteres`}
              </p>
              {textError && (
                <p className="text-xs text-red-500">⚠️</p>
              )}
            </div>
          </div>

          {/* Captcha */}
          <div className="flex justify-center my-4">
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
              onSuccess={(token) => {
                setCaptchaToken(token)
                setCaptchaError(false)
              }}
              onError={() => {
                setCaptchaError(true)
              }}
              onExpire={() => {
                setCaptchaToken(null)
                setCaptchaError(true)
              }}
              options={{
                theme: 'light',
                size: 'normal',
              }}
            />
          </div>

          {captchaError && (
            <p className="text-red-500 text-sm text-center">
              Por favor, completa el captcha para continuar
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {isSubmitting ? 'Publicando...' : 'Publicar experiencia'}
          </button>
        </form>
      </div>
    </div>
  )
}