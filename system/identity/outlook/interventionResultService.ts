export interface OutlookInterventionResultInput {
  actor_id: string;
  from?: string;
  to?: string;
}

export function getInterventionResult(
  _input: OutlookInterventionResultInput,
) {
  const out = { results: [] };
  return out;
}
