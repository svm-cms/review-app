'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Turnstile } from '@marsidev/react-turnstile'
import { supabase } from '@/lib/supabase/client'
import { resolveCanonicalCompanyName } from '@/lib/companies'
import { hashEmail, isValidEmailFormat } from '@/lib/emailHash'
import { checkSpamCooldown, recordVerification } from '@/lib/antiSpam'
import StarRatingInput from '@/app/components/StarRatingInput'

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
// Usa límites de palabra (\b) en vez de "includes" para evitar falsos positivos
// como bloquear "fiasco" por contener la subcadena "asco".
const validateText = (text: string): { valid: boolean; message: string } => {
  const lowerText = text.toLowerCase()

  for (const word of prohibitedWords) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`\\b${escaped}\\b`, 'i')
    if (regex.test(lowerText)) {
      return {
        valid: false,
        message: 'Ese comentario incluye lenguaje no permitido. Por favor, sé respetuoso.'
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
  const [email, setEmail] = useState('')
  const [emailConsent, setEmailConsent] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    process_type: 'online',
    received_response: null as boolean | null,
    interview_count: null as number | null,
    received_feedback: null as boolean | null,
    process_duration: null as string | null,
    rating_communication: 3,
    rating_clarity: 3,
    rating_respect: 3,
    would_reapply: null as boolean | null,
    improvement_text: ''
  })
  const [formError, setFormError] = useState<string | null>(null)
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

    // 0. Validar que todos los campos estructurados obligatorios tengan respuesta explícita
    setFormError(null)
    setEmailError(null)

    if (!isValidEmailFormat(email)) {
      setEmailError('Introduce un email válido. Solo se usa para evitar spam, nunca se publica.')
      return
    }

    if (!emailConsent) {
      setEmailError('Necesitamos tu consentimiento para usar el email únicamente contra el spam.')
      return
    }

    if (
      formData.received_response === null ||
      formData.interview_count === null ||
      formData.received_feedback === null ||
      formData.process_duration === null ||
      formData.would_reapply === null
    ) {
      setFormError('Por favor, responde a todas las preguntas antes de publicar.')
      return
    }

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

    // 4. Resolver el nombre canónico de la empresa (evita duplicados por
    //    espacios o mayúsculas/minúsculas)
    let canonicalCompany: string
    try {
      canonicalCompany = await resolveCanonicalCompanyName(formData.company)
    } catch (err) {
      console.error('Error resolviendo nombre de empresa:', err)
      canonicalCompany = formData.company.trim()
    }

    // 5. Hash del email (nunca se guarda en texto plano) y comprobación
    //    anti-spam: ¿este email ya reseñó esta empresa recientemente?
    const emailHashValue = await hashEmail(email)
    const spamCheck = await checkSpamCooldown(emailHashValue, canonicalCompany)

    if (spamCheck.blocked) {
      setEmailError(spamCheck.reason || 'No se puede publicar esta review.')
      setIsSubmitting(false)
      return
    }

    // 6. Guardar la review (nunca incluye el email)
    const normalizedData = {
      ...formData,
      company: canonicalCompany
    }

    const { data: insertedReview, error } = await supabase
      .from('reviews')
      .insert([normalizedData])
      .select('id')
      .single()

    // 7. Registrar la verificación (solo el hash) en su propia tabla,
    //    separada de la review pública
    if (!error && insertedReview) {
      await recordVerification(insertedReview.id, canonicalCompany, emailHashValue)
    }

    setIsSubmitting(false)

    if (error) {
      alert('Error al publicar: ' + error.message)
    } else {
      router.push('/review/thanks')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 p-6">
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

          {/* Respuesta a la candidatura */}
          <div>
            <label className="block text-sm font-medium mb-1">¿Recibiste respuesta a tu candidatura? *</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, received_response: true })}
                className={`flex-1 py-2 rounded-lg border font-medium transition ${
                  formData.received_response === true
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                Sí
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, received_response: false, received_feedback: false })}
                className={`flex-1 py-2 rounded-lg border font-medium transition ${
                  formData.received_response === false
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Número de entrevistas */}
          <div>
            <label className="block text-sm font-medium mb-1">¿Cuántas entrevistas tuviste? *</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setFormData({ ...formData, interview_count: n })}
                  className={`flex-1 py-2 rounded-lg border font-medium transition ${
                    formData.interview_count === n
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {n === 4 ? '4+' : n}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback final */}
          <div>
            <label className="block text-sm font-medium mb-1">
              ¿Recibiste feedback final (te dijeron si seguías o no en el proceso)? *
            </label>
            {formData.received_response === false ? (
              <p className="text-sm text-gray-500 italic">
                Marcado automáticamente como "No" — no puede haber feedback si no hubo respuesta.
              </p>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, received_feedback: true })}
                  className={`flex-1 py-2 rounded-lg border font-medium transition ${
                    formData.received_feedback === true
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, received_feedback: false })}
                  className={`flex-1 py-2 rounded-lg border font-medium transition ${
                    formData.received_feedback === false
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  No
                </button>
              </div>
            )}
          </div>

          {/* Duración del proceso */}
          <div>
            <label className="block text-sm font-medium mb-1">¿Cuánto duró el proceso? *</label>
            <select
              className="w-full px-4 py-2 border rounded-lg"
              value={formData.process_duration ?? ''}
              onChange={(e) => setFormData({ ...formData, process_duration: e.target.value })}
            >
              <option value="" disabled>Selecciona una duración</option>
              <option value="<1 semana">Menos de 1 semana</option>
              <option value="1-2 semanas">1-2 semanas</option>
              <option value="2-4 semanas">2-4 semanas</option>
              <option value="+1 mes">Más de 1 mes</option>
            </select>
          </div>

          {/* Volvería a aplicar */}
          <div>
            <label className="block text-sm font-medium mb-1">¿Volverías a aplicar a esta empresa? *</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, would_reapply: true })}
                className={`flex-1 py-2 rounded-lg border font-medium transition ${
                  formData.would_reapply === true
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                Sí
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, would_reapply: false })}
                className={`flex-1 py-2 rounded-lg border font-medium transition ${
                  formData.would_reapply === false
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Valoraciones */}
          <div className="space-y-4">
            <h3 className="font-medium">Valoración</h3>

            <StarRatingInput
              label="Comunicación"
              value={formData.rating_communication}
              onChange={(v) => setFormData({ ...formData, rating_communication: v })}
            />

            <StarRatingInput
              label="Claridad durante el proceso"
              value={formData.rating_clarity}
              onChange={(v) => setFormData({ ...formData, rating_clarity: v })}
            />

            <StarRatingInput
              label="Trato recibido"
              value={formData.rating_respect}
              onChange={(v) => setFormData({ ...formData, rating_respect: v })}
            />
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

          {/* Email — privado, solo anti-spam, nunca se publica */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium mb-1">Tu email *</label>
            <input
              type="email"
              className={`w-full px-4 py-2 border rounded-lg ${
                emailError ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setEmailError(null)
              }}
            />
            <p className="text-xs text-gray-500 mt-1">
              Nunca se muestra públicamente. Solo se usa, de forma encriptada, para evitar
              reviews duplicadas o falsas de la misma empresa.
            </p>

            <label className="flex items-start gap-2 mt-3 text-sm text-gray-700">
              <input
                type="checkbox"
                className="mt-1"
                checked={emailConsent}
                onChange={(e) => {
                  setEmailConsent(e.target.checked)
                  setEmailError(null)
                }}
              />
              <span>
                Acepto que mi email se use exclusivamente para prevenir spam, tal y como se
                describe en la{' '}
                <a href="/privacy" target="_blank" className="text-sky-600 hover:underline">
                  Política de Privacidad
                </a>
                . No se publicará ni se compartirá con nadie. *
              </span>
            </label>

            {emailError && (
              <p className="text-red-500 text-sm mt-2 font-medium">{emailError}</p>
            )}
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

          {formError && (
            <p className="text-red-500 text-sm text-center font-medium">
              {formError}
            </p>
          )}

          <p className="text-xs text-gray-500 text-center">
            Al publicar, aceptas nuestros{' '}
            <a href="/terms" target="_blank" className="text-sky-600 hover:underline">
              Términos de Servicio
            </a>
            . Solo hechos verificables — nada de insultos ni acusaciones.
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-sky-600 text-white py-3 rounded-lg font-semibold hover:bg-sky-700 disabled:opacity-50 transition"
          >
            {isSubmitting ? 'Publicando...' : 'Publicar experiencia'}
          </button>
        </form>
      </div>
    </div>
  )
}