/**
 * Deno lint plugin: enforce 2–4 statements per block body (§P).
 * Count = direct statements in BlockStatement.body (AST); no line/char penalty.
 * Rule ID: function-length/function-length.
 * Ignore: // function-length-ignore above; or
 * // function-length-ignore-file at top of file.
 */
// function-length-ignore-file
const MIN_STATEMENTS = 2;
const MAX_STATEMENTS = 4;
const IGNORE_PATTERN =
  /function-length-ignore|function-length\/function-length/;

function statementCount(block: Deno.lint.BlockStatement): number {
  return block.body?.length ?? 0;
}

function hasIgnoreComment(
  context: Deno.lint.RuleContext,
  node: Deno.lint.Node,
): boolean {
  const comments = context.sourceCode.getCommentsBefore(node);
  if (comments.some((c) => "value" in c && IGNORE_PATTERN.test(c.value))) {
    return true;
  }
  const head = context.sourceCode.getText().slice(0, 400);
  const fileIgnore = new RegExp(
    "function-length-ignore-file|" +
      "deno-lint-ignore-file\\s+function-length|function-length-ignore",
  );
  return fileIgnore.test(head);
}

function checkBody(
  context: Deno.lint.RuleContext,
  parent: Deno.lint.Node,
  body:
    | Deno.lint.Expression
    | Deno.lint.BlockStatement
    | null
    | undefined,
): void {
  if (!body) return;
  if (body.type !== "BlockStatement") return;
  const block = body as Deno.lint.BlockStatement;
  const n = statementCount(block);
  if (n >= MIN_STATEMENTS && n <= MAX_STATEMENTS) return;
  if (hasIgnoreComment(context, parent)) return;
  const msg =
    `Function body must have ${MIN_STATEMENTS}–${MAX_STATEMENTS} statements ` +
    `(got ${n}).`;
  context.report({ node: block, message: msg });
}

function visitMethodDefinition(
  context: Deno.lint.RuleContext,
  node: Deno.lint.MethodDefinition,
): void {
  if (node.value) {
    checkBody(context, node.value, node.value.body ?? undefined);
  }
}

const plugin: Deno.lint.Plugin = {
  name: "function-length",
  rules: {
    "function-length": {
      create(context: Deno.lint.RuleContext) {
        return {
          FunctionDeclaration(node: Deno.lint.FunctionDeclaration) {
            checkBody(context, node, node.body ?? undefined);
          },
          FunctionExpression(node: Deno.lint.FunctionExpression) {
            checkBody(context, node, node.body ?? undefined);
          },
          ArrowFunctionExpression(node: Deno.lint.ArrowFunctionExpression) {
            checkBody(context, node, node.body);
          },
          MethodDefinition(node: Deno.lint.MethodDefinition) {
            visitMethodDefinition(context, node);
          },
        };
      },
    },
  },
};
export default plugin;
