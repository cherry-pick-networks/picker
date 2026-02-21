import { Project } from "ts-morph";

function variableCount(): number {
  const project = new Project({ useInMemoryFileSystem: true });
  const source = project.createSourceFile("sample.ts", "const x = 1;");
  return source.getVariableDeclarations().length;
}

function jsonResponse(count: number): Response {
  const body = JSON.stringify({ variableDeclarations: count });
  return new Response(body, { headers: { "Content-Type": "application/json" } });
}

export const handler = {
  GET() {
    const count = variableCount();
    return jsonResponse(count);
  },
};
