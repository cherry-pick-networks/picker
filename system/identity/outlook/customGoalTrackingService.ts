//  Custom goal tracking; actor meta or KV.

export interface OutlookCustomGoalTrackingInput {
  actor_id: string;
}

export function getCustomGoalTracking(
  _input: OutlookCustomGoalTrackingInput,
) {
  const out = { goals: [], progress: {} };
  return out;
}
