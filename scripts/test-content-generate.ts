// function-length-ignore-file
/**
 * One-off test: real 4o call for grammar item generation, write result as .md.
 * Usage:
 *   ./scripts/dev.sh deno run -A --env scripts/test-content-generate.ts
 * If OPENAI_API_KEY not loaded from .env: use KEY=value only (no "export ");
 * or pass inline: OPENAI_API_KEY=sk-... ./scripts/dev.sh deno run -A scripts/test-content-generate.ts
 * Requires: OPENAI_API_KEY, DB (dev.sh supplies PG_*).
 */
import type { Item } from "#system/content/content.schema.ts";
import { generateItems } from "#system/content/content-generate.service.ts";

const OUT_FILE = "temp/generated-grammar-item.md";

const CHOICE_MARKERS = ["①", "②", "③", "④", "⑤"] as const;

function itemToMarkdown(item: Item, index: number): string {
  const topic = (item.parameters?.topic_label as string) ?? "Grammar";
  const difficulty = item.difficulty ?? "Medium";
  const explanation = (item.parameters?.explanation as string) ?? "";
  const parts = (item.stem ?? "").split("\n\n");
  const passage = parts[0] ?? "";
  const question = parts[1] ??
    "Which of the underlined parts is grammatically incorrect?";
  const options = item.options ?? [];
  const correct = Math.min(5, Math.max(1, item.correct ?? 1));
  const answerMarker = CHOICE_MARKERS[correct - 1];

  const choicesLine = CHOICE_MARKERS.map(
    (m, i) => `${m} ${options[i] ?? ""}`.trim(),
  ).join(" ");

  return `---
Type: Grammar inference
Topic: ${topic}
Difficulty: ${difficulty}
---

### Q${index + 1}. ${question}

> [Passage]
> ${passage.replace(/\n/g, "\n> ")}

**[Choices]** ${choicesLine}

<details>
<summary>💡 Answer and explanation</summary>

- **Answer**: ${answerMarker}
- **Explanation**: ${explanation}

</details>
`;
}

async function main() {
  const result = await generateItems({
    source_id: "book-grammar-intermediate",
    unit_id: "unit_7",
    topic_label: "Present perfect",
    count: 1,
  });
  if (!result.ok) {
    console.error(result.status, result.message);
    Deno.exit(1);
  }
  await Deno.mkdir("temp", { recursive: true });
  const md = result.items
    .map((item, i) => itemToMarkdown(item, i))
    .join("\n---\n\n");
  await Deno.writeTextFile(OUT_FILE, md);
  console.log(`Wrote ${result.items.length} item(s) to ${OUT_FILE}`);
}

main().catch((e) => {
  console.error(e);
  Deno.exit(1);
});
