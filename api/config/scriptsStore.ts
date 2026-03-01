//
// Read access to sharepoint/runtime/store/. All access is gated by Governance
// (script/validation).
//

import { verifyGovernance } from './governanceValidation.ts';
import type {
  ListResult,
  ReadResult,
  WriteResult,
} from './scriptsTypes.ts';
import { getScriptsBase } from './scriptsStoreBase.ts';
import { listScriptsAllowed } from './scriptsStoreList.ts';
import { readScriptAllowed } from './scriptsStoreRead.ts';
import { writeScriptAllowed } from './scriptsStoreWrite.ts';

export type {
  ListResult,
  ReadResult,
  WriteResult,
} from './scriptsTypes.ts';

export function listScripts(): Promise<ListResult> {
  const result = verifyGovernance('read', '');
  if (!result.allowed) {
    return Promise.resolve({
      ok: false,
      status: 403,
      body: result.reason,
    });
  }
  return listScriptsAllowed();
}

export function readScript(
  relativePath: string,
): Promise<ReadResult> {
  const result = verifyGovernance('read', relativePath);
  if (!result.allowed) {
    return Promise.resolve({
      ok: false,
      status: 403,
      body: result.reason,
    });
  }
  return readScriptAllowed(relativePath);
}

export function writeScript(
  relativePath: string,
  content: string,
): Promise<WriteResult> {
  const result = verifyGovernance('write', relativePath);
  if (!result.allowed) {
    return Promise.resolve({
      ok: false,
      status: 403,
      body: result.reason,
    });
  }
  const fullPath = `${getScriptsBase()}/${relativePath}`;
  return writeScriptAllowed(fullPath, content);
}
