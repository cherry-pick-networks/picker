//
// Days extraction from utterance: regex-first (e.g. "17일차", "17·18일차").
// LLM fallback interface reserved for later.
//

const SINGLE_DAY = /(\d+)\s*일차/g;
const RANGE_DAY = /(\d+)\s*[-·~]\s*(\d+)\s*일차/g;

export interface DaysParseResult {
  ok: true;
  days: number[];
}

function addDay(seen: Set<number>, n: number): void {
  if (!Number.isInteger(n) || n < 1) return;
  seen.add(n);
}

function collectRange(seen: Set<number>, s: string): void {
  const matches = [...s.matchAll(RANGE_DAY)];
  for (const m of matches) {
    const a = parseInt(m[1], 10);
    const b = parseInt(m[2], 10);
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    for (let i = lo; i <= hi; i++) addDay(seen, i);
  }
}

function collectSingles(
  seen: Set<number>,
  s: string,
): void {
  const matches = [...s.matchAll(SINGLE_DAY)];
  for (const m of matches) {
    addDay(seen, parseInt(m[1], 10));
  }
}

function collectAllDays(
  seen: Set<number>,
  utterance: string,
): void {
  collectRange(seen, utterance);
  collectSingles(seen, utterance);
}

export function parseDaysWithRegex(
  utterance: string,
): number[] | null {
  const seen = new Set<number>();
  collectAllDays(seen, utterance);
  if (seen.size === 0) return null;
  return [...seen].sort((x, y) => x - y);
}

export function parseDays(
  utterance: string,
): DaysParseResult | { ok: false } {
  const days = parseDaysWithRegex(utterance);
  if (days == null || days.length === 0) {
    return { ok: false };
  }
  return { ok: true, days };
}
