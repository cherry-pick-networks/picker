//  Relative position; anonymized/consent policy applied.

export interface OutlookRelativePositionInput {
  actor_id: string;
  scheme_id: string;
  from?: string;
  to?: string;
}

export function getRelativePosition(
  _input: OutlookRelativePositionInput,
) {
  const out = { position: null };
  return out;
}
