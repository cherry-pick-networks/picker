import {
  DEFAULT_GOAL_ACCURACY,
  DEFAULT_VOCABULARY,
} from "./contentPromptLoadService.ts";

export type WorksheetContext = {
  student_name: string;
  goal_accuracy: string;
  structural_notes: string;
  vocabulary_policy: string;
};

export const DEFAULT_QUESTION_TYPE = "Summary Completion";

export const DEFAULT_WORKSHEET_CONTEXT: WorksheetContext = {
  student_name: "Unknown",
  goal_accuracy: DEFAULT_GOAL_ACCURACY,
  structural_notes: "",
  vocabulary_policy: DEFAULT_VOCABULARY,
};
