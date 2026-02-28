/**
 * Script domain service facade. Cross-domain callers use this instead of
 * scriptsStore. Read/write are Governance-gated inside the store.
 */

import { readScript } from './scriptsStore.ts';
import type { ReadResult } from './scriptsTypes.ts';

export type { ReadResult } from './scriptsTypes.ts';

export function getScriptContent(
  relativePath: string,
): Promise<ReadResult> {
  const result = readScript(relativePath);
  return result;
}
