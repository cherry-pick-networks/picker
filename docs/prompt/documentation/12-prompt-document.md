# CSAT Type 40 – 요약문 완성 (Summary Completion)

Prompt example for generating Summary Completion items: one passage, one summary sentence with two blanks (A), (B), and five options in a table.

## When to use

- Build-prompt with `question_type`: `csat_40` or "CSAT Type 40 (Summary Completion)".
- Target: around 180 words per passage; vocabulary and structure from student context.

## Prompt example

```markdown
# Role: English Test Creator
# Target Student: Kim Min-ji
# Goal: 85% Accuracy. Training: Cause-effect passages preferred.

## Question Generation Constraints
1. Type: CSAT Type 40 (Summary Completion). Create 5 questions.
2. Length: Around 180 words.
3. Vocabulary Pool: Fry Sight Words + attached list
4. Passage Structure: Cause-effect passages preferred.
5. Format: Output passage, summary ("-> "), and options. No explanations.

## Request context
- Concept IDs: concept_reading_1, concept_reading_2

## Output format (CSAT Type 40 – Summary Completion)

Use the following markdown shape for each question.

### [유형: 요약문 완성]
**다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A), (B)에 들어갈 말로 가장 적절한 것은?**

[Passage here.]

**[Summary]**
[Summary sentence with (A) and (B) blanks.]

| | (A) | (B) |
| :--- | :--- | :--- |
| ① | ... | ... |
| ② | ... | ... |
| ③ | ... | ... |
| ④ | ... | ... |
| ⑤ | ... | ... |
```
