/**
 * NOTIFY via shared PG client. Uses getPg(); no dedicated connection.
 * Channel naming: see shared/prompt/documentation/reference.md.
 */

import { getPg } from "#shared/infra/pg.client.ts";

const SQL_NOTIFY = "SELECT pg_notify($1, $2)";

/**
 * Sends a notification to the given channel. Payload is JSON-serialized.
 */
export async function notify(
  channel: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const sql = await getPg();
  await sql.queryArray(SQL_NOTIFY, [channel, JSON.stringify(payload)]);
}
