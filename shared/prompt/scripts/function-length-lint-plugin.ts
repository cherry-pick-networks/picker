/**
 * Deno lint plugin: enforce 2–4 statements per block body (§P).
 * Count = direct statements in BlockStatement.body (AST); no line/char penalty.
 * Rule ID: function-length/function-length.
 * Ignore: // function-length-ignore above; or
 * // function-length-ignore-file at top of file.
 * Single-statement body is permitted when that statement is try/catch, switch,
 * or block-bodied if (complex statement exemption).
 */
// function-length-ignore-file
import {
  FILE_IGNORE_PATTERN,
  IGNORE_PATTERN,
  MAX_STATEMENTS,
  MIN_STATEMENTS,
} from "./function-length-lint-constants.ts";

function statementCount(block: Deno.lint.BlockStatement): number {
  return block.body?.length ?? 0;
}

function isComplexStatement(node: Deno.lint.Node): boolean {
  if (node.type === "TryStatement") return true;
  if (node.type === "SwitchStatement") return true;
  if (node.type === "IfStatement") {
    const n = node as Deno.lint.Node & { consequent?: Deno.lint.Node };
    return n.consequent?.type === "BlockStatement";
  }
  return false;
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
  return FILE_IGNORE_PATTERN.test(head);
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
  if (
    n < MIN_STATEMENTS &&
    n === 1 &&
    block.body?.[0] &&
    isComplexStatement(block.body[0])
  ) {
    return;
  }
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
