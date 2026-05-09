import type { QueryResultRow } from 'pg';
import { query } from '../lib/db.js';

export type StoredWebhookEvent = {
  provider: string;
  externalEventId: string;
  eventType: string;
  payload: unknown;
};

type WebhookInsertRow = QueryResultRow & {
  id: string;
  created_at: string;
};

export async function storeWebhookEvent(event: StoredWebhookEvent) {
  const result = await query<WebhookInsertRow>(
    `INSERT INTO webhook_events (provider, external_event_id, event_type, payload)
     VALUES ($1, $2, $3, $4::jsonb)
     ON CONFLICT (provider, external_event_id) DO NOTHING
     RETURNING id, created_at`,
    [event.provider, event.externalEventId, event.eventType, JSON.stringify(event.payload)]
  );

  if (result.rowCount && result.rowCount > 0) {
    const row = result.rows[0];

    if (!row) {
      return {
        inserted: false,
        duplicate: true
      };
    }

    return {
      inserted: true,
      id: row.id,
      createdAt: row.created_at
    };
  }

  return {
    inserted: false,
    duplicate: true
  };
}
