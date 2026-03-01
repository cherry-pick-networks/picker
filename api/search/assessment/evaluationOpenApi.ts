//  OpenAPI for wrong-answer generate (51) and adaptive-next-item (52).

import type { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import {
  AdaptiveNextItemRequestSchema,
  AdaptiveNextItemResponseSchema,
  WrongAnswerGenerateRequestSchema,
  WrongAnswerGenerateResponseSchema,
} from './evaluationSchema.ts';
import {
  generateWrongAnswer,
  getAdaptiveNextItem,
} from './evaluationService.ts';

const wrongAnswerRoute = createRoute({
  method: 'post',
  path: '/content/assessment/wrong-answer-generate',
  request: {
    body: {
      content: {
        'application/json': {
          schema: WrongAnswerGenerateRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: WrongAnswerGenerateResponseSchema,
        },
      },
      description: 'Wrong-answer options',
    },
    400: { description: 'Invalid request' },
  },
});

const adaptiveNextRoute = createRoute({
  method: 'post',
  path: '/content/assessment/adaptive-next-item',
  request: {
    body: {
      content: {
        'application/json': {
          schema: AdaptiveNextItemRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: AdaptiveNextItemResponseSchema,
        },
      },
      description: 'Adaptive next item',
    },
    400: { description: 'Invalid request' },
  },
});

export function registerAssessmentEvaluationOpenApi(
  app: OpenAPIHono,
): void {
  app.openapi(wrongAnswerRoute, async (c) => {
    return c.json(
      await generateWrongAnswer(c.req.valid('json')),
    );
  });
  app.openapi(adaptiveNextRoute, async (c) => {
    return c.json(
      await getAdaptiveNextItem(c.req.valid('json')),
    );
  });
}
