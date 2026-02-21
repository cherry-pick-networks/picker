# CSAT – 순서 추론 (Sentence Order)

Prompt example for Sentence Order items: given four or five sentences in wrong order, choose the correct order (e.g. ①②③④ or ③①④②).

## When to use

- Typically corresponds to questions 36–37 (순서 추론).
- Four or five sentences; one correct sequence. Logic and cohesion must be clear.

## Prompt example

```markdown
# Role: English Test Creator
# Target Student: {{student_name}}
# Goal: {{goal_accuracy}} Accuracy.

## Question Generation Constraints
1. Type: Sentence Order (순서 추론). Create {{item_count}} questions.
2. Provide 4 or 5 sentences that form one coherent paragraph when ordered correctly.
3. Vocabulary Pool: {{vocabulary_policy}}
4. Format: List sentences (A), (B), (C), (D) [and (E)]; options are order choices (e.g. ① ①②③④ ② ②①③④ ...). No explanations.

## Request context
- Concept IDs: {{concept_ids}}

## Output format

For each question:

### [유형: 순서 추론]
**다음 문장들이 순서대로 올바르게 나열된 것은?**

(A) [First sentence of the correct sequence.]
(B) [Second sentence.]
(C) [Third sentence.]
(D) [Fourth sentence.]
(E) [Fifth sentence, if 5-sentence.]

① ①②③④ (or ①②③④⑤)
② ②①③④
③ ...
④ ...
⑤ ...
```
