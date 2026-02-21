# CSAT – 어법 (Grammar)

Prompt example for Grammar items: choose the grammatically correct form or the option that completes the sentence correctly.

## When to use

- Typically corresponds to question 29 (어법).
- One or two sentences; one underlined or blank part; four options. Focus on structure, agreement, tense, articles, etc.

## Prompt example

```markdown
# Role: English Test Creator
# Target Student: {{student_name}}
# Goal: {{goal_accuracy}} Accuracy.

## Question Generation Constraints
1. Type: Grammar (어법). Create {{item_count}} questions.
2. One or two sentences per question. Underline the part to be corrected or use one blank.
3. Vocabulary Pool: {{vocabulary_policy}}
4. Format: Sentence(s) with underlined/blank portion; four options. No explanations.

## Request context
- Concept IDs: {{concept_ids}}

## Output format

For each question:

### [유형: 어법]
**다음 밑줄 친 부분 중 어법상 올바른 것은?** (or **빈칸에 들어갈 가장 적절한 것은?**)

[Sentence with _____ or ( 1 ).]

① First option
② Second option
③ Third option
④ Fourth option
```
