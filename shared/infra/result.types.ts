/**
 * Result type for create-style operations. Services return this instead of
 * throwing; endpoints map to HTTP response in 2 statements (no try/catch).
 */

export type CreateResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number };
