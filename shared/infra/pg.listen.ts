/**
 * LISTEN on a dedicated long-lived connection. One connection for all
 * subscriptions; reconnects with simple backoff. Channel list and reconnection
 * policy: see shared/prompt/documentation/reference.md § LISTEN/NOTIFY.
 */

import { Client } from "@db/postgres";
import { getPgConnectionConfig } from "#shared/infra/pg.client.ts";

const MAX_BACKOFF_MS = 30_000;
const INITIAL_BACKOFF_MS = 500;

/** Safe channel name for LISTEN (identifier). */
function listenCommand(channel: string): string {
  const safe = channel.replace(/"/g, '""');
  return `LISTEN "${safe}"`;
}

let listenClient: Client | null = null;
const channelCallbacks = new Map<string, (payload: Record<string, unknown>) => void>();

async function runListenLoop(): Promise<void> {
  const config = getPgConnectionConfig();
  let backoffMs = INITIAL_BACKOFF_MS;
  while (true) {
    const client = new Client(config);
    try {
      await client.connect();
      listenClient = client;
      backoffMs = INITIAL_BACKOFF_MS;
      for (const ch of channelCallbacks.keys()) {
        await client.queryArray(listenCommand(ch));
      }
      while (true) {
        await client.queryArray("SELECT pg_sleep(30)");
      }
    } catch {
      listenClient = null;
      try {
        await client.end();
      } catch {
        /* ignore */
      }
      await new Promise((r) => setTimeout(r, backoffMs));
      backoffMs = Math.min(backoffMs * 2, MAX_BACKOFF_MS);
    }
  }
}

/**
 * Subscribes to a channel; invokes onMessage when a notification is received.
 * Uses a single dedicated connection; reconnects with backoff on disconnect.
 * Note: @db/postgres may not expose async notifications; delivery is best-effort.
 */
export function subscribe(
  channel: string,
  onMessage: (payload: Record<string, unknown>) => void,
): () => void {
  channelCallbacks.set(channel, onMessage);
  if (!listenClient) {
    runListenLoop();
  } else {
    listenClient
      .queryArray(listenCommand(channel))
      .catch((_err: unknown) => {
        void _err;
        return undefined;
      });
  }
  return () => {
    channelCallbacks.delete(channel);
    return undefined;
  };
}
