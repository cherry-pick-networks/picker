//  Book import: parse units, list entries, read parts. Used by importBooksToSources.

function parseUnitNumber(name: string): number | null {
  const m = /^unit_(\d+)\.md$/.exec(name);
  return m ? parseInt(m[1], 10) : null;
}

export async function listMdEntries(
  dir: string,
): Promise<{ name: string; num: number | null }[]> {
  const entries: { name: string; num: number | null }[] =
    [];
  for await (const e of Deno.readDir(dir)) {
    if (!e.isFile || !e.name.endsWith('.md')) continue;
    entries.push({
      name: e.name,
      num: parseUnitNumber(e.name),
    });
  }
  return entries;
}

export function deriveUnitIdsAndStudyGuide(
  entries: { name: string; num: number | null }[],
): {
  unitEntries: { name: string; num: number }[];
  unitIds: string[];
  studyGuide: { name: string } | undefined;
} {
  const unitEntries = entries
    .filter((e): e is { name: string; num: number } =>
      e.num != null
    )
    .sort((a, b) => a.num - b.num);
  const studyGuide = entries.find((e) =>
    e.name === 'study_guide.md'
  );
  const unitIds = unitEntries.map((e) =>
    e.name.replace(/\.md$/, '')
  );
  return { unitEntries, unitIds, studyGuide };
}

export async function readBookParts(
  dir: string,
  unitEntries: { name: string }[],
  studyGuide: { name: string } | undefined,
): Promise<string> {
  const parts: string[] = [];
  for (const e of unitEntries) {
    parts.push(await Deno.readTextFile(`${dir}/${e.name}`));
  }
  if (studyGuide) {
    parts.push(
      await Deno.readTextFile(`${dir}/${studyGuide.name}`),
    );
  }
  return parts.join('\n\n---\n\n');
}

export async function loadBookBody(
  booksRoot: string,
  level: string,
): Promise<{ body: string; unitIds: string[] }> {
  const dir = `${booksRoot}${level}`;
  const entries = await listMdEntries(dir);
  const { unitEntries, unitIds, studyGuide } =
    deriveUnitIdsAndStudyGuide(entries);
  return {
    body: await readBookParts(dir, unitEntries, studyGuide),
    unitIds,
  };
}
