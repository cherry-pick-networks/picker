# CSAT – 장문독해 (Long Passage)

Prompt example for Long Passage items: one longer passage (e.g. 200–300 words) with two or three sub-questions (title, vocabulary, order, "which is NOT true?", etc.).

## When to use

- Typically corresponds to questions 41–45 (장문독해).
- One long passage; multiple items: e.g. main idea/title, vocabulary in context, sentence order, "which does not apply?", "which is inappropriate?"

## Prompt example

```markdown
# Role: English Test Creator
# Target Student: {{student_name}}
# Goal: {{goal_accuracy}} Accuracy.

## Question Generation Constraints
1. Type: Long Passage (장문독해). Create 1 passage with 3–5 sub-questions.
2. Length: 200–300 words for the passage.
3. Vocabulary Pool: {{vocabulary_policy}}
4. Sub-types: Mix of (a) title/main idea, (b) vocabulary in context, (c) order/insertion, (d) "which is NOT true?" or "which is inappropriate?"
5. Format: One passage, then questions (1), (2), (3)... each with four or five options. No explanations.

## Request context
- Concept IDs: {{concept_ids}}

## Output format

### [유형: 장문독해]

[Long passage, 200–300 words.]

**(1) 다음 글의 제목으로 가장 적절한 것은?**
① ... ② ... ③ ... ④ ... ⑤ ...

**(2) 다음 빈칸에 들어갈 가장 적절한 것은?**
① ... ② ... ③ ... ④ ... ⑤ ...

**(3) 다음 글의 내용과 일치하지 않는 것은?**
① ... ② ... ③ ... ④ ... ⑤ ...
```
