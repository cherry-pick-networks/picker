export interface InstructionStepByStepScaffoldInput {
  concept_id: string;
  level?: string;
}

export function getStepByStepScaffold(
  _input: InstructionStepByStepScaffoldInput,
) {
  const out = { steps: [] };
  return out;
}
