//
// Shared types for unified LLM client: features, providers, adapters.
//

export type LlmFeatureChat =
  | 'review_mapping'
  | 'diagnose'
  | 'item_generate'
  | 'source_extract'
  | 'lexis_utterance'
  | 'curriculum_mapping'
  | 'script_mutate';

export type LlmFeatureEmbed = 'embed';

export type LlmFeature = LlmFeatureChat | LlmFeatureEmbed;

export type LlmProvider =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'aws'
  | 'azure';

export type ChatMessage = { role: string; content: string };

export type ChatResult =
  | { ok: true; content: string }
  | { ok: false; error: string };

export type EmbedResult =
  | { ok: true; embedding: number[] }
  | { ok: false; error: string };

export type LlmAdapter = {
  chat(
    apiKey: string,
    modelId: string,
    messages: ChatMessage[],
    options?: { responseFormat?: 'json_object' },
  ): Promise<string>;
  embed(
    apiKey: string,
    modelId: string,
    text: string,
  ): Promise<number[]>;
};
