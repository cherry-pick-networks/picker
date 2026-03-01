//
// Build assessment prompt context from schedule/review data and ontology.
// Returns target_concepts, difficulty, avoid_concepts for Copilot (Stream B).
//

import { getAllowlistDataOrLoad } from '#api/config/allowlistData.ts';
import {
  buildFinalResponse,
  collectUnitIdsAndGrades,
  getValidUnitIdsAndLabels,
  type PromptContextResult,
} from './promptContextServiceHelpers.ts';

export type PromptContextInput = {
  actor_ids: string[];
  from?: string;
  to?: string;
};

export type { PromptContextResult } from './promptContextServiceHelpers.ts';

export async function buildPromptContext(
  input: PromptContextInput,
): Promise<PromptContextResult> {
  if (input.actor_ids.length === 0) {
    return {
      ok: false,
      status: 400,
      message: 'actor_ids required (at least one)',
    };
  }
  const [allowlist, data] = await Promise.all([
    getAllowlistDataOrLoad(),
    collectUnitIdsAndGrades(input),
  ]);
  const next = await getValidUnitIdsAndLabels(
    allowlist,
    data.unitIds,
  );
  return next.kind === 'empty'
    ? { ok: true, response: next.response }
    : buildFinalResponse(next, data.unitIdLastGrade);
}
