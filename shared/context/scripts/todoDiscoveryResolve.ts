// function-length-ignore-file — CI/utility script (§P reserved).
//
// Resolve relative import specs to file paths for todo-discovery. Used by
// todoDiscovery.ts.
//

const ROOT = Deno.cwd();

export function dirname(path: string): string {
  const i = path.lastIndexOf('/');
  return i <= 0 ? '' : path.slice(0, i);
}

export function normalizeRel(
  baseDir: string,
  spec: string,
): string {
  const parts: string[] = [];
  const segs = (baseDir + '/' + spec).split('/');
  for (const s of segs) {
    if (s === '' || s === '.') continue;
    if (s === '..') {
      parts.pop();
      continue;
    }
    parts.push(s);
  }
  return parts.join('/');
}

export function resolvePath(
  entryRel: string,
  spec: string,
): string | null {
  if (!spec.startsWith('.')) return null;
  const baseDir = dirname(entryRel);
  const resolved = normalizeRel(baseDir, spec);
  const candidates = [resolved];
  if (
    !resolved.includes('.') || resolved.endsWith('.json')
  ) {
    candidates.push(resolved + '.ts', resolved + '.tsx');
  }
  for (const p of candidates) {
    try {
      const full = `${ROOT}/${p}`;
      Deno.statSync(full);
      return p;
    } catch {
      // continue
    }
  }
  return null;
}
