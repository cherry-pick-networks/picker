//  TOML read/write for audit artifacts.

import { parse } from '@std/toml/parse';
import { stringify } from '@std/toml/stringify';

export async function readTomlFile<
  T = Record<string, unknown>,
>(
  path: string,
): Promise<T | null> {
  const raw = await Deno.readTextFile(path).catch(() =>
    null
  );
  if (raw === null) return null;
  const out = parse(raw) as T;
  return out;
}

export async function writeTomlFile(
  path: string,
  obj: Record<string, unknown>,
): Promise<void> {
  const text = stringify(obj);
  await Deno.writeTextFile(path, text);
}
