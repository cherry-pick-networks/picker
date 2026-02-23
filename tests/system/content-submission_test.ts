import { assertEquals } from "@std/assert";
import { gradeSubmission } from "#system/content/content.service.ts";
import type { Item, Submission } from "#system/content/content.schema.ts";
import { app } from "../../main.ts";

const handler = (req: Request) => app.fetch(req);
const handlerTestOpts = { sanitizeResources: false };

Deno.test("gradeSubmission: two items, one correct", () => {
  const submission: Submission = {
    submission_id: "s1",
    worksheet_id: "w1",
    student_id: "u1",
    answers: { item1: 0, item2: 1 },
    submitted_at: "2025-01-01T00:00:00Z",
  };
  const items: Item[] = [
    {
      item_id: "item1",
      subjectIds: [],
      contextIds: [],
      options: ["A", "B", "C"],
      correct: 0,
    },
    {
      item_id: "item2",
      subjectIds: [],
      contextIds: [],
      options: ["X", "Y", "Z"],
      correct: 2,
    },
  ];
  const out = gradeSubmission(submission, items);
  assertEquals(out.total, 2);
  assertEquals(out.correct, 1);
  assertEquals(out.score, 0.5);
  assertEquals(out.results.length, 2);
  assertEquals(out.results[0].is_correct, true);
  assertEquals(out.results[0].chosen_text, "A");
  assertEquals(out.results[0].correct_text, "A");
  assertEquals(out.results[1].is_correct, false);
  assertEquals(out.results[1].chosen, 1);
  assertEquals(out.results[1].correct_index, 2);
  assertEquals(out.results[1].chosen_text, "Y");
  assertEquals(out.results[1].correct_text, "Z");
});

Deno.test("gradeSubmission: empty items", () => {
  const submission: Submission = {
    submission_id: "s1",
    worksheet_id: "w1",
    student_id: "u1",
    answers: {},
    submitted_at: "2025-01-01T00:00:00Z",
  };
  const out = gradeSubmission(submission, []);
  assertEquals(out.total, 0);
  assertEquals(out.correct, 0);
  assertEquals(out.score, 0);
  assertEquals(out.results, []);
});

Deno.test(
  "POST /content/submissions returns 201 with submission",
  handlerTestOpts,
  async () => {
    const body = {
      worksheet_id: `ws-${Date.now()}`,
      student_id: "student-1",
      answers: { q1: 0, q2: 1 },
    };
    const res = await handler(
      new Request("http://localhost/content/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    );
    assertEquals(res.status, 201);
    const data = await res.json();
    assertEquals(typeof data.submission_id, "string");
    assertEquals(data.worksheet_id, body.worksheet_id);
    assertEquals(data.student_id, body.student_id);
    assertEquals(data.answers, body.answers);
    assertEquals(typeof data.submitted_at, "string");

    const getRes = await handler(
      new Request(`http://localhost/content/submissions/${data.submission_id}`),
    );
    assertEquals(getRes.status, 200);
    const getData = await getRes.json();
    assertEquals(getData.submission_id, data.submission_id);
    assertEquals(getData.worksheet_id, body.worksheet_id);
  },
);

Deno.test(
  "GET /content/submissions returns 200 with submissions array",
  handlerTestOpts,
  async () => {
    const res = await handler(
      new Request("http://localhost/content/submissions"),
    );
    assertEquals(res.status, 200);
    const data = await res.json();
    assertEquals(Array.isArray(data.submissions), true);
  },
);

Deno.test(
  "GET /content/submissions/:id?include=grading includes grading",
  handlerTestOpts,
  async () => {
    const body = {
      worksheet_id: `ws-grading-${Date.now()}`,
      student_id: "student-1",
      answers: { a: 0 },
    };
    const postRes = await handler(
      new Request("http://localhost/content/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    );
    assertEquals(postRes.status, 201);
    const sub = await postRes.json();
    const base = `http://localhost/content/submissions/${sub.submission_id}`;
    const res = await handler(new Request(`${base}?include=grading`));
    assertEquals(res.status, 200);
    const data = await res.json();
    assertEquals(data.submission_id, sub.submission_id);
    assertEquals(data.grading != null, true);
    assertEquals(typeof data.grading.total, "number");
    assertEquals(typeof data.grading.correct, "number");
    assertEquals(typeof data.grading.score, "number");
    assertEquals(Array.isArray(data.grading.results), true);
  },
);

const MISSING_SUBMISSION_ID = "00000000-0000-0000-0000-000000000000";

Deno.test(
  "GET /content/submissions/:id for missing id returns 404",
  handlerTestOpts,
  async () => {
    const url = `http://localhost/content/submissions/${MISSING_SUBMISSION_ID}`;
    const res = await handler(new Request(url));
    assertEquals(res.status, 404);
  },
);
