//  Mutate service: block slice, LLM loop, read/write flow. Used by mutateService.

import { verifyGovernance } from './governanceValidation.ts';
import type {
  MutateRequest,
  MutateResponse,
} from './mutateSchema.ts';
import { GovernanceStores } from './GovernanceStores.ts';
import { processBlocks } from './mutateServiceHelpersBlocks.ts';

export function toErrorResponse(
  status: number,
  body: unknown,
): MutateResponse {
  return { ok: false, status, body };
}

type ReadOk = { ready: true; content: string };

export async function loadScriptContent(
  path: string,
): Promise<MutateResponse | ReadOk> {
  const readResult = await GovernanceStores.scriptsStore
    .readScript(path);
  return readResult.ok
    ? { ready: true, content: readResult.content }
    : toErrorResponse(readResult.status, readResult.body);
}

export async function ensureCanRead(
  path: string,
): Promise<MutateResponse | ReadOk> {
  const gov = verifyGovernance('read', path);
  if (!gov.allowed) {
    return toErrorResponse(403, gov.reason);
  }
  return await loadScriptContent(path);
}

export async function runMutateAndWrite(
  req: MutateRequest,
  content: string,
): Promise<MutateResponse> {
  try {
    const blockResult = await processBlocks(
      content,
      req.intent,
      req.options?.maxBlocks,
    );
    const writeResult = await GovernanceStores.scriptsStore
      .writeScript(
        req.path,
        blockResult.content,
      );
    if (!writeResult.ok) {
      return toErrorResponse(
        writeResult.status,
        writeResult.body,
      );
    }
    return {
      ok: true,
      replacements: blockResult.replacements,
    };
  } catch (e) {
    const body = e instanceof Error ? e.message : String(e);
    return toErrorResponse(500, body);
  }
}
