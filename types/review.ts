export type ProcessType = 'online' | 'presencial' | 'mixto'
export type DurationType = '<1 semana' | '1-2 semanas' | '2-4 semanas' | '+1 mes'

export interface ReviewFormData {
  company: string
  position: string
  process_type: ProcessType
  received_response: boolean
  interview_count: 1 | 2 | 3 | 4
  received_feedback: boolean
  process_duration: DurationType
  rating_communication: number
  rating_clarity: number
  rating_respect: number
  would_reapply: boolean
  improvement_text: string
}