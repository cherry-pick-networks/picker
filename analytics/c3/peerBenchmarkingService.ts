//  Peer benchmarking: internal group comparison or stub when no external data.

export interface PeerBenchmarkingInput {
  actor_id: string;
  scheme_id: string;
}

export function getPeerBenchmarking(
  _input: PeerBenchmarkingInput,
) {
  const out = {
    comparison: 'internal_group' as const,
    message:
      'No external data; internal group comparison or stub.',
    metrics: [],
  };
  return out;
}
