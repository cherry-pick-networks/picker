/**
 * LLM concept ingestion (Scope 4): input text → LLM → JSON → Zod validate
 * → insert/update via concept store. Requires: DATABASE_URL or PG* env;
 * 05_ontology.sql and 05_ontology-add-requires.sql applied; OPENAI_API_KEY
 * or CONCEPT_INGEST_API_KEY. Run: deno task ingest:concepts
 */
// function-length-ignore-file
import {
  getExistingConceptIds,
  listSchemeRows,
  upsertConceptsAndRelations,
} from "#system/concept/concept.store.ts";
import {
  ALLOWED_RELATION_TYPES,
  type ConceptIngestOutput,
  ConceptIngestOutputSchema,
} from "./concept-ingest.schema.ts";

const DEFAULT_API_URL = "https://api.openai.com/v1";
const MODEL = "gpt-4o-mini";

function getInputText(): Promise<string> {
  const fileIdx = Deno.args.indexOf("--file");
  if (fileIdx >= 0 && Deno.args[fileIdx + 1]) {
    return Deno.readTextFile(Deno.args[fileIdx + 1]);
  }
  return new Promise((resolve, reject) => {
    const chunks: string[] = [];
    const reader = Deno.stdin.readable.getReader();
    function read(): void {
      reader.read().then(({ value, done }) => {
        if (done) {
          resolve(chunks.join(""));
          return;
        }
        chunks.push(new TextDecoder().decode(value));
        read();
      }, reject);
    }
    read();
  });
}

function getApiConfig(): { url: string; key: string } | null {
  const key = Deno.env.get("OPENAI_API_KEY") ??
    Deno.env.get("CONCEPT_INGEST_API_KEY");
  if (!key) return null;
  const base = Deno.env.get("CONCEPT_INGEST_API_URL") ?? DEFAULT_API_URL;
  const url = base.replace(/\/$/, "") + "/chat/completions";
  return { url, key };
}

const SYSTEM_PROMPT =
  `You extract ontology concepts and optional relations from the given text.
Output only a single JSON object with:
- "concepts": array of { "id": string, "scheme_id": string, "pref_label": string, "notation"?: string, "source"?: string }. Use IDs with prefixes subj-, type-, cog-, or ctx- for new concepts; scheme_id must be an existing scheme (e.g. ddc).
- "relations": optional array of { "source_id": string, "target_id": string, "relation_type": "broader"|"narrower"|"related"|"exactMatch"|"requires" }.
No other text; no markdown code fence.`;

async function callLlm(text: string): Promise<string> {
  const config = getApiConfig();
  if (!config) {
    throw new Error(
      "Set OPENAI_API_KEY or CONCEPT_INGEST_API_KEY for LLM ingestion",
    );
  }
  const res = await fetch(config.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
      temperature: 0.2,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`LLM request failed: ${res.status} ${t}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("LLM returned empty content");
  return content;
}

function parseAndValidate(content: string): ConceptIngestOutput {
  const raw = JSON.parse(content) as unknown;
  const parsed = ConceptIngestOutputSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Zod validation failed: ${parsed.error.message}`);
  }
  return parsed.data;
}

async function validateAgainstDb(data: ConceptIngestOutput): Promise<void> {
  const schemeRows = await listSchemeRows();
  const schemeIds = new Set(schemeRows.map((r) => r.id));
  const allIds = new Set<string>(data.concepts.map((c) => c.id));
  if (data.relations) {
    for (const r of data.relations) {
      allIds.add(r.source_id);
      allIds.add(r.target_id);
    }
  }
  const existingConceptIds = await getExistingConceptIds([...allIds]);
  for (const c of data.concepts) {
    if (!schemeIds.has(c.scheme_id)) {
      throw new Error(`Unknown scheme_id: ${c.scheme_id}`);
    }
  }
  if (data.relations) {
    const conceptIds = new Set(data.concepts.map((c) => c.id));
    for (const r of data.relations) {
      if (!ALLOWED_RELATION_TYPES.includes(r.relation_type)) {
        throw new Error(`Invalid relation_type: ${r.relation_type}`);
      }
      const okSource = conceptIds.has(r.source_id) ||
        existingConceptIds.has(r.source_id);
      const okTarget = conceptIds.has(r.target_id) ||
        existingConceptIds.has(r.target_id);
      if (!okSource) {
        throw new Error(`Unknown source_id in relation: ${r.source_id}`);
      }
      if (!okTarget) {
        throw new Error(`Unknown target_id in relation: ${r.target_id}`);
      }
    }
  }
}

async function persist(data: ConceptIngestOutput): Promise<void> {
  await upsertConceptsAndRelations(data.concepts, data.relations ?? []);
}

async function run(): Promise<void> {
  const text = await getInputText();
  if (!text.trim()) {
    throw new Error("No input text. Use --file <path> or pipe stdin.");
  }
  const content = await callLlm(text);
  const data = parseAndValidate(content);
  await validateAgainstDb(data);
  await persist(data);
}

run()
  .then(() => {
    console.log("Concept ingestion done.");
  })
  .catch((e) => {
    console.error("Concept ingestion failed:", e);
    Deno.exit(1);
  });
