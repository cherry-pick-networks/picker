//
// Helpers for function-length lint plugin: statement count and exemptions (§P).
//
import {
  FILE_IGNORE_PATTERN,
  IGNORE_PATTERN,
  MAX_STATEMENTS,
  MIN_STATEMENTS,
} from './functionLengthLintConstants.ts';

export function statementCount(
  block: Deno.lint.BlockStatement,
): number {
  return block.body?.length ?? 0;
}

export function isSingleReturn(
  block: Deno.lint.BlockStatement,
): boolean {
  const first = block.body?.[0];
  return first != null && block.body!.length === 1 &&
    first.type === 'ReturnStatement';
}

export function isComplexStatement(
  node: Deno.lint.Node,
): boolean {
  if (node.type === 'TryStatement') return true;
  if (node.type === 'SwitchStatement') return true;
  if (node.type === 'IfStatement') {
    const n = node as Deno.lint.Node & {
      consequent?: Deno.lint.Node;
    };
    return n.consequent?.type === 'BlockStatement';
  }
  return false;
}

export function hasIgnoreComment(
  context: Deno.lint.RuleContext,
  node: Deno.lint.Node,
): boolean {
  const comments = context.sourceCode.getCommentsBefore(
    node,
  );
  if (
    comments.some((c) =>
      'value' in c && IGNORE_PATTERN.test(c.value)
    )
  ) {
    return true;
  }
  const head = context.sourceCode.getText().slice(0, 400);
  return FILE_IGNORE_PATTERN.test(head);
}

function shouldSkipReport(
  block: Deno.lint.BlockStatement,
  n: number,
  context: Deno.lint.RuleContext,
  parent: Deno.lint.Node,
): boolean {
  if (n >= MIN_STATEMENTS && n <= MAX_STATEMENTS) {
    return true;
  }
  if (
    n === 1 &&
    (isSingleReturn(block) ||
      (block.body?.[0] &&
        isComplexStatement(block.body[0])))
  ) {
    return true;
  }
  return hasIgnoreComment(context, parent);
}

export function checkBody(
  context: Deno.lint.RuleContext,
  parent: Deno.lint.Node,
  body:
    | Deno.lint.Expression
    | Deno.lint.BlockStatement
    | null
    | undefined,
): void {
  if (!body || body.type !== 'BlockStatement') return;
  const [block, n] = (() => {
    const b = body as Deno.lint.BlockStatement;
    return [b, statementCount(b)] as const;
  })();
  if (shouldSkipReport(block, n, context, parent)) return;
  context.report({
    node: block,
    message:
      `Function body must have ${MIN_STATEMENTS}–${MAX_STATEMENTS} statements ` +
      `(got ${n}).`,
  });
}
