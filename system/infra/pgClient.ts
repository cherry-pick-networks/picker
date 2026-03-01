//
// Postgres client. Single instance for all domains. Domain stores use this.
//

import { Client } from '@db/postgres';

let pgPromise: Promise<Client> | null = null;

function getConfig(): string | Record<string, unknown> {
  const url = Deno.env.get('DATABASE_URL');
  if (url) return url;
  return {
    hostname: Deno.env.get('PG_HOST') ?? '127.0.0.1',
    port: parseInt(Deno.env.get('PG_PORT') ?? '5432', 10),
    user: Deno.env.get('PG_USER') ?? 'postgres',
    password: Deno.env.get('PG_PASSWORD') ?? '',
    database: Deno.env.get('PG_DATABASE') ?? 'picker',
  };
}

export async function getPg(): Promise<Client> {
  if (!pgPromise) {
    const client = new Client(getConfig());
    await client.connect();
    pgPromise = Promise.resolve(client);
  }
  return pgPromise;
}
