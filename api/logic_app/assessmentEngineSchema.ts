//  Unified assessment engine: WRONG_ANSWER, NEXT_ITEM, DIAGNOSE.

import { z } from '@hono/zod-openapi';
import {
  AdaptiveNextItemRequestSchema,
  AdaptiveNextItemResponseSchema,
  WrongAnswerGenerateRequestSchema,
  WrongAnswerGenerateResponseSchema,
} from './assessmentEvaluationSchema.ts';
import {
  DiagnoseRequestSchema,
  DiagnoseResponseSchema,
} from './diagnoseSchema.ts';

export const ActionTypeSchema = z.enum([
  'WRONG_ANSWER',
  'NEXT_ITEM',
  'DIAGNOSE',
]);
export type ActionType = z.infer<typeof ActionTypeSchema>;

const WrongAnswerContextSchema =
  WrongAnswerGenerateRequestSchema;
const NextItemContextSchema = AdaptiveNextItemRequestSchema;
const DiagnoseContextSchema = DiagnoseRequestSchema;

export const AssessmentEngineRequestSchema = z
  .discriminatedUnion('type', [
    z.object({
      type: z.literal('WRONG_ANSWER'),
      context: WrongAnswerContextSchema,
    }),
    z.object({
      type: z.literal('NEXT_ITEM'),
      context: NextItemContextSchema,
    }),
    z.object({
      type: z.literal('DIAGNOSE'),
      context: DiagnoseContextSchema,
    }),
  ]).openapi('AssessmentEngineRequest');
export type AssessmentEngineRequest = z.infer<
  typeof AssessmentEngineRequestSchema
>;

export const AssessmentEngineResponseSchema = z.union([
  WrongAnswerGenerateResponseSchema,
  AdaptiveNextItemResponseSchema,
  DiagnoseResponseSchema,
]).openapi('AssessmentEngineResponse');
export type AssessmentEngineResponse = z.infer<
  typeof AssessmentEngineResponseSchema
>;
