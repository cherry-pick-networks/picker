export interface InstructionExamBlueprintInput {
  scheme_id: string;
  level?: string;
  concept_ids?: string[];
}

export function getExamBlueprint(
  _input: InstructionExamBlueprintInput,
) {
  const out = { concepts: [], weight: 0, item_count: 0 };
  return out;
}
