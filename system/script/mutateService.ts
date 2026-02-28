/**
 * Mutate service: Governance → readScript → 2–4 line blocks → LLM →
 * replace → writeScript once. Uses scriptsStore, governance, mutateSchema,
 * llmClient. MAB·DAG remain local (boundary § Mutation boundary).
 */

import { verifyGovernance } from '#system/script/governanceValidation.ts';
import { mutateViaLlm } from '#system/script/scriptLlmClient.ts';
import type {
  MutateRequest,
  MutateResponse,
} from '#system/script/mutateSchema.ts';
import { readScript, writeScript } from '#system/script/scriptsStore.ts';

const LINES_PER_BLOCK_MIN = 2;
const LINES_PER_BLOCK_MAX = 4;

// function-length-ignore
function toErrorResponse(status: number, body: unknown): MutateResponse {
  return { ok: false, status, body };
}

function sliceBlocks(
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
    if (maxBlocks != null && blocks.length >= maxBlocks) break;
  }
  return blocks;
}

async function runBlockLoop(
  content: string,
  blocks: { snippet: string }[],
  intent: string | undefined,
): Promise<{ content: string; replacements: number }> {
  let text = content;
  let replacements = 0;
  for (const { snippet } of blocks) {
    const llm = await mutateViaLlm({ snippet, intent });
    if (!llm.ok) return Promise.reject(new Error(llm.error));
    if (llm.output.original !== snippet) continue;
    text = text.replace(snippet, llm.output.mutated);
    replacements += 1;
  }
  return { content: text, replacements };
}

function processBlocks(
  content: string,
  intent: string | undefined,
  maxBlocks: number | undefined,
): Promise<{ content: string; replacements: number }> {
  const lines = content.split('\n');
  const blocks = sliceBlocks(lines, maxBlocks);
  return runBlockLoop(content, blocks, intent);
}

type ReadOk = { ready: true; content: string };

async function ensureCanRead(
  path: string,
): Promise<MutateResponse | ReadOk> {
  const gov = verifyGovernance('read', path);
  if (!gov.allowed) return toErrorResponse(403, gov.reason);
  const readResult = await readScript(path);
  return readResult.ok
    ? { ready: true, content: readResult.content }
    : toErrorResponse(readResult.status, readResult.body);
}

async function runMutateAndWrite(
  req: MutateRequest,
  content: string,
): Promise<MutateResponse> {
  try {
    const { content: next, replacements } = await processBlocks(
      content,
      req.intent,
      req.options?.maxBlocks,
    );
    const writeResult = await writeScript(req.path, next);
    if (!writeResult.ok) {
      return toErrorResponse(writeResult.status, writeResult.body);
    }
    return { ok: true, replacements };
  } catch (e) {
    const body = e instanceof Error ? e.message : String(e);
    return toErrorResponse(500, body);
  }
}

/** Run mutate flow: verify path, read file, block-wise LLM, single write. */
export async function mutateScript(
  req: MutateRequest,
): Promise<MutateResponse> {
  const read = await ensureCanRead(req.path);
  if (!('ready' in read)) return read;
  return runMutateAndWrite(req, read.content);
}
