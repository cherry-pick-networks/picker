//
// LLM client: chat adapter and runChat. Used by llmClient.ts.
//

import type {
  ChatMessage,
  ChatResult,
  LlmAdapter,
  LlmFeatureChat,
  LlmProvider,
} from './llmTypes.ts';
import { openaiAdapter } from './llmAdapterOpenai.ts';
import { getModelId } from './llmModelRegistry.ts';

export function getAdapter(provider: string): LlmAdapter {
  if (provider === 'openai') return openaiAdapter;
  throw new Error(
    `LLM provider not implemented: ${provider}`,
  );
}

export async function callAdapterChat(
  adapter: LlmAdapter,
  apiKey: string,
  modelId: string,
  messages: ChatMessage[],
): Promise<ChatResult> {
  try {
    const content = await adapter.chat(
      apiKey,
      modelId,
      messages,
      { responseFormat: 'json_object' },
    );
    return { ok: true, content };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}

export async function runChat(
  provider: string,
  apiKey: string,
  feature: LlmFeatureChat,
  messages: ChatMessage[],
  modelOverride?: string,
): Promise<ChatResult> {
  const modelId = getModelId(
    provider as LlmProvider,
    feature,
    modelOverride,
  );
  const adapter = getAdapter(provider);
  return await callAdapterChat(
    adapter,
    apiKey,
    modelId,
    messages,
  );
}
