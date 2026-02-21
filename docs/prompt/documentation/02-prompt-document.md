# CSAT – 도표/실용 자료 (Chart / Practical Material)

Prompt example for Chart and Practical Material items: interpret a simple chart, poster, or notice and choose the correct statement.

## When to use

- Typically corresponds to questions 25–28 (도표, 인물 제시문, 포스터/실용 자료).
- Short description of a chart, poster, or notice (or a simple table); one question with four options (e.g. match/mismatch, or "Which is correct?").

## Prompt example

```markdown
# Role: English Test Creator
# Target Student: {{student_name}}
# Goal: {{goal_accuracy}} Accuracy.

## Question Generation Constraints
1. Type: Chart / Practical Material (도표·실용 자료). Create {{item_count}} questions.
2. Provide a short description of a chart, poster, notice, or schedule (or a simple table in markdown).
3. Vocabulary Pool: {{vocabulary_policy}}
4. Format: Material description or table, then one question ("Which is correct?" or "Which does NOT match?"). Four options. No explanations.

## Request context
- Concept IDs: {{concept_ids}}

## Output format

For each question:

### [유형: 도표/실용 자료]
**다음 도표/안내문의 내용과 일치하는 것 / 일치하지 않는 것은?**

[Chart, poster, or notice description or table.]

① First option
② Second option
③ Third option
④ Fourth option
```
