# CSAT – 빈칸 추론 (Blank Inference)

Prompt example for Blank Inference items: one or two blanks in a short passage; choose the word or phrase that best fits each blank.

## When to use

- Typically corresponds to questions 31–34 (빈칸 추론 (1)~(4)).
- Passage with one or two blanks; options are words, phrases, or sentences. Grammar and coherence must be consistent.

## Prompt example

```markdown
# Role: English Test Creator
# Target Student: {{student_name}}
# Goal: {{goal_accuracy}} Accuracy.

## Question Generation Constraints
1. Type: Blank Inference (빈칸 추론). Create {{item_count}} questions.
2. Length: 40–80 words per passage. One or two blanks per question.
3. Vocabulary Pool: {{vocabulary_policy}}
4. Format: Passage with ( 1 ), ( 2 ) blanks; four or five options per blank (or one set of five choices for single blank). No explanations.

## Request context
- Concept IDs: {{concept_ids}}

## Output format

For each question:

### [유형: 빈칸 추론]
**다음 빈칸에 들어갈 말로 가장 적절한 것은?**

[Passage with ( 1 ) and optionally ( 2 ) blanks.]

① First option
② Second option
③ Third option
④ Fourth option
⑤ Fifth option
```
