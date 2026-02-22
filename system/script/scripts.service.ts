/**
 * Script domain service facade. Cross-domain callers use this instead of
 * scripts.store. Read/write are Governance-gated inside the store.
 */

import { readScript } from "./scripts.store.ts";
import type { ReadResult } from "./scripts.types.ts";

export type { ReadResult } from "./scripts.types.ts";

export async function getScriptContent(
  relativePath: string,
): Promise<ReadResult> {
  return readScript(relativePath);
}
