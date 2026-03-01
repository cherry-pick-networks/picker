//
// Mutate service: Governance → readScript → 2–4 line blocks → LLM →
// replace → writeScript once. Uses scriptsStore, governance, mutateSchema,
// llmClient. MAB·DAG remain local (boundary § Mutation boundary).
//

import type {
  MutateRequest,
  MutateResponse,
} from './mutateSchema.ts';
import {
  ensureCanRead,
  runMutateAndWrite,
} from './mutateServiceHelpers.ts';

export async function mutateScript(
  req: MutateRequest,
): Promise<MutateResponse> {
  const read = await ensureCanRead(req.path);
  if (!('ready' in read)) return read;
  return runMutateAndWrite(req, read.content);
}
