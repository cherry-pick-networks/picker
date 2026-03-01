import type { Context } from 'hono';
import {
  getPeerBenchmarking as buildPeerBenchmarking,
} from '#system/report/analytics/peerBenchmarkingService.ts';

function parseQuery(c: Context) {
  const actor_id = c.req.query('actor_id');
  const scheme_id = c.req.query('scheme_id');
  return { actor_id, scheme_id };
}

export function getPeerBenchmarking(c: Context) {
  const { actor_id, scheme_id } = parseQuery(c);
  if (!actor_id || !scheme_id) {
    return c.json({
      error: 'actor_id and scheme_id required',
    }, 400);
  }
  return c.json(
    buildPeerBenchmarking({ actor_id, scheme_id }),
  );
}
