import { Project } from "ts-morph";
import type { Context } from "hono";

function variableCount(): number {
  const project = new Project({ useInMemoryFileSystem: true });
  const source = project.createSourceFile("sample.ts", "const x = 1;");
  return source.getVariableDeclarations().length;
}

export function getAst(c: Context) {
  const count = variableCount();
  return c.json({ variableDeclarations: count });
}
