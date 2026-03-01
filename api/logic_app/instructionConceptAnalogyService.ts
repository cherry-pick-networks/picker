//  Concept analogy; extend recommend/semantic if needed.

export interface InstructionConceptAnalogyInput {
  concept_id: string;
  limit?: number;
}

export function getConceptAnalogy(
  _input: InstructionConceptAnalogyInput,
) {
  const out = { analogies: [] };
  return out;
}
