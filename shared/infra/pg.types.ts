/**
 * PostgreSQL client types. Sql = single client for queries; withTx runs
 * fn inside a transaction (BEGIN/COMMIT/ROLLBACK).
 */

import type { Client } from "@db/postgres";

export type Sql = Client;

export type DbClient = Sql;

export type WithTxFn<T> = (sql: Sql) => Promise<T>;
