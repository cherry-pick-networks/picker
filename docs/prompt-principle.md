# Prompt engineering principles and examples

Summary of 2026-style prompt engineering principles, the top 10 widely used techniques that align with them, and one concrete example per technique (from public guides and papers).

---

## 1. 2026-style principles (declarative, system-spec style)

Prompting is shifting from "conversation with AI" to **system specification for autonomous agents**: define intent and constraints, not step-by-step instructions.

### 1.1 Imperative → Declarative

- **Principle:** Do not specify *how* to do it; declare *what* should be achieved and the **constraints**.
- **Bad:** "Read the codebase, change for-loops to map, rename variables."
- **Good:** "Goal: reduce this module's time complexity to O(N) and follow clean-code principles. Choose tools (e.g. MCP) and plan/execute refactor yourself. Existing tests must not break."

### 1.2 Prompt as code (modularization)

- **Principle:** Treat prompts as versioned, structured artifacts (e.g. JSON/XML/YAML); separate system prompt, input/context, and output schema to reduce hallucination.
- **Practice:** Split global rules, context, and output format; use data structures, not long prose.

### 1.3 Self-correction and anti-prompting

- **Principle:** Before final output, force the model to consider **how the result could fail** (edge cases, potential bugs).
- **Example instruction:** "Before writing final code, list 3 potential bugs or edge cases in your logic, then include defenses against them in the code."

### 1.4 Dynamic context injection

- **Principle:** Do not paste all background into the prompt; give **hooks** so the model (or system) pulls data at runtime from RAG, MCP, APIs.
- **Example:** Instead of "Use the attached Day 1–5 data," use "Search the workspace for `.csv` or `.doc` word-list files (by recent modification) and use them for analysis."

### 1.5 2026-style declarative template (high level)

```markdown
# 1. System intent (goal)
Your goal is to [achieve X] from [input/data]. Return only the final artifact per [output schema]; do not describe process.

# 2. Context and environment
- Data: [sources, e.g. local files, APIs]
- Constraints: [e.g. no external search; difficulty level Y]

# 3. Execution and self-check constraints
[Step 1] Produce a draft internally (do not output).
[Step 2] Self-check for logical errors (e.g. multiple valid answers).
[Step 3] Output only after passing the check.

# 4. Output schema
Respond only in this structure (JSON or strict Markdown). No greeting or extra explanation.
{ "Question_Type": "...", "Text": "...", "Options": [...], "Answer": "...", "Architect_Note": "..." }
```

---

## 2. Top 10 popular techniques (mapping to the principles above)

| # | Technique | Relation to 2026 principles |
|---|------------|-----------------------------|
| 1 | GOLDEN | Structures goal, output, limits, data, evaluation, next steps (declarative + constraints). |
| 2 | Declarative vs imperative | Directly aligns with principle 1.1 (what vs how). |
| 3 | Chain-of-Thought (CoT) | Elicits reasoning; often used inside agent/self-check flows. |
| 4 | ReAct | Combines reasoning and tool use (thought–action–observation); agent control. |
| 5 | Structured output / schema | Enforces form (principle 1.2); reduces hallucination. |
| 6 | CRISPE | Role, request, info, style, performance, examples (structured prompt). |
| 7 | RAG / dynamic context | Principle 1.4 (retrieve, don’t paste everything). |
| 8 | Prompt as code (DSPy) | Principle 1.2 (signatures, modules, versioning). |
| 9 | Self-consistency / self-correction | Principle 1.3 (multiple paths or self-verification). |
| 10 | Few-shot / zero-shot | Context and examples vs instruction-only; standard baseline. |

---

## 3. One example per technique (well-known public examples)

### 3.1 GOLDEN

```
Role: Strategy analyst
Goal: Executive brief on {{topic}} for {{audience}}
Output: 5 bullet insights + 3 risks + 3 next steps (≤200 words)
Limits: Avoid jargon; cite sources if used
Data: [paste context or sources]
Evaluation: Clarity(0-5), Evidence(0-5), Actionability(0-5)
Next: Provide next steps or 2 alternatives if confidence < 0.7
```

*Source: Prompt Builder 2025 checklist, OpenAI community.*

### 3.2 Declarative

```
Create a healthy, budget-friendly meal plan for a family of four.
```

*(Imperative version: "List cheap healthy ingredients, then make a meal plan with them.")*  
*Source: Towards Data Science, goal-oriented prompting.*

### 3.3 Chain-of-Thought (zero-shot CoT)

```
When I was 6 my sister was half my age. Now I'm 70 how old is my sister? Let's think step by step.
```

*Source: Kojima et al. 2022, "Large Language Models are Zero-Shot Reasoners".*

### 3.4 ReAct

```
Question: What is the elevation range for the area that the eastern sector of the Colorado orogeny extends into?

Thought 1: I need to search Colorado orogeny, find the area that the eastern sector extends into, then find the elevation range.
Action 1: Search[Colorado orogeny]
Observation 1: [retrieved result]
Thought 2: ...
Action 2: Lookup[eastern sector]
...
```

*Source: Yao et al. 2022, PromptingGuide.ai; HotpotQA-style. In practice, the user often sends only the question; the system prompt enforces Thought/Action/Observation format.*

### 3.5 Structured output (schema)

API-level schema (e.g. OpenAI `response_format`) rather than prose; example structure:

```json
{
  "name": "math_reasoning",
  "schema": {
    "type": "object",
    "properties": {
      "steps": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "explanation": {"type": "string"},
            "output": {"type": "string"}
          },
          "required": ["explanation", "output"]
        }
      },
      "final_answer": {"type": "string"}
    },
    "required": ["steps", "final_answer"]
  },
  "strict": true
}
```

*Source: OpenAI Structured Outputs (e.g. math tutor).*

### 3.6 CRISPE

```
Capacity & Role: Act as a senior e-commerce data analyst specializing in conversion optimization.
Request: Identify causes of our 20% drop in paid enrollments and produce an action plan.
Information: We run an e-learning marketplace with stable traffic but 20% drop in paid enrollments.
Style: Three sections—key findings, diagnosis, recommendations. Bullet points, ≤500 words.
Performance: All actions doable within 30 days with impact estimates. No jargon.
Examples: Structure similar to McKinsey's Quick-Win Growth Audit.
```

*Source: Medium, Tixu Blog (CRISPE = Capacity/Role, Request, Information, Style, Performance, Examples).*

### 3.7 RAG / dynamic context

```
Answer the question based only on the following context. If the answer is not in the context, say "I don't know."

Context:
[Retrieved documents]

Question: [User query]

Answer:
```

*Source: Milvus/Zilliz, ScoutOS, and common RAG templates.*

### 3.8 Prompt as code (DSPy)

```python
# Declarative signature — no long prompt text; only input/output contract
dspy.Predict("question -> answer")
# Or with types:
dspy.Predict("context: list[str], question: str -> answer: str")
```

*Source: DSPy docs (Signatures). The framework turns this into prompts or tuned pipelines.*

### 3.9 Self-consistency / self-correction

**Voting (closed-form answers):** Same question + CoT, multiple runs; take the most frequent answer (e.g. "67").

**Universal Self-Consistency (free-form):** After generating several responses, ask the model to pick the best:

```
I have generated the following responses to the question: [Your question]

Response 1: [Response 1]
Response 2: [Response 2]
Response 3: [Response 3]

Evaluate these responses. Select the most consistent response based on majority consensus. Start your answer with "The most consistent response is Response X" (without quotes).
```

*Source: Wang et al. Self-Consistency; Learn Prompting Universal Self-Consistency.*

### 3.10 Few-shot

```
Classify the sentiment of each message as Positive, Neutral, or Negative:

Message: I love croissants!
Sentiment: Positive

Message: Donuts are okay.
Sentiment: Neutral

Message: I can't stand muffins.
Sentiment: Negative

Message: Bagels are delicious.
Sentiment:
```

*Source: Google Vertex AI, DataCamp (classic sentiment example).*

---

## 4. Quick reference

| # | Type | One-line idea |
|---|------|----------------|
| 1 | GOLDEN | Goal → Output → Limits → Data → Evaluation → Next |
| 2 | Declarative | State only *what* you want (e.g. meal plan) |
| 3 | CoT | Append "Let's think step by step" (or few-shot reasoning) |
| 4 | ReAct | Thought → Action → Observation loop (tools/search) |
| 5 | Structured output | Enforce JSON (or similar) schema in the API |
| 6 | CRISPE | Role, Request, Info, Style, Performance, Examples |
| 7 | RAG | Context block + Question + Answer (dynamic retrieval) |
| 8 | DSPy | `"question -> answer"` (or typed) signature in code |
| 9 | Self-consistency | Multiple runs → majority vote or LLM-picked best |
| 10 | Few-shot | 2–3 input/output examples then blank to fill |

---

*Doc summarizes 2026-style declarative/system-spec principles and the 10 most cited prompt-engineering techniques with one representative example each from public guides and papers.*
