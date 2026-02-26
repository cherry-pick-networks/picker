/** Read Markdown documents with optional YAML front matter (attrs + body). */

import { extract } from "@std/front-matter/yaml";

export interface DocumentWithFm {
  attrs: Record<string, unknown>;
  body: string;
}

/**
 * Reads a file and returns parsed YAML attrs and body, or null if missing.
 * Use for shared/prompt/ or docs/contract/ .md files with optional --- ... ---.
 */
export async function readDocument(
  path: string,
): Promise<DocumentWithFm | null> {
  const raw = await Deno.readTextFile(path).catch(() => null);
  if (raw === null) return null;
  try {
    const { body, attrs } = extract(raw);
    return { attrs: attrs as Record<string, unknown>, body };
  } catch {
    return { attrs: {}, body: raw };
  }
}
