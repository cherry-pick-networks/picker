//  Mutate service: block slice and LLM loop. Used by mutateServiceHelpers.

import { ScriptLlmService } from '#api/config/ScriptLlmService.ts';

const LINES_PER_BLOCK_MIN = 2;
const LINES_PER_BLOCK_MAX = 4;

export function sliceBlocks(
  lines: string[],
  maxBlocks?: number,
): { snippet: string }[] {
  const blocks: { snippet: string }[] = [];
  for (let i = 0; i < lines.length;) {
    const size = Math.min(
      LINES_PER_BLOCK_MAX,
      Math.max(LINES_PER_BLOCK_MIN, lines.length - i),
    );
    const slice = lines.slice(i, i + size);
    blocks.push({ snippet: slice.join('\n') });
    i += size;
    if (maxBlocks != null && blocks.length >= maxBlocks) {
      break;
    }
  }
  return blocks;
}

export async function runBlockLoop(
  content: string,
  blocks: { snippet: string }[],
  intent: string | undefined,
): Promise<{ content: string; replacements: number }> {
  let text = content;
  let replacements = 0;
  for (const { snippet } of blocks) {
    const llm = await ScriptLlmService.mutateViaLlm({
      snippet,
      intent,
    });
    if (!llm.ok) {
      return Promise.reject(new Error(llm.error));
    }
    if (llm.output.original !== snippet) continue;
    text = text.replace(snippet, llm.output.mutated);
    replacements += 1;
  }
  return { content: text, replacements };
}

export function processBlocks(
  content: string,
  intent: string | undefined,
  maxBlocks: number | undefined,
): Promise<{ content: string; replacements: number }> {
  const lines = content.split('\n');
  const blocks = sliceBlocks(lines, maxBlocks);
  return runBlockLoop(content, blocks, intent);
}
