//  Dispatches to wrong-answer, adaptive-next-item, or diagnose.

import type { AssessmentEngineRequest } from './engineSchema.ts';
import {
  generateWrongAnswer,
  getAdaptiveNextItem,
} from './evaluationService.ts';
import { runMisconceptionDiagnosis } from '#system/content/diagnose/service.ts';

export type AssessmentEngineResult =
  | { options: string[] }
  | { item?: Record<string, unknown> }
  | {
    student?: string;
    error_type: string;
    related_ontology_node?: string;
  }
  | { ok: false; status: 400 | 404 | 502; message: string };

export async function runAssessmentEngine(
  req: AssessmentEngineRequest,
): Promise<AssessmentEngineResult> {
  switch (req.type) {
    case 'WRONG_ANSWER':
      return generateWrongAnswer(req.context);
    case 'NEXT_ITEM':
      return getAdaptiveNextItem(req.context);
    case 'DIAGNOSE': {
      const result = await runMisconceptionDiagnosis(
        req.context,
      );
      if (!result.ok) {
        return {
          ok: false,
          status: result.status,
          message: result.message,
        };
      }
      return result.response;
    }
  }
}
