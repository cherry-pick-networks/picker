//  Load headwords for lexis-high-basic import. Used by materialImportHighBasic.ts.

const DEFAULT_HEADWORDS_PATH =
  'temp/lexis/lexis-high-basic-headwords.json';

function getDataHeadwordsPath(): string {
  const base = import.meta.url;
  return new URL(
    '../data/lexis-high-basic-headwords.json',
    base,
  ).pathname;
}

export function reportMissingHeadwords(): void {
  console.error(
    'Missing or invalid headwords file:',
    DEFAULT_HEADWORDS_PATH,
  );
  console.error(
    'Run with --write-headwords to copy from source/data/ or temp/.',
  );
}

export async function loadDataHeadwords(): Promise<
  string[]
> {
  const raw = await Deno.readTextFile(
    getDataHeadwordsPath(),
  );
  return JSON.parse(raw) as string[];
}

export async function writeJsonToTemp(
  path: string,
  data: string[],
): Promise<void> {
  await Deno.mkdir('temp/lexis', { recursive: true });
  await Deno.writeTextFile(
    path,
    JSON.stringify(data, null, 2),
  );
  console.log('Wrote', path);
}

export async function writeHeadwordsFile(): Promise<
  string[]
> {
  const headwords = await loadDataHeadwords();
  await writeJsonToTemp(DEFAULT_HEADWORDS_PATH, headwords);
  return headwords;
}

export async function readHeadwordsFile(): Promise<
  string[]
> {
  try {
    const raw = await Deno.readTextFile(
      DEFAULT_HEADWORDS_PATH,
    );
    return JSON.parse(raw) as string[];
  } catch (e) {
    reportMissingHeadwords();
    throw e;
  }
}

export async function loadHeadwords(): Promise<string[]> {
  const write = Deno.args.includes('--write-headwords');
  const headwords = write
    ? await writeHeadwordsFile()
    : await readHeadwordsFile();
  if (headwords.length !== 1200) {
    const msg =
      `Expected 1200 headwords, got ${headwords.length}. Check ` +
      DEFAULT_HEADWORDS_PATH + '.';
    throw new Error(msg);
  }
  return headwords;
}
