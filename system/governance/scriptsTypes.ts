//
// Result types for scripts store (list, read, write).
//

export type ListResult =
  | { ok: true; entries: string[] }
  | { ok: false; status: number; body: string };

export type ReadResult =
  | { ok: true; content: string }
  | { ok: false; status: number; body: string };

export type WriteResult =
  | { ok: true; status: 201 }
  | { ok: false; status: number; body: string };
