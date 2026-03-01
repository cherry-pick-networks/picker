//
// Load DML SQL from files. Use for application/<module>/sql/*.sql.
// Resolves path from baseUrl (e.g. new URL("./sql/", import.meta.url)).
//

import { readTextFile } from '@std/fs/unstable-read-text-file';
import { fromFileUrl } from '@std/path/from-file-url';

const cache = new Map<string, string>();

async function readAndCache(url: URL): Promise<string> {
  const sql = await readTextFile(fromFileUrl(url));
  cache.set(url.href, sql);
  return sql;
}

export async function loadSql(
  baseUrl: URL,
  filename: string,
): Promise<string> {
  const url = new URL(filename, baseUrl);
  const cached = cache.get(url.href);
  if (cached !== undefined) return cached;
  return await readAndCache(url);
}
