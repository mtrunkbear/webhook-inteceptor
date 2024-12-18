import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <main className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Webhook Interceptor</h1>
        
        <div className="space-y-4">
          <p>
            Para usar el interceptor de webhooks:
          </p>
          
          <ol className="list-decimal list-inside space-y-2">
            <li>
              Crea un nuevo endpoint visitando{' '}
              <code className="px-2 py-1 bg-gray-100 rounded">
                /webhook/[id]
              </code>
              {' '}con cualquier ID que desees
            </li>
            <li>
              Envía peticiones POST a{' '}
              <code className="px-2 py-1 bg-gray-100 rounded">
                /api/webhook/[id]
              </code>
            </li>
            <li>
              Visualiza las peticiones en tiempo real en la página del webhook
            </li>
          </ol>
        </div>
      </main>
    </div>
  );
}
