//
// Deno lint plugin: enforce 2–4 statements per block body (§P).
// Rule ID: function-length/function-length.
//
import { checkBody } from './functionLengthLintPluginHelpers.ts';

function visitMethodDefinition(
  context: Deno.lint.RuleContext,
  node: Deno.lint.MethodDefinition,
): void {
  if (node.value) {
    checkBody(
      context,
      node.value,
      node.value.body ?? undefined,
    );
  }
}

const plugin: Deno.lint.Plugin = {
  name: 'function-length',
  rules: {
    'function-length': {
      create(context: Deno.lint.RuleContext) {
        return {
          FunctionDeclaration(
            node: Deno.lint.FunctionDeclaration,
          ) {
            checkBody(
              context,
              node,
              node.body ?? undefined,
            );
          },
          FunctionExpression(
            node: Deno.lint.FunctionExpression,
          ) {
            checkBody(
              context,
              node,
              node.body ?? undefined,
            );
          },
          ArrowFunctionExpression(
            node: Deno.lint.ArrowFunctionExpression,
          ) {
            checkBody(context, node, node.body);
          },
          MethodDefinition(
            node: Deno.lint.MethodDefinition,
          ) {
            visitMethodDefinition(context, node);
          },
        };
      },
    },
  },
};
export default plugin;
