/**
 * SQL filename check: DDL and DML per reference.md.
 * - shared/infra/schema/*.sql → NN_<name>.sql (DDL)
 * - system/<module>/sql/*.sql → snake_case (DML)
 * Run: deno run --allow-read shared/prompt/scripts/check-sql-filename.ts
 * Or: deno task sql-filename-check
 */

const SCHEMA_DIR = 'shared/infra/schema';
const DDL_FILENAME_REGEX = /^(\d{2})_([a-z][a-z0-9]*(-[a-z0-9]+)*)\.sql$/;
const DDL_NAME_REGEX = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const DML_FILENAME_REGEX = /^[a-z][a-z0-9]*(_[a-z0-9]+)*\.sql$/;

function validateDdlFilename(base: string): string | null {
  const m = base.match(DDL_FILENAME_REGEX);
  if (!m) {
    return 'must match NN_<name>.sql (NN=00-99, name=lowercase+hyphens only)';
  }
  return DDL_NAME_REGEX.test(m[2])
    ? null
    : 'name must match ^[a-z][a-z0-9]*(-[a-z0-9]+)*$';
}

function validateDmlFilename(base: string): string | null {
  const ok = DML_FILENAME_REGEX.test(base);
  return ok
    ? null
    : 'must be lowercase snake_case (e.g. get_schedule_item.sql)';
}

async function collectSchemaErrors(): Promise<[string, string][]> {
  const errors: [string, string][] = [];
  const dir = `${Deno.cwd()}/${SCHEMA_DIR}`;
  try {
    for await (const e of Deno.readDir(dir)) {
      if (!e.isFile || !e.name.endsWith('.sql')) continue;
      const err = validateDdlFilename(e.name);
      if (err) errors.push([`${SCHEMA_DIR}/${e.name}`, err]);
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

async function collectDmlErrors(): Promise<[string, string][]> {
  const errors: [string, string][] = [];
  const systemDir = `${Deno.cwd()}/system`;
  try {
    for await (const mod of Deno.readDir(systemDir)) {
      if (!mod.isDirectory) continue;
      const sqlDir = `${systemDir}/${mod.name}/sql`;
      try {
        for await (const e of Deno.readDir(sqlDir)) {
          if (!e.isFile || !e.name.endsWith('.sql')) continue;
          const err = validateDmlFilename(e.name);
          if (err) errors.push([`system/${mod.name}/sql/${e.name}`, err]);
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

function reportResult(errors: [string, string][]): void {
  if (errors.length > 0) {
    console.error('SQL filename check failed (reference.md DDL/DML naming):');
    for (const [file, msg] of errors) console.error(`  ${file}: ${msg}`);
    Deno.exit(1);
  }
  console.log('SQL filename check passed: all .sql files follow naming rules.');
}

async function main(): Promise<void> {
  const schemaErrors = await collectSchemaErrors();
  const dmlErrors = await collectDmlErrors();
  reportResult([...schemaErrors, ...dmlErrors]);
}

main();
