//
// Model registry: (provider, feature) → model ID. Provider resolution from env.
//

import type {
  LlmFeature,
  LlmProvider,
} from './llmTypes.ts';

const OPENAI: Record<LlmFeature, string> = {
  review_mapping: 'gpt-4o',
  diagnose: 'gpt-4o',
  item_generate: 'gpt-4o',
  source_extract: 'gpt-4o',
  lexis_utterance: 'gpt-4o',
  curriculum_mapping: 'gpt-4o',
  script_mutate: 'gpt-4o-mini',
  embed: 'text-embedding-3-small',
};

const REGISTRY: Record<
  LlmProvider,
  Partial<Record<LlmFeature, string>>
> = {
  openai: OPENAI,
  anthropic: {},
  google: {},
  aws: {},
  azure: {},
};

const FEATURE_ENV_OVERRIDE: Record<LlmFeature, string> = {
  review_mapping: 'REVIEW_MAPPING_LLM_MODEL',
  diagnose: 'DIAGNOSE_MISCONCEPTION_LLM_MODEL',
  item_generate: 'DYNAMIC_ITEM_LLM_MODEL',
  source_extract: 'SOURCE_EXTRACT_LLM_MODEL',
  lexis_utterance: 'LEXIS_UTTERANCE_LLM_MODEL',
  curriculum_mapping: 'CURRICULUM_MAPPING_LLM_MODEL',
  script_mutate: 'OPENAI_MODEL',
  embed: 'SEMANTIC_EMBED_MODEL',
};

function getEnvOverride(
  feature: LlmFeature,
): string | undefined {
  const key = FEATURE_ENV_OVERRIDE[feature];
  return Deno.env.get(key);
}

export function getModelId(
  provider: LlmProvider,
  feature: LlmFeature,
  modelOverride?: string,
): string {
  const fromEnv = modelOverride ?? getEnvOverride(feature);
  if (fromEnv) return fromEnv;
  return REGISTRY[provider]?.[feature] ?? OPENAI[feature];
}

const PROVIDER_KEY: Record<LlmProvider, string> = {
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  google: 'GOOGLE_API_KEY',
  aws: 'AWS_ACCESS_KEY_ID',
  azure: 'AZURE_OPENAI_KEY',
};

function hasKey(provider: LlmProvider): boolean {
  const key = Deno.env.get(PROVIDER_KEY[provider]);
  return typeof key === 'string' && key.length > 0;
}

export function getProvider(): LlmProvider {
  const raw = Deno.env.get('LLM_PROVIDER');
  const p = (raw?.toLowerCase() ?? 'openai') as LlmProvider;
  if (!hasKey(p)) return 'openai';
  return p in REGISTRY ? p : 'openai';
}

export function getApiKey(
  provider: LlmProvider,
): string | undefined {
  return Deno.env.get(PROVIDER_KEY[provider]);
}

export function getApiKeyErrorName(
  provider: LlmProvider,
): string {
  return PROVIDER_KEY[provider];
}
