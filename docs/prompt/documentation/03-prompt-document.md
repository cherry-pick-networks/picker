# CSAT – 흐름상 어색한 문장 (Odd Sentence / Flow)

Prompt example for Odd Sentence items: one of the four or five sentences does not fit the flow; choose which one.

## When to use

- Typically corresponds to question 35 (흐름상 어색한 문장).
- Four or five sentences; three or four form a coherent flow; one is off-topic or breaks the flow.

## Prompt example

```markdown
# Role: English Test Creator
# Target Student: {{student_name}}
# Goal: {{goal_accuracy}} Accuracy.

## Question Generation Constraints
1. Type: Odd Sentence / Flow (흐름상 어색한 문장). Create {{item_count}} questions.
2. Provide 4 or 5 sentences; exactly one does not fit the logical flow.
3. Vocabulary Pool: {{vocabulary_policy}}
4. Format: Numbered sentences; question "Which does not fit?"; options ①–④ or ①–⑤. No explanations.

## Request context
- Concept IDs: {{concept_ids}}

## Output format

For each question:

### [유형: 흐름상 어색한 문장]
**다음 흐름으로 보아 문맥상 어색한 문장은?**

(1) [First sentence.]
(2) [Second sentence.]
(3) [Third sentence.]
(4) [Fourth sentence.]
(5) [Fifth sentence, if used.]

① (1)
② (2)
③ (3)
④ (4)
⑤ (5) (if 5 sentences)
```
