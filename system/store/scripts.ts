/**
 * Read access to ops/scripts/. All access is gated by Governance (system/validator).
 */

import { verifyGovernance } from "../validator/index.ts";

const OPS_SCRIPTS = "ops/scripts";

export type ListResult =
  | { ok: true; entries: string[] }
  | { ok: false; status: number; body: string };

export type ReadResult =
  | { ok: true; content: string }
  | { ok: false; status: number; body: string };

async function listDir(path: string): Promise<string[]> {
  const names: string[] = [];
  for await (const e of Deno.readDir(path)) {
    if (e.name.startsWith(".")) continue;
    names.push(e.isFile ? e.name : `${e.name}/`);
  }
  return names.sort();
}

/**
 * List entries in ops/scripts/. Governance-verified.
 */
export async function listScripts(): Promise<ListResult> {
  const result = verifyGovernance("read", "");
  if (!result.allowed) {
    return { ok: false, status: 403, body: result.reason };
  }
  try {
    const entries = await listDir(OPS_SCRIPTS);
    return { ok: true, entries };
  } catch (e) {
    return {
      ok: false,
      status: 500,
      body: e instanceof Error ? e.message : "list failed",
    };
  }
}

/**
 * Read one file under ops/scripts/ by relative path. Governance-verified.
 */
export async function readScript(relativePath: string): Promise<ReadResult> {
  const result = verifyGovernance("read", relativePath);
  if (!result.allowed) {
    return { ok: false, status: 403, body: result.reason };
  }
  const fullPath = `${OPS_SCRIPTS}/${relativePath}`;
  try {
    const content = await Deno.readTextFile(fullPath);
    return { ok: true, content };
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      return { ok: false, status: 404, body: "Not found" };
    }
    return {
      ok: false,
      status: 500,
      body: e instanceof Error ? e.message : "read failed",
    };
  }
}
