//
// Content domain route registration (core, assessment, review, instruction, recommend).
// Used by system/app/routesRegisterConfig.ts.
//

import type { Hono } from 'hono';
import * as core from '#system/content/bank/endpoint.ts';
import * as assessment from '#system/content/assessment/promptContextEndpoint.ts';
import * as reviewMapping from '#system/content/review/mappingEndpoint.ts';
import registerRoutes from '#system/content/recommend/registerRoutes.ts';
import * as instrDiff from '#system/content/instruction/differentiatedEndpoint.ts';
import * as instrBlueprint from '#system/content/instruction/examBlueprintEndpoint.ts';
import * as instrAnalogy from '#system/content/instruction/conceptAnalogyEndpoint.ts';
import * as instrScaffold from '#system/content/instruction/stepByStepScaffoldEndpoint.ts';
import * as instrSlide from '#system/content/instruction/slideDeckContextEndpoint.ts';
import * as instrFill from '#system/content/instruction/fillInTheBlankTargetsEndpoint.ts';
import * as instrHandover from '#system/content/instruction/subTeacherHandoverEndpoint.ts';
import * as instrRubric from '#system/content/instruction/rubricEvaluationDataEndpoint.ts';
import * as instrReading from '#system/content/instruction/readingMaterialMatchEndpoint.ts';
import * as instrReviewWk from '#system/content/instruction/reviewWorksheetTargetsEndpoint.ts';

function registerContentCoreItems(app: Hono): void {
  app.get('/core/items/:id', core.getItem);
  app.post('/core/items', core.postItem);
  app.patch('/core/items/:id', core.patchItem);
}

function registerContentCoreAssessmentReview(
  app: Hono,
): void {
  app.get(
    '/content/assessment/prompt-context',
    assessment.getAssessmentPromptContext,
  );
  app.post(
    '/content/items/generate-dynamic',
    core.postGenerateDynamic,
  );
  app.post(
    '/content/review/map-to-ontology',
    reviewMapping.postReviewMapping,
  );
}

function registerContentCore(app: Hono): void {
  registerContentCoreItems(app);
  registerContentCoreAssessmentReview(app);
}

function registerContentInstructionGroup1(app: Hono): void {
  app.get(
    '/content/instruction/differentiated',
    instrDiff.getDifferentiatedInstruction,
  );
  app.get(
    '/content/instruction/exam-blueprint',
    instrBlueprint.getExamBlueprint,
  );
  app.get(
    '/content/instruction/concept-analogy',
    instrAnalogy.getConceptAnalogy,
  );
}

function registerContentInstructionGroup2(app: Hono): void {
  app.get(
    '/content/instruction/step-by-step-scaffold',
    instrScaffold.getStepByStepScaffold,
  );
  app.get(
    '/content/instruction/slide-deck-context',
    instrSlide.getSlideDeckContext,
  );
  app.get(
    '/content/instruction/fill-in-the-blank-targets',
    instrFill.getFillInTheBlankTargets,
  );
}

function registerContentInstructionGroup3(app: Hono): void {
  app.get(
    '/content/instruction/sub-teacher-handover',
    instrHandover.getSubTeacherHandover,
  );
  app.get(
    '/content/instruction/rubric-evaluation-data',
    instrRubric.getRubricEvaluationData,
  );
  app.get(
    '/content/instruction/reading-material-match',
    instrReading.getReadingMaterialMatch,
  );
  app.get(
    '/content/instruction/review-worksheet-targets',
    instrReviewWk.getReviewWorksheetTargets,
  );
}

function registerContentInstruction(app: Hono): void {
  registerContentInstructionGroup1(app);
  registerContentInstructionGroup2(app);
  registerContentInstructionGroup3(app);
}

function registerContentRoutes(app: Hono): void {
  registerContentCore(app);
  registerContentInstruction(app);
  registerRoutes(app);
}

export default registerContentRoutes;
