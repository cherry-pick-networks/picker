/**
 * AST-based patch apply for files under shared/runtime/store/.
 * All access gated by Governance; write via scripts store only.
 */

import { readScript, writeScript } from "../store/scripts.ts";
import { verifyGovernance } from "../validator/index.ts";

export type ApplyResult =
  | { ok: true }
  | { ok: false; status: number; body: string };

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
  const gov = verifyGovernance("write", path);
  if (!gov.allowed) {
    return { ok: false, status: 403, body: gov.reason };
  }
  const read = await readScript(path);
  if (!read.ok) {
    return { ok: false, status: read.status, body: read.body };
  }
  if (!read.content.includes(oldText)) {
    return {
      ok: false,
      status: 400,
      body: "oldText not found in file",
    };
  }
  const content = read.content.replaceAll(oldText, newText);
  const write = await writeScript(path, content);
  if (!write.ok) {
    return { ok: false, status: write.status, body: write.body };
  }
  return { ok: true };
}
