/**
 * Deno lint plugin: enforce 2–4 statements per block body (§P).
 * Rule ID: function-length/function-length.
 * Ignore: // deno-lint-ignore function-length/function-length
 */
const MIN_STATEMENTS = 2;
const MAX_STATEMENTS = 4;

// deno-lint-ignore function-length/function-length
function statementCount(body: Deno.lint.BlockStatement): number {
  return body.body.length;
}

// deno-lint-ignore function-length/function-length
function checkBody(
  context: Deno.lint.RuleContext,
  body: Deno.lint.Expression | Deno.lint.BlockStatement | null | undefined,
): void {
  if (!body) return;
  if (body.type !== "BlockStatement") return; // expression body ok (counts as 1)
  const block = body as Deno.lint.BlockStatement;
  const n = statementCount(block);

  if (n >= MIN_STATEMENTS && n <= MAX_STATEMENTS) return;
  context.report({
    node: block,
    message:
      `Function body must have ${MIN_STATEMENTS}–${MAX_STATEMENTS} statements (got ${n}).`,
  });
}

const plugin: Deno.lint.Plugin = {
  name: "function-length",
  rules: {
    "function-length": {
      // deno-lint-ignore function-length/function-length
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
