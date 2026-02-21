# CSAT – 문맥상 낱말 (Vocabulary in Context)

Prompt example for Vocabulary in Context items: choose the word or phrase that best fits the blank in the passage.

## When to use

- Typically corresponds to question 30 (문맥상 낱말).
- Short passage with one blank; options are words or short phrases. Focus on meaning in context.

## Prompt example

```markdown
# Role: English Test Creator
# Target Student: {{student_name}}
# Goal: {{goal_accuracy}} Accuracy.

## Question Generation Constraints
1. Type: Vocabulary in Context (문맥상 낱말). Create {{item_count}} questions.
2. Length: 30–60 words per passage. One blank.
3. Vocabulary Pool: {{vocabulary_policy}}
4. Format: Passage with one blank; four or five options (words or short phrases). No explanations.

## Request context
- Concept IDs: {{concept_ids}}

## Output format

For each question:

### [유형: 문맥상 낱말]
**다음 빈칸에 들어갈 가장 적절한 것은?**

[Passage with one blank.]

① First option
② Second option
③ Third option
④ Fourth option
⑤ Fifth option
```
