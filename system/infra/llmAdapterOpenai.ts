//
// OpenAI adapter: chat and embed via api.openai.com. Uses given apiKey/modelId.
//

import type { LlmAdapter } from './llmTypes.ts';
import { chat } from './llmAdapterOpenaiChat.ts';
import { embed } from './llmAdapterOpenaiEmbed.ts';

export const openaiAdapter: LlmAdapter = { chat, embed };
