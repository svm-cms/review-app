import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8">
        <Link href="/" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Volver al inicio
        </Link>
        
        <h1 className="text-3xl font-bold mb-6">Política de Privacidad</h1>
        
        <div className="space-y-4 text-gray-700">
          <p>
            En Review de Procesos de Selección, nos tomamos muy en serio tu privacidad.
            Esta política explica cómo recopilamos, usamos y protegemos tus datos.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6">1. Datos que recopilamos</h2>
          <p>
            Recopilamos la información que proporcionas voluntariamente al dejar una review:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Empresa y puesto al que aplicaste</li>
            <li>Tipo de proceso y experiencia (respuesta, entrevistas, feedback)</li>
            <li>Valoraciones numéricas (1-5 estrellas)</li>
            <li>Comentario opcional (máximo 200 caracteres)</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-6">2. Anonimato</h2>
          <p>
            Todas las reviews son <strong>completamente anónimas</strong>. No recopilamos:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Nombre de usuario</li>
            <li>Correo electrónico</li>
            <li>Dirección IP (anonimizada)</li>
            <li>Información personal identificable</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-6">3. Uso de los datos</h2>
          <p>Los datos se utilizan para:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Mostrar experiencias de procesos de selección</li>
            <li>Calcular estadísticas agregadas (porcentajes, promedios)</li>
            <li>Mejorar la transparencia en el hiring</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-6">4. Cookies</h2>
          <p>
            Esta web utiliza cookies técnicas para el funcionamiento básico.
            No utilizamos cookies de rastreo ni publicitarias.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6">5. Tus derechos</h2>
          <p>
            Puedes solicitar la eliminación de tu review en cualquier momento
            contactándonos a través del formulario de contacto.
          </p>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-500">
            <p>Última actualización: {new Date().toLocaleDateString('es-ES')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}