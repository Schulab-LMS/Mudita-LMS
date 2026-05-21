import { describe, it, expect } from "vitest";
import { parseQuizMarkdown } from "./curriculum-quiz-parser";

const SAMPLE = `# Take-Home Quiz 1.1 — Earth's Shape, Size, and Structure
**Unit 1.1 | 2 questions | Do this at home after your session**

*Instructions: Complete this quiz on your own.*

---

<!-- QUIZ_COMPONENT -->

**Question 1**
A ship sails away from you over the ocean. What do you notice?

- A) The whole ship shrinks and becomes too small to see
- B) The hull (bottom) disappears first, then the mast
- C) The mast disappears first, then the hull
- D) The ship disappears all at once in a flash

**Answer: B**
*Explanation: On a curved surface, the bottom of a tall object dips below the horizon first.*

---

**Question 2**
Earth's rotation causes day and night.

- A) True
- B) False

**Answer: A**
`;

describe("parseQuizMarkdown", () => {
  const quiz = parseQuizMarkdown(SAMPLE);

  it("extracts the title from the H1", () => {
    expect(quiz.title).toContain("Earth's Shape");
  });

  it("parses every question after the QUIZ_COMPONENT marker", () => {
    expect(quiz.questions).toHaveLength(2);
  });

  it("captures question text without the option lines", () => {
    expect(quiz.questions[0].text).toMatch(/ship sails away/i);
    expect(quiz.questions[0].text).not.toMatch(/disappears first/);
  });

  it("maps the Answer letter to the correct option", () => {
    const q1 = quiz.questions[0];
    expect(q1.options).toHaveLength(4);
    const correct = q1.options.filter((o) => o.isCorrect);
    expect(correct).toHaveLength(1);
    expect(correct[0].label).toBe("B");
    expect(correct[0].text).toMatch(/hull/i);
  });

  it("captures the explanation", () => {
    expect(quiz.questions[0].explanation).toMatch(/curved surface/i);
  });

  it("classifies a multiple-choice question", () => {
    expect(quiz.questions[0].type).toBe("MULTIPLE_CHOICE");
  });

  it("classifies a true/false question", () => {
    const q2 = quiz.questions[1];
    expect(q2.type).toBe("TRUE_FALSE");
    expect(q2.options.find((o) => o.label === "A")?.isCorrect).toBe(true);
  });

  it("returns no questions when the file has none", () => {
    expect(parseQuizMarkdown("# Empty quiz\n\nNothing here.").questions).toHaveLength(0);
  });

  it("captures a question whose marker has a suffix and ignores a trailing scoring table", () => {
    const md = `# Quiz
<!-- QUIZ_COMPONENT -->

**Question 1**
First question?

- A) Yes
- B) No

**Answer: A**

---

**Question 2 (Challenge)**
A harder question?

- A) Alpha
- B) Beta

**Answer: B**
*Explanation: because beta.*

---

**Scoring**
| Score | Feedback |
|-------|----------|
| 2/2 | Great |
`;
    const parsed = parseQuizMarkdown(md);
    expect(parsed.questions).toHaveLength(2);
    const challenge = parsed.questions[1];
    expect(challenge.text).toMatch(/harder question/i);
    expect(challenge.options).toHaveLength(2);
    expect(challenge.options.find((o) => o.isCorrect)?.label).toBe("B");
    expect(challenge.explanation).toMatch(/because beta/i);
  });
});
