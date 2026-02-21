/**
 * AST-based patch apply for files under shared/runtime/store/.
 * All access gated by Governance; write via scripts store only.
 */

import { readScript, writeScript } from "../store/scripts.ts";
import { verifyGovernance } from "../validator/index.ts";

export type ApplyResult =
  | { ok: true }
  | { ok: false; status: number; body: string };

function failGovernance(path: string): ApplyResult | null {
  const g = verifyGovernance("write", path);
  return g.allowed ? null : { ok: false, status: 403, body: g.reason };
}

async function readAndCheck(
  path: string,
  oldText: string,
): Promise<ApplyResult | { content: string }> {
  const read = await readScript(path);
  if (!read.ok) return { ok: false, status: read.status, body: read.body };
  if (!read.content.includes(oldText)) {
    return { ok: false, status: 400, body: "oldText not found in file" };
  }
  return { content: read.content };
}

async function doWrite(
  path: string,
  content: string,
): Promise<ApplyResult> {
  const write = await writeScript(path, content);
  return write.ok ? { ok: true } : { ok: false, status: write.status, body: write.body };
}

async function readAfterGov(
  path: string,
  oldText: string,
): Promise<ApplyResult | { content: string }> {
  const govResult = failGovernance(path);
  if (govResult) return govResult;
  return await readAndCheck(path, oldText);
}

/**
 * Apply a text patch to a file in shared/runtime/store/. Governance-verified;
 * uses readScript and writeScript. Fails if path invalid, oldText not found,
 * or write fails.
 */
export async function applyPatch(
  path: string,
  oldText: string,
  newText: string,
): Promise<ApplyResult> {
  const step = await readAfterGov(path, oldText);
  if (!("content" in step)) return step;
  const newContent = step.content.replaceAll(oldText, newText);
  return await doWrite(path, newContent);
}
