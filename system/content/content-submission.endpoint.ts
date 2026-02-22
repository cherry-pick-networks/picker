import type { Context } from "hono";
import {
  createSubmission,
  getItemsForWorksheet,
  getSubmission as svcGetSubmission,
  gradeSubmission,
  listSubmissions,
} from "./content.service.ts";
import { CreateSubmissionRequestSchema } from "./content.service.ts";

// function-length-ignore
async function doPostSubmission(
  c: Context,
  data: Parameters<typeof createSubmission>[0],
) {
  try {
    return c.json(await createSubmission(data), 201);
  } catch {
    return c.json({ error: "Invalid submission" }, 400);
  }
}

export async function postSubmission(c: Context) {
  const body = await c.req.json().catch(() => ({}));
  const parsed = CreateSubmissionRequestSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
  return doPostSubmission(c, parsed.data);
}

async function submissionWithGrading(
  submission: NonNullable<Awaited<ReturnType<typeof svcGetSubmission>>>,
) {
  const items = await getItemsForWorksheet(submission.worksheet_id);
  const grading = gradeSubmission(submission, items);
  return { ...submission, grading };
}

export async function getSubmission(c: Context) {
  const id = c.req.param("id");
  const sub = await svcGetSubmission(id);
  if (sub == null) return c.json({ error: "Not found" }, 404);
  const includeGrading = c.req.query("include") === "grading";
  if (!includeGrading) return c.json(sub);
  const withGrading = await submissionWithGrading(sub);
  return c.json(withGrading ?? sub);
}

export async function getSubmissions(c: Context) {
  const worksheetId = c.req.query("worksheet_id");
  const includeGrading = c.req.query("include") === "grading";
  const list = await listSubmissions(worksheetId ?? undefined);
  if (!includeGrading) return c.json({ submissions: list });
  const withGrading = await Promise.all(
    list.map((s) => submissionWithGrading(s)),
  );
  return c.json({ submissions: withGrading });
}
