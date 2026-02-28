/**
 * One-off: fetch lexis entries by source_id and days, print to stdout.
 * Usage: deno run -A scripts/fetch-lexis-entries.ts <sid> <d1> [day2..]
 * Example: deno run -A ... lexis-middle-intermediate 17 18
 */

import { listEntriesBySourceAndDays } from '#system/lexis/lexisStore.ts';

const sourceId = Deno.args[0];
const days = Deno.args.slice(1).map((s) => parseInt(s, 10)).filter((n) => n >= 1);

if (!sourceId || days.length === 0) {
  console.error(
    'Usage: deno run -A scripts/fetch-lexis-entries.ts <sid> <d1> [d2..]',
  );
  Deno.exit(1);
}

const entries = await listEntriesBySourceAndDays(
  sourceId,
  [...new Set(days)].sort((a, b) => a - b),
);
console.log(JSON.stringify(entries, null, 2));
