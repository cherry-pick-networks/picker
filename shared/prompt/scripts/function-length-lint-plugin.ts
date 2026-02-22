/**
 * Deno lint plugin: enforce 2–4 effective lines per block body (§P).
 * Effective line = ceil(line.length/80); body = interior of block only.
 * Rule ID: function-length/function-length.
 * Ignore: // deno-lint-ignore function-length/function-length
 */
// deno-lint-ignore-file function-length/function-length
const CHARS_PER_LINE = 80;
const MIN_EFFECTIVE_LINES = 2;
const MAX_EFFECTIVE_LINES = 4;

function effectiveLineCount(lines: string[]): number {
  return lines.reduce(
    (sum, line) => sum + Math.ceil(line.length / CHARS_PER_LINE),
    0,
  );
}

function bodyEffectiveLines(source: string): number {
  const lines = source.split(/\n/);
  const interior =
    lines.length >= 2 ? lines.slice(1, -1) : [];
  return effectiveLineCount(interior);
}

function checkBody(
  context: Deno.lint.RuleContext,
  body: Deno.lint.Expression | Deno.lint.BlockStatement | null | undefined,
): void {
  if (!body) return;
  if (body.type !== "BlockStatement") return;
  const block = body as Deno.lint.BlockStatement;
  const text = context.sourceCode.getText(block);
  const n = bodyEffectiveLines(text);

  if (n >= MIN_EFFECTIVE_LINES && n <= MAX_EFFECTIVE_LINES) return;
  const msg =
    `Function body must have ${MIN_EFFECTIVE_LINES}–${MAX_EFFECTIVE_LINES} ` +
    `lines (80-char units) (got ${n}).`;
  context.report({ node: block, message: msg });
}

const plugin: Deno.lint.Plugin = {
  name: "function-length",
  rules: {
    "function-length": {
      create(context: Deno.lint.RuleContext) {
        return {
          FunctionDeclaration(node: Deno.lint.FunctionDeclaration) {
            checkBody(context, node.body ?? undefined);
          },
          FunctionExpression(node: Deno.lint.FunctionExpression) {
            checkBody(context, node.body ?? undefined);
          },
          ArrowFunctionExpression(node: Deno.lint.ArrowFunctionExpression) {
            checkBody(context, node.body);
          },
          MethodDefinition(node: Deno.lint.MethodDefinition) {
            checkBody(context, node.value?.body ?? undefined);
          },
        };
      },
    },
  },
};
export default plugin;
