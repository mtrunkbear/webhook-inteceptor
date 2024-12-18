export interface WebhookRequest {
  id: string;
  timestamp: number;
  method: string;
  headers: Record<string, string>;
  body: unknown;
  query: Record<string, string>;
  path: string;
} 