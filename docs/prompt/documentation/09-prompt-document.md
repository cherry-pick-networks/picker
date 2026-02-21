# CSAT – 문장 삽입 (Sentence Insertion)

Prompt example for Sentence Insertion items: given a passage with blanks and one sentence, choose where the sentence should be inserted.

## When to use

- Typically corresponds to questions 38–39 (문장 삽입).
- One short passage with numbered insertion points; one sentence to insert; choose the correct position.

## Prompt example

```markdown
# Role: English Test Creator
# Target Student: {{student_name}}
# Goal: {{goal_accuracy}} Accuracy.

## Question Generation Constraints
1. Type: Sentence Insertion (문장 삽입). Create {{item_count}} questions.
2. Length: 60–100 words per passage. Mark insertion points (1), (2), (3), (4).
3. Vocabulary Pool: {{vocabulary_policy}}
4. Format: Passage with (1)–(4) positions; one given sentence; options ① (1), ② (2), ③ (3), ④ (4). No explanations.

## Request context
- Concept IDs: {{concept_ids}}

## Output format

For each question:

### [유형: 문장 삽입]
**다음 빈칸에 들어갈 가장 적절한 곳은?**

[Given sentence to insert.]

[Passage with (1), (2), (3), (4) marked.]

① (1)
② (2)
③ (3)
④ (4)
```
