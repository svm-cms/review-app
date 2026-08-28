import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl border border-gray-200 p-8">
        <Link href="/" className="text-sky-600 hover:underline mb-6 inline-block">
          ← Volver al inicio
        </Link>

        <h1 className="text-3xl font-bold mb-6">Términos de Servicio</h1>

        <div className="space-y-4 text-gray-700">
          <p>
            Review Hiring es una plataforma para compartir experiencias reales sobre procesos de
            selección, con el objetivo de mejorar la transparencia en el hiring. Al usar este
            sitio, aceptas estos Términos.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6">1. Qué es esto (y qué no es)</h2>
          <p>
            Este sitio recoge experiencias individuales de candidatos sobre el proceso de
            selección de una empresa: comunicación, plazos, feedback recibido. No es un espacio
            para valorar la empresa como lugar de trabajo, salarios o cultura — para eso existen
            otras plataformas.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6">2. Directrices de contenido</h2>
          <p>Al publicar una review, te comprometes a que tu contenido:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Describa hechos verificables de tu propia experiencia (fechas, fases, si hubo respuesta o feedback), no opiniones genéricas sobre la empresa.</li>
            <li>No incluya insultos, difamación ni acusaciones no verificables.</li>
            <li>No identifique a personas físicas concretas (nombres de reclutadores o empleados).</li>
            <li>No incluya información confidencial obtenida durante el proceso (datos de otros candidatos, información interna sensible).</li>
            <li>Corresponda a una experiencia real y reciente tuya como candidato.</li>
          </ul>
          <p>
            Aplicamos un filtro automático de lenguaje ofensivo y limitamos los comentarios a
            texto breve y estructurado — precisamente para mantener el contenido en el terreno de
            los hechos, no de las opiniones sin matizar.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6">3. Verificación y prevención de spam</h2>
          <p>
            Para poder publicar una review pedimos un email, que se convierte en un código
            encriptado antes de guardarse — nunca se publica ni se conserva en texto plano. Su
            único uso es evitar reviews duplicadas o falsas sobre la misma empresa. Más detalle en
            nuestra{' '}
            <Link href="/privacy" className="text-sky-600 hover:underline">
              Política de Privacidad
            </Link>
            .
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6">4. Moderación y retirada de contenido</h2>
          <p>
            Nos reservamos el derecho de retirar cualquier review que incumpla estas directrices,
            sin previo aviso. Si una empresa considera que una review contiene información falsa o
            difamatoria sobre su proceso, puede contactarnos para solicitar su revisión. Actuamos
            de buena fe y de forma proporcionada ante cualquier reclamación fundamentada.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6">5. Responsabilidad</h2>
          <p>
            Las reviews publicadas reflejan la experiencia individual y subjetiva de cada
            candidato. Review Hiring actúa como intermediario que aloja este contenido, no como
            autor de las opiniones publicadas. No garantizamos la exactitud de cada review
            individual, aunque aplicamos las medidas de moderación descritas arriba.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6">6. Cambios en estos Términos</h2>
          <p>
            Podemos actualizar estos Términos según evolucione el servicio. Los cambios
            relevantes se reflejarán en esta página con la fecha de actualización.
          </p>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-500">
            <p>Última actualización: {new Date().toLocaleDateString('es-ES')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
