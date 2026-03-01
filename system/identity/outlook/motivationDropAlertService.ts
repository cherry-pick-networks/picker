export interface OutlookMotivationDropAlertInput {
  actor_id: string;
  from?: string;
  to?: string;
}

export function getMotivationDropAlert(
  _input: OutlookMotivationDropAlertInput,
) {
  const out = { alerts: [] };
  return out;
}
