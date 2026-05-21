// Parser for the curriculum quiz.md convention. A quiz file looks like:
//
//   # Take-Home Quiz 1.1 — Earth's Shape
//   *Instructions: ...*
//   <!-- QUIZ_COMPONENT -->
//
//   **Question 1**
//   A ship sails away... what do you notice?
//   - A) The whole ship shrinks
//   - B) The hull disappears first
//   - C) The mast disappears first
//   **Answer: B**
//   *Explanation: On a curved surface...*
//   ---
//   **Question 2** ...
//
// Output maps 1:1 onto the Quiz / Question / Answer Prisma models.

export type ParsedQuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";

export interface ParsedOption {
  label: string; // "A", "B", ...
  text: string;
  isCorrect: boolean;
}

export interface ParsedQuestion {
  text: string;
  type: ParsedQuestionType;
  explanation: string | null;
  options: ParsedOption[];
}

export interface ParsedQuiz {
  title: string;
  questions: ParsedQuestion[];
}

const OPTION_RE = /^\s*[-*]\s*([A-Za-z])[).:]\s+(.+?)\s*$/;
const ANSWER_RE = /^\s*\*{0,2}Answer:?\*{0,2}\s*:?\s*\*{0,2}\s*([A-Za-z])/i;
const EXPLANATION_RE = /Explanation:?\*{0,2}\s*(.+?)\s*\*{0,2}\s*$/i;
const H1_RE = /^\s*#\s+(.+?)\s*$/m;

function stripInlineMarkdown(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function inferType(options: ParsedOption[]): ParsedQuestionType {
  if (options.length === 0) return "SHORT_ANSWER";
  if (options.length === 2) {
    const set = new Set(options.map((o) => o.text.trim().toLowerCase()));
    if (set.has("true") && set.has("false")) return "TRUE_FALSE";
  }
  return "MULTIPLE_CHOICE";
}

function parseBlock(block: string): ParsedQuestion | null {
  const lines = block.split("\n");
  const questionLines: string[] = [];
  const options: ParsedOption[] = [];
  let answerLabel: string | null = null;
  let explanation: string | null = null;
  let seenOption = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    // A horizontal rule ends this question's content (what follows is the next
    // section, e.g. a "Scoring" table appended after the final question).
    if (/^-{3,}$/.test(line)) break;
    // Skip answer-writing blanks ("______") used by open-ended questions.
    if (/^_{3,}$/.test(line)) continue;

    const answerMatch = line.match(ANSWER_RE);
    if (answerMatch && /answer/i.test(line)) {
      answerLabel = answerMatch[1].toUpperCase();
      continue;
    }
    if (/explanation/i.test(line)) {
      const m = line.match(EXPLANATION_RE);
      if (m) explanation = stripInlineMarkdown(m[1]);
      continue;
    }
    const optMatch = line.match(OPTION_RE);
    if (optMatch) {
      seenOption = true;
      options.push({
        label: optMatch[1].toUpperCase(),
        text: stripInlineMarkdown(optMatch[2]),
        isCorrect: false,
      });
      continue;
    }
    // Question prose only counts before the options start.
    if (!seenOption) questionLines.push(line);
  }

  const text = stripInlineMarkdown(questionLines.join(" "));
  if (!text) return null;

  if (answerLabel) {
    for (const opt of options) {
      if (opt.label === answerLabel) opt.isCorrect = true;
    }
  }

  return { text, type: inferType(options), explanation, options };
}

export function parseQuizMarkdown(markdown: string): ParsedQuiz {
  const titleMatch = markdown.match(H1_RE);
  const title = titleMatch ? stripInlineMarkdown(titleMatch[1]) : "Quiz";

  // Body after the QUIZ_COMPONENT marker if present, else the whole file.
  const markerIdx = markdown.search(/<!--\s*QUIZ_COMPONENT\s*-->/i);
  const body = markerIdx >= 0 ? markdown.slice(markerIdx) : markdown;

  // Split on the "**Question N**" markers. Tolerate suffix text inside the
  // bold marker, e.g. "**Question 7 (Challenge)**". The first chunk is preamble.
  const chunks = body.split(/\*\*\s*Question\s+\d+[^*\n]*\*\*/i).slice(1);

  const questions: ParsedQuestion[] = [];
  for (const chunk of chunks) {
    const parsed = parseBlock(chunk);
    if (parsed) questions.push(parsed);
  }

  return { title, questions };
}
