//  OpenAI adapter: embed via api.openai.com. Used by llmAdapterOpenai.ts.

const EMBED_URL = 'https://api.openai.com/v1/embeddings';
const EMBED_DIM = 1536;

async function embedFetch(
  apiKey: string,
  modelId: string,
  text: string,
): Promise<Response> {
  const res = await fetch(EMBED_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: modelId, input: text }),
  });
  return res;
}

function parseEmbedResponse(data: {
  data?: { embedding?: number[] }[];
}): number[] {
  const emb = data.data?.[0]?.embedding;
  if (!Array.isArray(emb) || emb.length !== EMBED_DIM) {
    throw new Error('Embed: invalid response shape');
  }
  return emb;
}

export async function embed(
  apiKey: string,
  modelId: string,
  text: string,
): Promise<number[]> {
  const res = await embedFetch(apiKey, modelId, text);
  if (!res.ok) {
    const t = await res.text();
    throw new Error(
      `Embed ${res.status}: ${t.slice(0, 200)}`,
    );
  }
  const data = (await res.json()) as {
    data?: { embedding?: number[] }[];
  };
  return parseEmbedResponse(data);
}
