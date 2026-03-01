//  Fill-in-the-blank targets; governance/store or seed when using LLM.

export interface InstructionFillInTheBlankTargetsInput {
  concept_id: string;
  limit?: number;
}

export function getFillInTheBlankTargets(
  _input: InstructionFillInTheBlankTargetsInput,
) {
  const out = { targets: [] };
  return out;
}
