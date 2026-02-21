# CSAT – 제목 (Title)

Prompt example for Title items: choose the title that best fits the passage.

## When to use

- Typically corresponds to question 24 (제목).
- One short-to-medium passage; one best title among four or five options.

## Prompt example

```markdown
# Role: English Test Creator
# Target Student: {{student_name}}
# Goal: {{goal_accuracy}} Accuracy.

## Question Generation Constraints
1. Type: Title (제목). Create {{item_count}} questions.
2. Length: 80–120 words per passage.
3. Vocabulary Pool: {{vocabulary_policy}}
4. Format: One passage, one question ("Which is the best title?"), four or five options. No explanations.

## Request context
- Concept IDs: {{concept_ids}}

## Output format

For each question:

### [유형: 제목]
**다음 글의 제목으로 가장 적절한 것은?**

[Passage here.]

① First option
② Second option
③ Third option
④ Fourth option
⑤ Fifth option (if 5-choice)
```
