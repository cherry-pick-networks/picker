//
// Flatten api/ to root, delete dirs, run c2 structure script, distribute files, delete empty dirs.
// Run from project root. Usage: deno run -A pipeline/config/flattenRestoreApi.ts
//

import { runFlattenRestore } from "./flattenRestore/core.ts";
import { apiTarget } from "./flattenRestore/targets/api.ts";

runFlattenRestore(apiTarget).catch((e) => {
  console.error(e);
  Deno.exit(1);
});
