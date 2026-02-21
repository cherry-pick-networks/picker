/**
 * Deno lint plugin: enforce 2–4 statements per block body (§P); context-aware
 * exceptions for JSX return (B) and single pipeline (C). Rule ID: function-length/function-length.
 * Ignore: // deno-lint-ignore function-length/function-length
 * Phase 0: context.filename available for path/extension filtering.
 * Phase 4: logical statement count only (no line-count option).
 */
const MIN_STATEMENTS = 2;
const MAX_STATEMENTS = 4;
const MAX_STATEMENTS_JSX_TAIL = 10;

function statementCount(body: Deno.lint.BlockStatement): number {
  return body.body.length;
}

function lastStatement(
  body: Deno.lint.BlockStatement,
): Deno.lint.Statement | undefined {
  const b = body.body;
  return b.length === 0 ? undefined : b[b.length - 1];
}

function isReturnWithJSX(stmt: Deno.lint.Statement): boolean {
  if (stmt.type !== "ReturnStatement") return false;
  const arg = (stmt as Deno.lint.ReturnStatement).argument;
  if (!arg) return false;
  return arg.type === "JSXElement" || arg.type === "JSXFragment";
}

function returnExprContainsAwait(node: Deno.lint.Expression): boolean {
  if (node.type === "AwaitExpression") return true;
  const withArg = node as { argument?: Deno.lint.Expression };
  if (withArg.argument && typeof withArg.argument === "object")
    if (returnExprContainsAwait(withArg.argument)) return true;
  if (node.type === "CallExpression") {
    const ce = node as Deno.lint.CallExpression;
    if (returnExprContainsAwait(ce.callee as Deno.lint.Expression)) return true;
    for (const a of ce.arguments) {
      if (a && typeof a === "object" && "type" in a && returnExprContainsAwait(a as Deno.lint.Expression)) return true;
    }
  }
  if (node.type === "MemberExpression") {
    if (returnExprContainsAwait((node as Deno.lint.MemberExpression).object as Deno.lint.Expression)) return true;
  }
  if (node.type === "ConditionalExpression") {
    const c = node as Deno.lint.ConditionalExpression;
    if (returnExprContainsAwait(c.test) || returnExprContainsAwait(c.consequent) || returnExprContainsAwait(c.alternate)) return true;
  }
  return false;
}

function methodChainDepth(node: Deno.lint.Node): number {
  if (node.type === "MemberExpression") {
    const me = node as Deno.lint.MemberExpression;
    return 1 + methodChainDepth(me.object);
  }
  if (node.type === "CallExpression") {
    const ce = node as Deno.lint.CallExpression;
    return methodChainDepth(ce.callee);
  }
  return 0;
}

function isSinglePipelineReturn(stmt: Deno.lint.Statement): boolean {
  if (stmt.type !== "ReturnStatement") return false;
  const arg = (stmt as Deno.lint.ReturnStatement).argument;
  if (!arg) return false;
  const hasAwait = returnExprContainsAwait(arg);
  const depth = methodChainDepth(arg);
  return hasAwait || depth >= 2;
}

function checkBody(
  context: Deno.lint.RuleContext,
  body: Deno.lint.Expression | Deno.lint.BlockStatement | null | undefined,
): void {
  if (!body) return;
  if (body.type !== "BlockStatement") return; // expression body ok (counts as 1)
  const block = body as Deno.lint.BlockStatement;
  const n = statementCount(block);
  const last = lastStatement(block);

  if (last && isReturnWithJSX(last)) {
    if (n <= MAX_STATEMENTS_JSX_TAIL) return;
    context.report({
      node: block,
      message: `Function body with JSX return must have at most ${MAX_STATEMENTS_JSX_TAIL} statements (got ${n}).`,
    });
    return;
  }

  if (n === 1 && last && isSinglePipelineReturn(last)) return;

  if (n >= MIN_STATEMENTS && n <= MAX_STATEMENTS) return;
  context.report({
    node: block,
    message: `Function body must have ${MIN_STATEMENTS}–${MAX_STATEMENTS} statements (got ${n}).`,
  });
}

const plugin: Deno.lint.Plugin = {
  name: "function-length",
  rules: {
    "function-length": {
      create(context: Deno.lint.RuleContext) {
        const fn = context.filename ?? "";
        if (fn.includes("check-") || fn.includes("/scripts/")) return {};
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
