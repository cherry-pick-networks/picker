//
// Unified LLM client: chat(feature, messages) and embed(feature, text).
// Provider and model from registry; only OpenAI adapter implemented.
//

import type {
  ChatResult,
  EmbedResult,
  LlmFeatureChat,
} from './llmTypes.ts';
import {
  getApiKey,
  getApiKeyErrorName,
  getProvider,
} from './llmModelRegistry.ts';
import { runChat } from './llmClientChat.ts';
import {
  getProviderAndKey,
  mockEmbedding,
  runEmbed,
} from './llmClientEmbed.ts';

export async function chat(
  feature: LlmFeatureChat,
  messages: import('./llmTypes.ts').ChatMessage[],
  options?: { modelOverride?: string },
): Promise<ChatResult> {
  const provider = getProvider();
  const apiKey = getApiKey(provider);
  if (!apiKey) {
    return {
      ok: false,
      error: `${getApiKeyErrorName(provider)} not set`,
    };
  }
  return await runChat(
    provider,
    apiKey,
    feature,
    messages,
    options?.modelOverride,
  );
}

export async function embed(
  text: string,
  options?: { modelOverride?: string },
): Promise<EmbedResult> {
  if (Deno.env.get('SEMANTIC_EMBED_MOCK')) {
    return { ok: true, embedding: mockEmbedding() };
  }
  const keyResult = getProviderAndKey();
  if (!keyResult.ok) {
    return { ok: false, error: keyResult.error };
  }
  return await runEmbed(
    keyResult.provider,
    keyResult.apiKey,
    text,
    options?.modelOverride,
  );
}
