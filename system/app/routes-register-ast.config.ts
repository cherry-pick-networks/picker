/**
 * AST and scripts route registration.
 * Used by routes-register.ts.
 */

import type { Hono } from "hono";
import * as ast from "#system/script/ast.endpoint.ts";
import * as astApply from "#system/script/ast-apply.endpoint.ts";
import * as astDemo from "#system/script/ast-demo.endpoint.ts";
import * as scripts from "#system/script/scripts.endpoint.ts";

function registerAst(app: Hono) {
  app.get("/ast", ast.getAst);
  app.get("/ast-demo", astDemo.getAstDemo);
  app.post("/ast/apply", astApply.postAstApply);
}

function registerScripts(app: Hono) {
  app.get("/scripts", scripts.getScriptsList);
  app.get("/scripts/*", scripts.getScriptPath);
  app.post("/scripts/*", scripts.postScriptPath);
}

export function registerAstAndScripts(app: Hono): void {
  registerAst(app);
  registerScripts(app);
}
