/**
 * AST and scripts route registration.
 * Used by routes-register.ts.
 */

import type { Hono } from "hono";
import * as ast from "../script/ast.endpoint.ts";
import * as astApply from "../script/ast-apply.endpoint.ts";
import * as astDemo from "../script/ast-demo.endpoint.ts";
import * as scripts from "../script/scripts.endpoint.ts";

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
