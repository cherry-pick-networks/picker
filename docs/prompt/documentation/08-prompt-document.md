# CSAT – 요지 (Main Point)

Prompt example for Main Point / Gist items: choose the sentence that best expresses what the author is driving at.

## When to use

- Typically corresponds to question 22 (요지).
- Similar to main idea but often phrased as "What is the author's main point?" or "What does the passage mainly convey?"

## Prompt example

```markdown
# Role: English Test Creator
# Target Student: {{student_name}}
# Goal: {{goal_accuracy}} Accuracy.

## Question Generation Constraints
1. Type: Main Point (요지). Create {{item_count}} questions.
2. Length: 80–120 words per passage.
3. Vocabulary Pool: {{vocabulary_policy}}
4. Format: One passage, one question ("Which best expresses the main point?"), four or five options. No explanations.

## Request context
- Concept IDs: {{concept_ids}}

## Output format

For each question:

### [유형: 요지]
**다음 글의 요지로 가장 적절한 것은?**

[Passage here.]

① First option
② Second option
③ Third option
④ Fourth option
⑤ Fifth option (if 5-choice)
```
