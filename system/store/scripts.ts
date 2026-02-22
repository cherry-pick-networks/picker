/**
 * Read access to shared/runtime/store/. All access is gated by Governance
 * (system/validator).
 */

import { verifyGovernance } from "../validator/index.ts";
import type { ListResult, ReadResult, WriteResult } from "./scripts-types.ts";

export type { ListResult, ReadResult, WriteResult } from "./scripts-types.ts";

function getScriptsBase(): string {
  const base = Deno.env.get("SCRIPTS_BASE") ?? "shared/runtime/store";
  return base;
}

function pushEntry(names: string[], e: Deno.DirEntry): void {
  if (e.name.startsWith(".")) return;
  names.push(e.isFile ? e.name : `${e.name}/`);
}

async function listDir(path: string): Promise<string[]> {
  const names: string[] = [];
  for await (const e of Deno.readDir(path)) pushEntry(names, e);
  return names.sort();
}

function toListError(e: unknown): ListResult {
  const body = e instanceof Error ? e.message : "list failed";
  return { ok: false, status: 500, body };
}

async function doListEntries(): Promise<ListResult> {
  const entries = await listDir(getScriptsBase());
  return { ok: true, entries };
}

async function listScriptsAllowed(): Promise<ListResult> {
  try { return await doListEntries(); }
  catch (e) { return toListError(e); }
}

/** List entries in shared/runtime/store/. Governance-verified. */
export async function listScripts(): Promise<ListResult> {
  const result = verifyGovernance("read", "");
  if (!result.allowed) return { ok: false, status: 403, body: result.reason };
  return await listScriptsAllowed();
}

function readScriptCatch(e: unknown): ReadResult {
  if (e instanceof Deno.errors.NotFound)
    return { ok: false, status: 404, body: "Not found" };
  const body = e instanceof Error ? e.message : "read failed";
  return { ok: false, status: 500, body };
}

async function readFileContent(fullPath: string): Promise<ReadResult> {
  try { return { ok: true, content: await Deno.readTextFile(fullPath) }; }
  catch (e) { return readScriptCatch(e); }
}

async function readScriptAllowed(relativePath: string): Promise<ReadResult> {
  const fullPath = `${getScriptsBase()}/${relativePath}`;
  return await readFileContent(fullPath);
}

/**
 * Read one file under shared/runtime/store/ by path. Governance-verified.
 */
export async function readScript(relativePath: string): Promise<ReadResult> {
  const result = verifyGovernance("read", relativePath);
  if (!result.allowed) return { ok: false, status: 403, body: result.reason };
  return await readScriptAllowed(relativePath);
}

function ensureParentDir(fullPath: string): Promise<void> {
  const dir = fullPath.slice(0, fullPath.lastIndexOf("/"));
  if (dir) return Deno.mkdir(dir, { recursive: true });
  return Promise.resolve();
}

function toWriteError(e: unknown): WriteResult {
  const body = e instanceof Error ? e.message : "write failed";
  return { ok: false, status: 500, body };
}

async function doWrite(fullPath: string, content: string): Promise<WriteResult> {
  await ensureParentDir(fullPath);
  await Deno.writeTextFile(fullPath, content, { create: true });
  return { ok: true, status: 201 };
}

async function writeScriptAllowed(
  fullPath: string,
  content: string,
): Promise<WriteResult> {
  try { return await doWrite(fullPath, content); }
  catch (e) { return toWriteError(e); }
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
  if (!result.allowed) return { ok: false, status: 403, body: result.reason };
  const fullPath = `${getScriptsBase()}/${relativePath}`;
  return await writeScriptAllowed(fullPath, content);
}
