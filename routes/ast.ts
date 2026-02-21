import { Project } from "ts-morph";

export const handler = {
  GET() {
    const project = new Project({ useInMemoryFileSystem: true });
    const source = project.createSourceFile("sample.ts", "const x = 1;");
    const count = source.getVariableDeclarations().length;
    return new Response(
      JSON.stringify({ variableDeclarations: count }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  },
};
