//
// Aggregates all OpenAPI route registrations.
// Called from main.ts after registerRoutes().
//

import type { OpenAPIHono } from '@hono/zod-openapi';
import {
  registerAssessmentEngineOpenApi,
} from '#system/content/assessment/engineOpenApi.ts';
import {
  registerAssessmentEvaluationOpenApi,
} from '#system/content/assessment/evaluationOpenApi.ts';
import {
  registerDiagnoseOpenApi,
} from '#system/content/diagnose/openApi.ts';
import {
  registerItemsAutoTagConfidenceOpenApi,
} from '#system/content/bank/autoTagConfidenceOpenApi.ts';
import {
  registerGovernanceAssessmentOpenApi,
} from '#system/governance/governanceAssessmentOpenApi.ts';
import {
  registerGovernanceOntologyOpenApi,
} from '#system/governance/governanceOntologyOpenApi.ts';
import {
  registerIdentityAnalysisOpenApi,
} from '#system/identity/analysis/identityOpenApi.ts';
import {
  registerReportAssessmentExtendedOpenApi,
} from '#system/report/assessment/reportExtendedOpenApi.ts';
import {
  registerReportOntologyConceptDriftOpenApi,
} from '#system/report/ontology/reportConceptDriftOpenApi.ts';
import {
  registerReportPlagiarismOpenApi,
} from '#system/report/plagiarism/reportOpenApi.ts';
import {
  registerReportQueryOpenApi,
} from '#system/report/query/reportOpenApi.ts';
import {
  registerReportTeamsOpenApi,
} from '#system/report/teams/reportOpenApi.ts';

function registerContentAndReportPart1(
  app: OpenAPIHono,
): void {
  registerDiagnoseOpenApi(app);
  registerIdentityAnalysisOpenApi(app);
  registerReportQueryOpenApi(app);
}

function registerContentAndReportPart2(
  app: OpenAPIHono,
): void {
  registerReportTeamsOpenApi(app);
  registerAssessmentEngineOpenApi(app);
  registerAssessmentEvaluationOpenApi(app);
}

function registerContentAndReportPart3(
  app: OpenAPIHono,
): void {
  registerItemsAutoTagConfidenceOpenApi(app);
  registerReportPlagiarismOpenApi(app);
  registerReportAssessmentExtendedOpenApi(app);
  registerReportOntologyConceptDriftOpenApi(app);
}

function registerContentAndReportRoutes(
  app: OpenAPIHono,
): void {
  registerContentAndReportPart1(app);
  registerContentAndReportPart2(app);
  registerContentAndReportPart3(app);
}

export function registerOpenApiRoutes(
  app: OpenAPIHono,
): void {
  registerContentAndReportRoutes(app);
  registerGovernanceOntologyOpenApi(app);
  registerGovernanceAssessmentOpenApi(app);
}
