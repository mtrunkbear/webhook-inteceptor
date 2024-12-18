'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [webhookId, setWebhookId] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (webhookId.trim()) {
      router.push(`/webhook/${webhookId}`);
    }
  };

  const handleRandomId = () => {
    const randomId = Math.random().toString(36).substring(2, 10);
    setWebhookId(randomId);
  };

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Webhook Interceptor</h1>
        
        <div className="space-y-8">
          <div className="bg-white/10 p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Crear nuevo endpoint</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="webhookId" className="block text-sm font-medium mb-2">
                  ID del Webhook
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="webhookId"
                    value={webhookId}
                    onChange={(e) => setWebhookId(e.target.value)}
                    placeholder="Ingresa un ID o genera uno aleatorio"
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleRandomId}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Generar
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={!webhookId.trim()}
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
              >
                Crear Endpoint
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Instrucciones</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Ingresa un ID personalizado o genera uno aleatorio
              </li>
              <li>
                Tu endpoint estará disponible en:{' '}
                <code className="px-2 py-1 bg-gray-100 rounded">
                  /api/webhook/{webhookId || '[id]'}
                </code>
              </li>
              <li>
                Envía peticiones POST a ese endpoint
              </li>
              <li>
                Visualiza las peticiones en tiempo real en la página del webhook
              </li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}
