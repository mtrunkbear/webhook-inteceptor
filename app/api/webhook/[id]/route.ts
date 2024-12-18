import { NextRequest, NextResponse } from "next/server";
import { WebhookRequest } from "@/app/types/webhook";

// Almacenamiento temporal en memoria (para desarrollo)
let webhooks: WebhookRequest[] = [];

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  let body;
  try {
    body = await request.json();
  } catch (e) {
    body = null;
  }

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const webhook: WebhookRequest = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    method: request.method,
    headers,
    body,
    query: Object.fromEntries(request.nextUrl.searchParams),
    path: `/webhook/${id}`,
  };

  webhooks.push(webhook);
  return NextResponse.json({ success: true, webhookId: webhook.id });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const filteredWebhooks = webhooks.filter(w => w.path === `/webhook/${id}`);
  return NextResponse.json(filteredWebhooks);
} 