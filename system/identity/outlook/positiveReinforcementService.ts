export interface OutlookPositiveReinforcementInput {
  actor_id: string;
  from?: string;
  to?: string;
}

export function getPositiveReinforcement(
  _input: OutlookPositiveReinforcementInput,
) {
  const out = { suggestions: [] };
  return out;
}
