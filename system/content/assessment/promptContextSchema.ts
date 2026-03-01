//  Copilot-facing assessment prompt context (Stream B).

export const DifficultyEnum = [
  'Easy',
  'Medium',
  'Hard',
] as const;
export type Difficulty = (typeof DifficultyEnum)[number];

export type PromptContextResponse = {
  target_concepts: string[];
  difficulty: Difficulty;
  avoid_concepts: string[];
};
