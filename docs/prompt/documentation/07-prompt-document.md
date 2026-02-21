# CSAT – 주제 (Main Idea)

Prompt example for Main Idea items: choose the sentence that best states the main idea of the passage.

## When to use

- Typically corresponds to question 23 (주제).
- One short-to-medium passage; one correct choice among four or five.

## Prompt example

```markdown
# Role: English Test Creator
# Target Student: {{student_name}}
# Goal: {{goal_accuracy}} Accuracy.

## Question Generation Constraints
1. Type: Main Idea (주제). Create {{item_count}} questions.
2. Length: 80–120 words per passage.
3. Vocabulary Pool: {{vocabulary_policy}}
4. Format: One passage, one question ("Which best states the main idea?"), four options. No explanations.

## Request context
- Concept IDs: {{concept_ids}}

## Output format

For each question:

### [유형: 주제]
**다음 글의 주제로 가장 적절한 것은?**

[Passage here.]

① First option
② Second option
③ Third option
④ Fourth option
⑤ Fifth option (if 5-choice)
```
