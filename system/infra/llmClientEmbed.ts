//  LLM client: embed flow. Used by llmClient.ts.

import type {
  EmbedResult,
  LlmAdapter,
  LlmFeature,
  LlmProvider,
} from './llmTypes.ts';
import { openaiAdapter } from './llmAdapterOpenai.ts';
import {
  getApiKey,
  getApiKeyErrorName,
  getModelId,
  getProvider,
} from './llmModelRegistry.ts';

const EMBED_MOCK_DIM = 1536;

export function mockEmbedding(): number[] {
  return Array.from(
    { length: EMBED_MOCK_DIM },
    (_, i) => (i % 10) / 10,
  );
}

function getAdapter(provider: string): LlmAdapter {
  if (provider === 'openai') return openaiAdapter;
  throw new Error(
    `LLM provider not implemented: ${provider}`,
  );
}

export async function runEmbed(
  provider: string,
  apiKey: string,
  text: string,
  modelOverride?: string,
): Promise<EmbedResult> {
  const feature = 'embed' as LlmFeature;
  const modelId = getModelId(
    provider as LlmProvider,
    feature,
    modelOverride,
  );
  const adapter = getAdapter(provider);
  try {
    const embedding = await adapter.embed(
      apiKey,
      modelId,
      text,
    );
    return { ok: true, embedding };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}

export function failProviderKey(provider: string): {
  ok: false;
  error: string;
} {
  return {
    ok: false,
    error: `${
      getApiKeyErrorName(provider as LlmProvider)
    } not set`,
  };
}

export function getProviderAndKey():
  | { ok: true; provider: string; apiKey: string }
  | { ok: false; error: string } {
  const provider = getProvider();
  const apiKey = getApiKey(provider);
  if (!apiKey) return failProviderKey(provider);
  return { ok: true, provider, apiKey };
}
