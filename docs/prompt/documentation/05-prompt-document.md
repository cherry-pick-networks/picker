# CSAT – 함축 의미 추론 (Implication)

Prompt example for Implication items: infer what is implied or suggested by the passage.

## When to use

- Typically corresponds to question 21 (함축 의미 추론).
- One short passage; choose the option that is most strongly implied (not explicitly stated).

## Prompt example

```markdown
# Role: English Test Creator
# Target Student: {{student_name}}
# Goal: {{goal_accuracy}} Accuracy.

## Question Generation Constraints
1. Type: Implication (함축 의미 추론). Create {{item_count}} questions.
2. Length: 60–100 words per passage.
3. Vocabulary Pool: {{vocabulary_policy}}
4. Format: One passage, one question ("What can be inferred?" or "What is implied?"), four or five options. The correct answer must be implied, not literally stated. No explanations.

## Request context
- Concept IDs: {{concept_ids}}

## Output format

For each question:

### [유형: 함축 의미 추론]
**다음 글에서 추론할 수 있는 내용으로 가장 적절한 것은?**

[Passage here.]

① First option
② Second option
③ Third option
④ Fourth option
⑤ Fifth option (if 5-choice)
```
