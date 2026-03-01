//
// Collect DDL/DML filename errors for sql-filename check. Used by
// checkSqlFilename.ts.
//
import { getPath } from './pathConfig.ts';
import {
  validateDdlFilename,
  validateDmlFilename,
} from './checkSqlFilenameValidate.ts';

const SCHEMA_DIR = getPath('infraSchema');

export async function collectSchemaErrors(): Promise<
  [string, string][]
> {
  const errors: [string, string][] = [];
  const dir = `${Deno.cwd()}/${SCHEMA_DIR}`;
  try {
    for await (const e of Deno.readDir(dir)) {
      if (!e.isFile || !e.name.endsWith('.sql')) continue;
      const err = validateDdlFilename(e.name);
      if (err) {
        errors.push([`${SCHEMA_DIR}/${e.name}`, err]);
      }
    }
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      console.error(`${SCHEMA_DIR} not found`);
      Deno.exit(1);
    }
    throw e;
  }
  return errors;
}

export async function collectDmlErrors(): Promise<
  [string, string][]
> {
  const errors: [string, string][] = [];
  const systemDir = `${Deno.cwd()}/system`;
  try {
    for await (const mod of Deno.readDir(systemDir)) {
      if (!mod.isDirectory) continue;
      const sqlDir = `${systemDir}/${mod.name}/sql`;
      try {
        for await (const e of Deno.readDir(sqlDir)) {
          if (!e.isFile || !e.name.endsWith('.sql')) {
            continue;
          }
          const err = validateDmlFilename(e.name);
          if (err) {
            errors.push([
              `application/${mod.name}/sql/${e.name}`,
              err,
            ]);
          }
        }
      } catch {
        // no sql/ in this module
      }
    }
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) return errors;
    throw e;
  }
  return errors;
}
