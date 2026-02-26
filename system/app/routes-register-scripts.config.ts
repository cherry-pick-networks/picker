/**
 * Script routes: scripts list/get/post and POST /script/mutate.
 */

import type { Hono } from "hono";
import * as mutate from "#system/script/mutate.endpoint.ts";
import * as scripts from "#system/script/scripts.endpoint.ts";

function registerScriptsAndMutate(app: Hono) {
  app.get("/scripts", scripts.getScriptsList);
  app.get("/scripts/*", scripts.getScriptPath);
  app.post("/scripts/*", scripts.postScriptPath);
  app.post("/script/mutate", mutate.postScriptMutate);
}

// function-length-ignore
export function registerAstAndScripts(app: Hono): void {
  registerScriptsAndMutate(app);
}
