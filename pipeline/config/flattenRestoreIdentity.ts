//
// Flatten identity/ to root, delete dirs, distribute files, delete empty dirs.
// Run from project root. Usage: deno run -A pipeline/config/flattenRestoreIdentity.ts
//

import { runFlattenRestore } from "./flattenRestore/core.ts";
import { identityTarget } from "./flattenRestore/targets/identity.ts";

runFlattenRestore(identityTarget).catch((e) => {
  console.error(e);
  Deno.exit(1);
});
