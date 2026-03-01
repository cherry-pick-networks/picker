export interface InstructionSlideDeckContextInput {
  concept_ids: string[];
  level?: string;
}

export function getSlideDeckContext(
  _input: InstructionSlideDeckContextInput,
) {
  const out = { context: {} };
  return out;
}
