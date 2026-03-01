//
// Split source body into text chunks for embedding.
//

const MAX_CHUNK_CHARS = 500;

function splitLongLoop(segment: string): string[] {
  const out: string[] = [];
  let rest = segment;
  while (rest.length > 0) {
    const end = Math.min(MAX_CHUNK_CHARS, rest.length);
    out.push(rest.slice(0, end).trim());
    rest = rest.slice(end).trim();
  }
  return out.filter((s) => s.length > 0);
}

function splitLong(segment: string): string[] {
  if (segment.length <= MAX_CHUNK_CHARS) return [segment];
  return splitLongLoop(segment);
}

//  Returns non-empty chunks; paragraph then size-bound.
export function chunkBody(body: string): string[] {
  const paras = body.split(/\n\s*\n/).map((p) => p.trim())
    .filter(Boolean);
  const flat = paras.flatMap((p) => splitLong(p));
  return flat;
}
