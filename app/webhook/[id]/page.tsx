'use client';

import { useEffect, useState, useRef } from 'react';
import { WebhookRequest } from '@/app/types/webhook';
import { useParams } from 'next/navigation';
import { IndexedDBService } from '@/app/services/indexedDB';

export default function WebhookPage() {
  const [webhooks, setWebhooks] = useState<WebhookRequest[]>([]);
  const [endpointUrl, setEndpointUrl] = useState<string>('');
  const params = useParams();
  const id = params.id as string;
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookRequest | null>(null);
  const dbService = useRef(new IndexedDBService());
  const [expandedSections, setExpandedSections] = useState({
    headers: true,
    body: true,
    query: true
  });

  useEffect(() => {
    // Establecer la URL del endpoint después del montaje del componente
    setEndpointUrl(`${window.location.origin}/api/webhook/${id}`);
  }, [id]);

  useEffect(() => {
    const loadStoredWebhooks = async () => {
      try {
        const storedWebhooks = await dbService.current.getWebhooks(id);
        if (storedWebhooks.length > 0) {
          setWebhooks(storedWebhooks.sort((a, b) => b.timestamp - a.timestamp));
        }
      } catch (error) {
        console.error('Error loading stored webhooks:', error);
      }
    };

    const fetchWebhooks = async () => {
      try {
        const response = await fetch(`/api/webhook/${id}`);
        const data = await response.json();
        const sortedData = data.sort((a: WebhookRequest, b: WebhookRequest) => 
          b.timestamp - a.timestamp
        );
        
        // Solo actualizar si hay datos nuevos
        if (sortedData.length > 0) {
          setWebhooks(prevWebhooks => {
            // Combinar webhooks existentes con nuevos y eliminar duplicados
            const combined = [...prevWebhooks, ...sortedData];
            const unique = Array.from(new Map(combined.map(hook => [hook.id, hook])).values());
            return unique.sort((a, b) => b.timestamp - a.timestamp);
          });
          
          // Guardar en IndexedDB
          await dbService.current.saveWebhooks(id, sortedData);
        }
      } catch (error) {
        console.error('Error fetching webhooks:', error);
      }
    };

    // Cargar webhooks almacenados primero
    loadStoredWebhooks();

    // Fetch inicial
    fetchWebhooks();

    // Polling cada 2 segundos
    const interval = setInterval(fetchWebhooks, 2000);
    return () => clearInterval(interval);
  }, [id]);

  const toggleSection = (section: 'headers' | 'body' | 'query') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="p-8 h-screen">
      <div className="mb-6 space-y-4">
        <h1 className="text-2xl font-bold">
          Webhook Interceptor - {id}
        </h1>
        
        <div className="flex items-center gap-3 p-4 bg-white/10 rounded-lg border">
          <div className="flex-1">
            <div className="text-sm text-gray-500 mb-1">Endpoint URL:</div>
            <code className="text-sm font-mono break-all">
              {endpointUrl}
            </code>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(endpointUrl)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" 
              />
            </svg>
            Copiar URL
          </button>
        </div>
      </div>

      {webhooks.length === 0 ? (
        <p className="text-gray-500">No se han recibido webhooks aún...</p>
      ) : (
        <div className="flex gap-6 h-[calc(100vh-120px)]">
          {/* Panel izquierdo - Lista de webhooks */}
          <div className="w-1/3 overflow-y-auto border rounded-lg p-4">
            {webhooks.map((webhook) => (
              <div
                key={webhook.id}
                className="p-3 border rounded-lg mb-2 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => setSelectedWebhook(webhook)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm">
                    {new Date(webhook.timestamp).toLocaleString()}
                  </span>
                  <span className="px-2 py-1 bg-blue-500 rounded text-white text-xs">
                    {webhook.method}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Panel derecho - Detalles del webhook */}
          <div className="w-2/3 border rounded-lg p-4 overflow-y-auto">
            {selectedWebhook ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-mono text-lg">
                    {new Date(selectedWebhook.timestamp).toLocaleString()}
                  </span>
                  <span className="px-3 py-1 bg-blue-500 rounded text-white">
                    {selectedWebhook.method}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleSection('headers')}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {expandedSections.headers ? '▼' : '▶'}
                        </button>
                        <h2 className="font-semibold">Headers</h2>
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(JSON.stringify(selectedWebhook.headers, null, 2))}
                        className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
                      >
                        Copiar Headers
                      </button>
                    </div>
                    {expandedSections.headers && (
                      <pre className="text-sm bg-black/10 p-4 rounded overflow-x-auto">
                        {JSON.stringify(selectedWebhook.headers, null, 2)}
                      </pre>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleSection('body')}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {expandedSections.body ? '▼' : '▶'}
                        </button>
                        <h2 className="font-semibold">Body</h2>
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(JSON.stringify(selectedWebhook.body, null, 2))}
                        className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
                      >
                        Copiar Body
                      </button>
                    </div>
                    {expandedSections.body && (
                      <pre className="text-sm bg-black/10 p-4 rounded overflow-x-auto">
                        {JSON.stringify(selectedWebhook.body, null, 2)}
                      </pre>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleSection('query')}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {expandedSections.query ? '▼' : '▶'}
                        </button>
                        <h2 className="font-semibold">Query Params</h2>
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(JSON.stringify(selectedWebhook.query, null, 2))}
                        className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
                      >
                        Copiar Query
                      </button>
                    </div>
                    {expandedSections.query && (
                      <pre className="text-sm bg-black/10 p-4 rounded overflow-x-auto">
                        {JSON.stringify(selectedWebhook.query, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Selecciona un webhook para ver sus detalles
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 