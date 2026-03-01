//
// Content domain route registration (core, assessment, review, instruction, recommend).
// Used by application/app/routesRegisterConfig.ts.
//

import type { Hono } from 'hono';
import * as core from '#api/search/bank/endpoint.ts';
import * as assessment from '#api/search/assessment/promptContextEndpoint.ts';
import * as reviewMapping from '#api/search/review/mappingEndpoint.ts';
import registerRoutes from '#api/search/recommend/registerRoutes.ts';
import * as instrDiff from '#api/search/instruction/differentiatedEndpoint.ts';
import * as instrBlueprint from '#api/search/instruction/examBlueprintEndpoint.ts';
import * as instrAnalogy from '#api/search/instruction/conceptAnalogyEndpoint.ts';
import * as instrScaffold from '#api/search/instruction/stepByStepScaffoldEndpoint.ts';
import * as instrSlide from '#api/search/instruction/slideDeckContextEndpoint.ts';
import * as instrFill from '#api/search/instruction/fillInTheBlankTargetsEndpoint.ts';
import * as instrHandover from '#api/search/instruction/subTeacherHandoverEndpoint.ts';
import * as instrRubric from '#api/search/instruction/rubricEvaluationDataEndpoint.ts';
import * as instrReading from '#api/search/instruction/readingMaterialMatchEndpoint.ts';
import * as instrReviewWk from '#api/search/instruction/reviewWorksheetTargetsEndpoint.ts';

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
