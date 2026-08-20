import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase/client'
import { calculateCompanyStats } from '@/lib/scoring'
import CompanyProfileClient from './CompanyProfileClient'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Genera un <title> y <meta description> únicos por empresa, con el
// score y el nº de experiencias cuando ya hay datos suficientes — esto es
// lo que permite que "Amazon reseñas proceso de selección" indexe como
// resultado propio en Google, en vez de compartir el título genérico del
// sitio en todas las fichas de empresa.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const companyName = decodeURIComponent(slug)

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .ilike('company', companyName)

  const stats = reviews && reviews.length > 0 ? calculateCompanyStats(reviews) : null

  const title = `${companyName}: opiniones sobre su proceso de selección`

  const description =
    stats && stats.score !== null
      ? `${companyName} tiene un score de proceso de ${stats.score}/100 según ${stats.totalReviews} experiencias reales de candidatos: ${stats.responseRate}% recibió respuesta, ${stats.feedbackRate}% recibió feedback final.`
      : `Descubre cómo es realmente el proceso de selección en ${companyName}: tiempos de respuesta, feedback y experiencias reales de candidatos.`

  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
  }
}

export default async function CompanyPage({ params }: PageProps) {
  const { slug } = await params
  const companyName = decodeURIComponent(slug)

  return <CompanyProfileClient companyName={companyName} />
}
