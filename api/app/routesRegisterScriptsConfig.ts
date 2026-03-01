//
// Script routes: scripts list/get/post and POST /script/mutate.
//

import type { Hono } from 'hono';
import * as mutate from '#api/config/mutateEndpoint.ts';
import * as scripts from '#api/config/scriptsEndpoint.ts';

function registerScriptsAndMutate(app: Hono) {
  app.get('/scripts', scripts.getScriptsList);
  app.get('/scripts/*', scripts.getScriptPath);
  app.post('/scripts/*', scripts.postScriptPath);
  app.post('/script/mutate', mutate.postScriptMutate);
}

export function registerAstAndScripts(app: Hono): void {
  const a = app;
  registerScriptsAndMutate(a);
}
