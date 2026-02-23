/**
 * Shared PostgreSQL single client. Connection from env; getPg() and withTx.
 * No business logic; domain stores use getPg() or withTx as needed.
 */

import { Client } from "@db/postgres";
import type { Sql, WithTxFn } from "#shared/infra/pg.types.ts";

function connectionConfig(): string | Record<string, unknown> {
  const url = Deno.env.get("DATABASE_URL");
  if (url) return url;
  return {
    hostname: Deno.env.get("PGHOST") ?? "127.0.0.1",
    port: parseInt(Deno.env.get("PGPORT") ?? "5432", 10),
    user: Deno.env.get("PGUSER") ?? "postgres",
    password: Deno.env.get("PGPASSWORD") ?? "",
    database: Deno.env.get("PGDATABASE") ?? "postgres",
  };
}

/** Same config as getPg(); for dedicated connections (e.g. LISTEN). */
export function getPgConnectionConfig(): string | Record<string, unknown> {
  const config = connectionConfig();
  return config;
}

let pgPromise: Promise<Sql> | null = null;

export function getPg(): Promise<Sql> {
  if (!pgPromise) {
    const client = new Client(connectionConfig());
    pgPromise = client.connect().then(() => client);
  }
  return pgPromise;
}

/** Close the shared client and reset. For test teardown only. */
export async function closePg(): Promise<void> {
  if (pgPromise) {
    const client = await pgPromise;
    await client.end();
    pgPromise = null;
  }
}

export async function withTx<T>(fn: WithTxFn<T>): Promise<T> {
  const sql = await getPg();
  await sql.queryArray("BEGIN");
  try {
    const out = await fn(sql);
    await sql.queryArray("COMMIT");
    return out;
  } catch (e) {
    await sql.queryArray("ROLLBACK");
    throw e;
  }
}
