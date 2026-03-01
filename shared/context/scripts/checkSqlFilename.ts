//
// SQL filename check: DDL and DML per MANUAL.md.
// - shared/infra/schema/*.sql → NN_<name>.sql (DDL)
// - system/<module>/sql/*.sql → snake_case (DML)
// Run: deno task sql-filename-check
//
import {
  collectDmlErrors,
  collectSchemaErrors,
} from './checkSqlFilenameCollect.ts';

function reportResult(errors: [string, string][]): void {
  if (errors.length > 0) {
    console.error(
      'SQL filename check failed (MANUAL.md DDL/DML naming):',
    );
    for (const [file, msg] of errors) {
      console.error(`  ${file}: ${msg}`);
    }
    Deno.exit(1);
  }
  console.log(
    'SQL filename check passed: all .sql files follow naming rules.',
  );
}

async function main(): Promise<void> {
  const schemaErrors = await collectSchemaErrors();
  const dmlErrors = await collectDmlErrors();
  reportResult([...schemaErrors, ...dmlErrors]);
}

main();
