/**
 * Read access to shared/runtime/store/. All access is gated by Governance
 * (system/validator).
 */

import { verifyGovernance } from "../validator/index.ts";
import type { ListResult, ReadResult, WriteResult } from "./scripts-types.ts";

export type { ListResult, ReadResult, WriteResult } from "./scripts-types.ts";

// deno-lint-ignore function-length/function-length
function getScriptsBase(): string {
  return Deno.env.get("SCRIPTS_BASE") ?? "shared/runtime/store";
}

async function listDir(path: string): Promise<string[]> {
  const names: string[] = [];
  for await (const e of Deno.readDir(path)) {
    if (e.name.startsWith(".")) continue;
    names.push(e.isFile ? e.name : `${e.name}/`);
  }
  return names.sort();
}

/** List entries in shared/runtime/store/. Governance-verified. */
export async function listScripts(): Promise<ListResult> {
  const result = verifyGovernance("read", "");
  if (!result.allowed) {
    return { ok: false, status: 403, body: result.reason };
  }
  try {
    const entries = await listDir(getScriptsBase());
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
 * Read one file under shared/runtime/store/ by path. Governance-verified.
 */
export async function readScript(relativePath: string): Promise<ReadResult> {
  const result = verifyGovernance("read", relativePath);
  if (!result.allowed) {
    return { ok: false, status: 403, body: result.reason };
  }
  const fullPath = `${getScriptsBase()}/${relativePath}`;
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

/**
 * Write one file under shared/runtime/store/. Governance-verified.
 * Creates parent dirs under shared/runtime/store/ if needed.
 */
export async function writeScript(
  relativePath: string,
  content: string,
): Promise<WriteResult> {
  const result = verifyGovernance("write", relativePath);
  if (!result.allowed) {
    return { ok: false, status: 403, body: result.reason };
  }
  const fullPath = `${getScriptsBase()}/${relativePath}`;
  try {
    const dir = fullPath.slice(0, fullPath.lastIndexOf("/"));
    if (dir) await Deno.mkdir(dir, { recursive: true });
    await Deno.writeTextFile(fullPath, content, { create: true });
    return { ok: true, status: 201 };
  } catch (e) {
    return {
      ok: false,
      status: 500,
      body: e instanceof Error ? e.message : "write failed",
    };
  }
}
