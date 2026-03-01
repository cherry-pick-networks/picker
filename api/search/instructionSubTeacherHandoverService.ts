export interface InstructionSubTeacherHandoverInput {
  actor_id?: string;
  level?: string;
  from?: string;
  to?: string;
}

export function getSubTeacherHandover(
  _input: InstructionSubTeacherHandoverInput,
) {
  const out = { briefing: {} };
  return out;
}
