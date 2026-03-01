// function-length-ignore-file — CI/utility script (§P reserved).
// Enforce comment style: single-line (//) only (RULESET.md §S).
// Block comments (/* */, /** */) are not allowed.

function findBlockCommentRanges(
  text: string,
): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
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
        ranges.push([start, n]);
      } else {
        i = endIdx + 2;
        ranges.push([start, i]);
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
  return ranges;
}

const plugin: Deno.lint.Plugin = {
  name: 'comment-style',
  rules: {
    'single-line-only': {
      create(context: Deno.lint.RuleContext) {
        return {
          Program(node: Deno.lint.Node) {
            const text = context.sourceCode.getText();
            const ranges = findBlockCommentRanges(text);
            for (const [start, end] of ranges) {
              context.report({
                node,
                message:
                  'Use // for comments; block comments (/* */) are not allowed.',
                range: [start, end],
              });
            }
          },
        };
      },
    },
  },
};
export default plugin;
