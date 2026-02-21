/**
 * Deno lint plugin: enforce 2–4 lines per block body; expression body ok (§P).
 * Rule ID: function-length/function-length.
 * Ignore: // deno-lint-ignore function-length/function-length
 */
// deno-lint-ignore-file function-length/function-length

const MIN_LINES = 2;
const MAX_LINES = 4;

function bodyLineCount(
  context: Deno.lint.RuleContext,
  body: Deno.lint.BlockStatement,
): number {
  const text = context.sourceCode.getText(body);
  return text.split(/\r?\n/).length;
}

function checkBody(
  context: Deno.lint.RuleContext,
  body: Deno.lint.Expression | Deno.lint.BlockStatement | null | undefined,
): void {
  if (!body) return;
  if (body.type !== "BlockStatement") return; // expression body ok (counts as 1)
  const n = bodyLineCount(context, body);
  if (n < MIN_LINES || n > MAX_LINES) {
    context.report({
      node: body,
      message: `Function body must be 2–4 lines (got ${n}).`,
    });
  }
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
