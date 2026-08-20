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
            Todas las reviews son <strong>anónimas de cara al público</strong>. Nunca mostramos
            tu nombre ni tu email junto a tu experiencia. No recopilamos:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Nombre de usuario</li>
            <li>Dirección IP (anonimizada)</li>
            <li>Información personal identificable visible públicamente</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-6">3. Sobre el email que pedimos</h2>
          <p>
            Al publicar una review te pedimos un email, con tu consentimiento explícito, única y
            exclusivamente para evitar spam y reviews duplicadas o falsas sobre la misma empresa.
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Tu email se convierte en un código encriptado (hash) en tu propio navegador antes
              de enviarse — nunca guardamos el email en texto plano, ni siquiera nosotros podemos
              leerlo.
            </li>
            <li>Ese código se guarda en una tabla separada de las reviews públicas, nunca junto a tu opinión.</li>
            <li>No se usa para marketing, no se comparte con terceros y no se vende.</li>
            <li>
              Puedes solicitar en cualquier momento que eliminemos ese registro escribiéndonos —
              esto no afecta a la review pública, que permanece anónima.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-6">4. Uso de los datos</h2>
          <p>Los datos se utilizan para:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Mostrar experiencias de procesos de selección</li>
            <li>Calcular estadísticas agregadas (porcentajes, promedios)</li>
            <li>Prevenir spam y reviews duplicadas (mediante el email encriptado)</li>
            <li>Mejorar la transparencia en el hiring</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900 mt-6">5. Cookies</h2>
          <p>
            Esta web utiliza cookies técnicas para el funcionamiento básico.
            No utilizamos cookies de rastreo ni publicitarias.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6">6. Tus derechos</h2>
          <p>
            Puedes solicitar la eliminación de tu review o del registro de verificación asociado
            en cualquier momento contactándonos a través del formulario de contacto.
          </p>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-500">
            <p>Última actualización: {new Date().toLocaleDateString('es-ES')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}