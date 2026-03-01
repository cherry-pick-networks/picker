export interface OutlookMissingHomeworkImpactInput {
  actor_id: string;
  from?: string;
  to?: string;
}

export function getMissingHomeworkImpact(
  _input: OutlookMissingHomeworkImpactInput,
) {
  const out = { impact_summary: null };
  return out;
}
