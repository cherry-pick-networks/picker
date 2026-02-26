---
title: usage
description: Usage of the CSAT English question bank Markdown format (item authoring).
---

# Usage: CSAT English question bank Markdown format

This document defines the standard Markdown format for authoring and storing
Korean CSAT English reading comprehension items. Use it when creating
or converting items for the question bank.

**Design principles**: Metadata (Year, Type, Difficulty) in YAML front matter
for parsing and filtering; passage, choices, and explanation clearly separated;
`<details>` for spoiler-safe viewing.

---

## 1. Main idea (topic / title / gist / claim)

> **Focus**: Identify the central message of the passage. (Typically items 20–24.)

```markdown
---
Year: 2024 CSAT
Question: 22
Type: Gist inference
Difficulty: Medium
---

### Q22. Which of the following best states the gist of the passage?

> [Passage]
> Many people make a mistake of only operating along the safe zones...
> (omitted)
> Therefore, you should step out of your comfort zone to achieve true growth.

**[Choices]**
① Accepting one's limits is the first step to growth.
② One can grow by stepping out of one's comfort zone and taking on challenges.
③ Experiencing failure is essential on the path to success.
④ Safety should come first when making plans.
⑤ Greater goals can be achieved through cooperation with others.

<details>
<summary>💡 Answer and explanation</summary>

* **Answer**: ②
* **Translation**: Many people make the mistake of staying within their comfort zone... (omitted) So you need to leave that comfort zone to achieve real growth.
* **Explanation**: The author's claim is clearly stated in the final sentence (Therefore ~).
* **Key vocabulary**:
  * comfort zone: safe zone
  * achieve: accomplish
</details>
```

---

## 2. Blank inference (high-difficulty killer items)

> **Focus**: Infer the phrase or clause that best fits the blank from the logical flow of the passage. (Typically items 31–34.)

```markdown
---
Year: 2024 CSAT
Question: 33
Type: Blank inference
Difficulty: Hard
---

### Q33. Choose the most appropriate phrase for the blank. [3 pts]

> [Passage]
> There have been psychological studies in which subjects were shown photographs of people's faces and asked to identify the expression or state of mind evinced. The results are invariably very mixed. In the 17th century the French painter and theorist Charles Le Brun drew a series of faces illustrating the various emotions that painters could be called upon to represent. What is striking about them is that ____________________________________.

**[Choices]**
① all of them could be matched consistently with their intended emotions
② every one of them was illustrated with photographic precision
③ each of them definitively displayed its own social narrative
④ most of them would be seen as representing unique characteristics
⑤ any number of them could be substituted for one another without loss

<details>
<summary>💡 Answer and explanation</summary>

* **Answer**: ⑤
* **Translation**: (Full passage translation)
* **Logical flow**: The opening establishes that reading emotions from facial expressions alone yields mixed results. So for Le Brun's faces, the blank should say they are not clearly distinguishable and can be "substituted for one another."
</details>
```

---

## 3. Indirect writing (sentence ordering)

> **Focus**: Use discourse markers, connectives, and content flow to choose the correct order of paragraphs. (Typically items 36–37.)

```markdown
---
Year: 2024 CSAT
Question: 36
Type: Sentence ordering
Difficulty: Medium-Hard
---

### Q36. Choose the order in which the following sentences best continue the given passage.

> [Given passage]
> Negotiation can be defined as an attempt to explore and reconcile conflicting positions in order to reach an acceptable outcome.

**(A)** In these and sometimes other forms of highly competitive negotiation, the parties may not care about future relationships.

**(B)** Whatever the nature of the outcome, which may actually favour one party more than another, the purpose of negotiation is the identification of areas of common interest and conflict.

**(C)** However, negotiations in business and politics are usually about a long-term relationship, where reaching an agreement that is unacceptable to the other party is a mistake.

**[Choices]**
① (A) - (C) - (B)
② (B) - (A) - (C)
③ (B) - (C) - (A)
④ (C) - (A) - (B)
⑤ (C) - (B) - (A)

<details>
<summary>💡 Answer and explanation</summary>

* **Answer**: ②
* **Clues**:
  * **Given passage**: Defines negotiation (goal of reaching an acceptable outcome).
  * **(B)**: "Whatever the nature of the outcome" picks up "outcome" from the given passage.
  * **(A) vs (C)**: (A) describes competitive negotiation where future relations don't matter; (C) contrasts with "However" and stresses long-term relationship.
</details>
```

---

## 4. Grammar / vocabulary inference

> **Focus**: Assess the underlined word's usage or grammatical correctness in context. (Items 29–30.)

```markdown
---
Year: 2024 Sept. mock
Question: 29
Type: Grammar inference
Difficulty: Medium
---

### Q29. Which of the underlined parts is grammatically incorrect?

> [Passage]
> Viewing the stress response as a resource can transform the physiology of fear into the biology of courage. It can turn a threat into a challenge and can help you ① **do** your best under pressure. Even when the stress doesn't feel helpful — as in the case of anxiety — welcoming it can transform ② **it** into something that is helpful: more energy, more confidence, and a greater willingness ③ **to take** action. You can apply this strategy in your own life. When you notice signs of stress, ④ **to think** about them as your body getting ready to meet the challenge. Remember ⑤ **what** your body is doing for you...

**[Choices]**
① do
② it
③ to take
④ to think
⑤ what

<details>
<summary>💡 Answer and explanation</summary>

* **Answer**: ④
* **Explanation**: After the adverb clause "When you notice signs of stress," a main clause is required. The verb should be in the imperative form, so the base form **think** is correct, not "to think."
</details>
```

---

## 5. Sentence insertion (indirect writing)

> **Focus**: Find the position where the given sentence best fits. Use discourse markers, connectives, and logical gaps as clues. (Items 38–39.)

```markdown
---
Year: 2024 CSAT
Question: 38
Type: Sentence insertion
Difficulty: Hard
---

### Q38. Where does the given sentence best fit in the flow of the passage?

> [Given sentence]
> Yes, some contests are seen as world class, such as identification of the Higgs particle or the development of high temperature superconductors.

> [Passage]
> Science is sometimes described as a winner-take-all contest, meaning that there are no rewards for being second or third. This is an extreme view of the nature of scientific contests. ( ① ) Even those who describe scientific contests in such a way note that it is a somewhat inaccurate description. ( ② ) But many other contests have multiple parts, and the number of such contests may be increasing. ( ③ ) By way of example, for many years it was thought that there would be one cure for cancer... (omitted)

**[Choices]**
①
②
③
④
⑤

<details>
<summary>💡 Answer and explanation</summary>

* **Answer**: ②
* **Clues**: The given sentence ("Yes, some contests are seen as world class...") affirms specific examples. The next sentence ("But many other contests...") reverses the logic, so position ② is the most natural place for the given sentence.
</details>
```

---

## 6. Irrelevant sentence

> **Focus**: Identify the sentence that does not belong to the overall flow (topic). The topic is usually stated early. (Item 35.)

```markdown
---
Year: 2024 Sept. mock
Question: 35
Type: Irrelevant sentence
Difficulty: Medium
---

### Q35. Which sentence is irrelevant to the overall flow of the passage?

> [Passage]
> Sensory nerves have specialized endings in the tissues that pick up a particular sensation. If, for example, you step on a sharp object such as a pin, nerve endings in the skin will transmit the pain sensation up your leg. ① While the pain itself is unpleasant, it is in fact acting as a protective mechanism for the foot. ② Within the brain, nerves will connect to the area that controls speech. ③ You will quickly stop walking on the pain-causing object... (omitted)

**[Choices]**
①
②
③
④
⑤

<details>
<summary>💡 Answer and explanation</summary>

* **Answer**: ②
* **Explanation**: The passage is about how sensory nerves transmit pain to protect the body. Sentence ② ("Within the brain, nerves will connect to the area that controls speech") is about speech control and is unrelated to pain or protection.
</details>
```

---

## 7. Summary completion

> **Focus**: Choose the words that best fill blanks (A) and (B) in a one-sentence summary of the passage. (Item 40.)

```markdown
---
Year: 2023 CSAT
Question: 40
Type: Summary completion
Difficulty: Medium-Hard
---

### Q40. Complete the one-sentence summary of the passage. Which pair best fills (A) and (B)?

> [Passage]
> (Passage about the trade-off between convenience of mobile location services and privacy concerns...)

> **[Summary sentence]**
> While the location-based services of mobile devices provide users with ( A ), they also raise ( B ) regarding the invasion of privacy.

**[Choices]**
| No. | (A) | (B) |
| --- | --- | --- |
| ① | convenience | concerns |
| ② | convenience | expectations |
| ③ | restrictions | concerns |
| ④ | restrictions | solutions |
| ⑤ | financial benefits | expectations |

<details>
<summary>💡 Answer and explanation</summary>

* **Answer**: ①
* **Explanation**: The passage presents convenience as an advantage and concerns about privacy invasion as a drawback.
</details>
```

---

## 8. One passage, two items (long reading)

> **Focus**: One long passage with a title-inference item and a vocabulary/blank item. (Items 41–42.)

```markdown
---
Year: 2024 June mock
Question: 41-42
Type: Long reading (title / vocabulary)
Difficulty: Hard
---

### [41–42] Read the passage and answer the questions.

> [Passage]
> (Long passage, 2–3 paragraphs...)

#### Q41. Which is the best title for the passage?
① (Choice 1)
② (Choice 2)
③ (Choice 3)

#### Q42. Which underlined word (a)–(e) is used inappropriately in context?
① (a)
② (b)
③ (c)

<details>
<summary>💡 Answer and explanation</summary>

* **Q41 Answer**: ② / Explanation: (omitted)
* **Q42 Answer**: ④ / Explanation: (omitted)
</details>
```

---

## 9. Content match / mismatch and practical texts (notices, charts)

> **Focus**: Check whether the choices match the given text or chart. (Items 25–28.)

```markdown
---
Year: 2023 CSAT
Question: 26
Type: Content mismatch
Difficulty: Easy
---

### Q26. Which of the following does NOT match the passage about Carl-Gustaf Rossby?

> [Passage]
> Carl-Gustaf Rossby was one of a group of notable Scandinavian researchers who worked with the Norwegian meteorologist Vilhelm Bjerknes... (omitted) He became a citizen of the United States in 1939.

**[Choices]**
① He worked with Vilhelm Bjerknes.
② He became a U.S. citizen in 1939.
③ (Choice 3)
④ (Choice 4)
⑤ (Choice 5)

<details>
<summary>💡 Answer and explanation</summary>

* **Answer**: ⑤
* **Explanation**: (Compare the passage with choice ⑤ and explain the mismatch.)
</details>
```

---

## Passage length and text characteristics by type

The table below summarizes average word counts and text characteristics by question type, for use when designing the DB or setting passage difficulty.

| Category | Question type | Avg. word count | Text characteristics and DB design notes |
| --- | --- | --- | --- |
| Short | 9. Content match/mismatch and practical texts | 100–130 words | Relies more on tables or bullet points than continuous text. Sentence structure is very simple. |
| Medium | 6. Irrelevant sentence | 140–160 words | Conveys a single topic quickly, so the structure is relatively short and clear. |
| | 1. Main idea (topic / gist) | 150–170 words | The most standard CSAT passage length. One complete paragraph of 5–7 sentences. |
| | 3. Indirect writing (sentence ordering) | 150–170 words | The passage is split into (A), (B), (C); each segment tends to be 40–50 words. |
| | 4. Grammar / vocabulary inference | 150–170 words | Syntax complexity of the underlined part is much higher than passage length would suggest. |
| Dense | 2. Blank inference | 150–180 words | [Killer item] Length is similar to medium, but **lexical density** is highest. Often abstract or philosophical; individual sentences are long. |
| | 5. Sentence insertion | 160–180 words | The given sentence (about 15–20 words) is outside the passage, so total length is slightly longer than standard. |
| | 7. Summary completion | 160–180 words | Structure: main body (140–150 words) plus a summary sentence below (20–30 words). |
| Long | 8. One passage, two items (Q41–42) | 250–280 words | Equivalent to two normal passages. Usually 2–3 paragraphs. |
| (Reference) | One passage, three items (Q43–45 storytelling) | 350–400 words | Story-type long passage at the end, separate from the nine types above. Longest in length but lower in difficulty. |

---

## Design points

1. **Front matter** (top `---` block): Store `Year`, `Question`, `Type`, `Difficulty` as metadata so scripts (e.g. Python, Node) can parse and load items into a DB or app.
2. **`<details>`**: Show answer and explanation only on click, so viewers can use the content without spoilers.

---

## Database and product use

This format defines a Markdown schema for all CSAT English question types. Example uses:

1. **Gatsby / Next.js**: Parse front matter to implement filters such as "blank inference only" or "2024 CSAT only."
2. **Notion import**: Paste the Markdown into Notion; `<details>` toggles work as answer-reveal blocks for self-quizzing.

Further options:

- Convert grammar or other textbook data into this CSAT-style format.
- Design a JSON/DB schema for a personal quiz app with filtering by type and tags.
- Write a prompt that, given a passage, generates items and explanations in this Markdown format.
