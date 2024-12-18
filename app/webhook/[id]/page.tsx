'use client';

import { useEffect, useState } from 'react';
import { WebhookRequest } from '@/app/types/webhook';
import { useParams } from 'next/navigation';

export default function WebhookPage() {
  const [webhooks, setWebhooks] = useState<WebhookRequest[]>([]);
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    const fetchWebhooks = async () => {
      try {
        const response = await fetch(`/api/webhook/${id}`);
        const data = await response.json();
        setWebhooks(data.sort((a: WebhookRequest, b: WebhookRequest) => b.timestamp - a.timestamp));
      } catch (error) {
        console.error('Error fetching webhooks:', error);
      }
    };

    // Fetch inicial
    fetchWebhooks();

    // Polling cada 2 segundos
    const interval = setInterval(fetchWebhooks, 2000);
    return () => clearInterval(interval);
  }, [id]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">
        Webhook Interceptor - {id}
      </h1>
      
      {webhooks.length === 0 ? (
        <p className="text-gray-500">No se han recibido webhooks aún...</p>
      ) : (
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <div
              key={webhook.id}
              className="p-4 border rounded-lg bg-white/5 space-y-2"
            >
              <div className="flex justify-between items-center">
                <span className="font-mono text-sm">
                  {new Date(webhook.timestamp).toLocaleString()}
                </span>
                <span className="px-2 py-1 bg-blue-500 rounded text-white text-sm">
                  {webhook.method}
                </span>
              </div>
              
              <div className="space-y-2">
                <details className="cursor-pointer">
                  <summary className="font-semibold">Headers</summary>
                  <pre className="text-sm bg-black/10 p-2 rounded mt-2 overflow-x-auto">
                    {JSON.stringify(webhook.headers, null, 2)}
                  </pre>
                </details>
                
                <details className="cursor-pointer">
                  <summary className="font-semibold">Body</summary>
                  <pre className="text-sm bg-black/10 p-2 rounded mt-2 overflow-x-auto">
                    {JSON.stringify(webhook.body, null, 2)}
                  </pre>
                </details>
                
                <details className="cursor-pointer">
                  <summary className="font-semibold">Query Params</summary>
                  <pre className="text-sm bg-black/10 p-2 rounded mt-2 overflow-x-auto">
                    {JSON.stringify(webhook.query, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 