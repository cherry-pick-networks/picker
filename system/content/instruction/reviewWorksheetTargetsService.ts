export interface InstructionReviewWorksheetTargetsInput {
  actor_id?: string;
  concept_ids?: string[];
  from?: string;
  to?: string;
}

export function getReviewWorksheetTargets(
  _input: InstructionReviewWorksheetTargetsInput,
) {
  const out = { targets: [] };
  return out;
}
