// function-length-ignore-file — CI/utility script (§P reserved).
// One-off migration: convert block comments (/* */, /** */) to // style (RULESET.md §S).
// Usage: deno run -A shared/context/scripts/commentToSingleLine.ts [--dry-run] [--write]

import { collectTsFiles } from './checkLineLengthWalk.ts';

interface BlockSpan {
  start: number;
  end: number;
  raw: string;
}

function findBlockSpans(text: string): BlockSpan[] {
  const spans: BlockSpan[] = [];
  let i = 0;
  const n = text.length;
  while (i < n) {
    const rest = text.slice(i);
    if (rest.startsWith('//')) {
      const eol = text.indexOf('\n', i);
      i = eol === -1 ? n : eol + 1;
      continue;
    }
    if (rest.startsWith('/*')) {
      const start = i;
      const endIdx = text.indexOf('*/', i + 2);
      if (endIdx === -1) {
        i = n;
        spans.push({
          start,
          end: n,
          raw: text.slice(start),
        });
      } else {
        const end = endIdx + 2;
        spans.push({
          start,
          end,
          raw: text.slice(start, end),
        });
        i = end;
      }
      continue;
    }
    const ch = text[i];
    if (ch === '"' || ch === "'") {
      const q = ch;
      i += 1;
      while (i < n) {
        const c = text[i];
        if (c === '\\') {
          i += 2;
          continue;
        }
        if (c === q) {
          i += 1;
          break;
        }
        i += 1;
      }
      continue;
    }
    if (ch === '`') {
      i += 1;
      while (i < n) {
        const c = text[i];
        if (c === '\\') {
          i += 2;
          continue;
        }
        if (c === '`') {
          i += 1;
          break;
        }
        if (c === '$' && text[i + 1] === '{') {
          i += 2;
          let depth = 1;
          while (i < n && depth > 0) {
            const d = text[i];
            if (d === '{') depth += 1;
            else if (d === '}') depth -= 1;
            i += 1;
          }
          continue;
        }
        i += 1;
      }
      continue;
    }
    i += 1;
  }
  return spans;
}

function blockToSingleLine(raw: string): string {
  const inner = raw
    .replace(/^\s*\/\*\*?/, '')
    .replace(/\*\/\s*$/, '');
  const lines = inner.split(/\n/);
  const out: string[] = [];
  for (const line of lines) {
    const t = line.replace(/^\s*\*\s?/, '').trimEnd();
    if (t.length > 0) {
      out.push('// ' + t);
    } else {
      out.push('//');
    }
  }
  return out.join('\n');
}

function convertFile(
  text: string,
): { result: string; changed: boolean } {
  const spans = findBlockSpans(text);
  if (spans.length === 0) {
    return { result: text, changed: false };
  }
  let result = '';
  let last = 0;
  for (const { start, end, raw } of spans) {
    result += text.slice(last, start);
    result += blockToSingleLine(raw);
    last = end;
  }
  result += text.slice(last);
  return { result, changed: true };
}

const dryRun = Deno.args.includes('--dry-run');
const write = Deno.args.includes('--write');

async function main() {
  const root = Deno.cwd();
  const files = await collectTsFiles(root);
  let changedCount = 0;
  for (const rel of files.sort()) {
    const path = `${root}/${rel}`;
    const text = await Deno.readTextFile(path);
    const { result, changed } = convertFile(text);
    if (!changed) continue;
    changedCount += 1;
    if (dryRun) {
      console.log(rel);
      continue;
    }
    if (write) {
      await Deno.writeTextFile(path, result);
      console.log('wrote', rel);
    }
  }
  if (dryRun && changedCount > 0) {
    console.log(
      `Would change ${changedCount} file(s). Run with --write to apply.`,
    );
  } else if (dryRun) {
    console.log('No block comments found.');
  }
}

main();
