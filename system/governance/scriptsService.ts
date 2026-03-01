//
// Script domain service facade. Cross-domain callers use this instead of
// scriptsStore. Read/write are Governance-gated inside the store.
//

import { GovernanceStores } from './GovernanceStores.ts';
import type { ReadResult } from './scriptsTypes.ts';

export type { ReadResult } from './scriptsTypes.ts';

export function getScriptContent(
  relativePath: string,
): Promise<ReadResult> {
  const result = GovernanceStores.scriptsStore.readScript(
    relativePath,
  );
  return result;
}
