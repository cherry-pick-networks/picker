//  Reading material match; extend recommend/semantic if needed.

export interface InstructionReadingMaterialMatchInput {
  concept_ids: string[];
  limit?: number;
}

export function getReadingMaterialMatch(
  _input: InstructionReadingMaterialMatchInput,
) {
  const out = { matches: [] };
  return out;
}
