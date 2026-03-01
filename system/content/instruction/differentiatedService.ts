export interface InstructionDifferentiatedInput {
  level: string;
  concept_ids?: string[];
  limit?: number;
}

export function getDifferentiatedInstruction(
  _input: InstructionDifferentiatedInput,
) {
  const out = { instructions: [] };
  return out;
}
