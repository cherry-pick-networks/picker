//
// Comment-only line detection for file effective line count (RULESET.md §P).
// Only // and empty lines are comment-only (block comments disallowed per §S).
//

export function isCommentOnlyLine(line: string): boolean {
  const trimmed = line.trim();
  return trimmed === '' || trimmed.startsWith('//');
}
