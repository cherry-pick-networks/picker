//  Parent FAQ context; Lexis/store or stub.

export interface OutlookParentFaqContextInput {
  actor_id: string;
  topic?: string;
}

export function getParentFaqContext(
  _input: OutlookParentFaqContextInput,
) {
  const out = {
    context: [],
    stub: true,
    message: 'Lexis/store not connected; stub.',
  };
  return out;
}
