/**
 * AST and scripts route registration.
 * Used by routes-register.ts.
 */

import type { Hono } from "hono";
import * as ast from "../../script/endpoint/ast.ts";
import * as astApply from "../../script/endpoint/ast-apply.ts";
import * as astDemo from "../../script/endpoint/ast-demo.ts";
import * as scripts from "../../script/endpoint/scripts.ts";

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
