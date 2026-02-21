import { App, staticFiles } from "fresh";
import { z } from "zod";
import { Project } from "ts-morph";
import { getKv } from "./lib/kv.ts";

const KvBodySchema = z.object({ key: z.string(), value: z.unknown() });

export const app = new App({ root: import.meta.url })
  .use(staticFiles())
  .get("/", (ctx) => ctx.json({ ok: true }))
  .get("/kv/:key", async (ctx) => {
    const kv = await getKv();
    const key = ctx.params.key;
    const entry = await kv.get(["kv", key]);
    return ctx.json(entry.value ?? null);
  })
  .post("/kv", async (ctx) => {
    const body = await ctx.req.json();
    const parsed = KvBodySchema.safeParse(body);
    if (!parsed.success) {
      return ctx.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const kv = await getKv();
    await kv.set(["kv", parsed.data.key], parsed.data.value);
    return ctx.json({ key: parsed.data.key });
  })
  .get("/ast", (ctx) => {
    const project = new Project({ useInMemoryFileSystem: true });
    const source = project.createSourceFile("sample.ts", "const x = 1;");
    const count = source.getVariableDeclarations().length;
    return ctx.json({ variableDeclarations: count });
  })
  .fsRoutes();

if (import.meta.main) {
  await app.listen({ port: 8000 });
}
