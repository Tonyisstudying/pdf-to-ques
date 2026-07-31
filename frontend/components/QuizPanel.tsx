"use client";

import { useState } from "react";
import { submitAnswer } from "@/lib/api";
import type { QuizQuestion } from "@/lib/types";

export default function QuizPanel({ questions }: { questions: QuizQuestion[] }) {
  return (
    <div className="mt-4 space-y-3 border-t border-border pt-3">
      {questions.map((q) => (
        <QuizQuestionItem key={q.id} question={q} />
      ))}
    </div>
  );
}

function QuizQuestionItem({ question }: { question: QuizQuestion }) {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<{ is_correct: boolean; correct_answer: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    setBusy(true);
    try {
      const res = await submitAnswer(question.id, answer);
      setResult(res);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-md bg-paper p-3">
      <p className="text-sm text-ink">{question.question_text}</p>

      {question.options ? (
        <div className="mt-2 space-y-1">
          {question.options.map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="radio"
                name={`q-${question.id}`}
                value={opt}
                checked={answer === opt}
                onChange={() => setAnswer(opt)}
              />
              {opt}
            </label>
          ))}
        </div>
      ) : (
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={2}
          className="mt-2 w-full rounded-md border border-border bg-card p-2 text-sm text-ink"
          placeholder="Your answer…"
        />
      )}

      <div className="mt-2 flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={busy || !answer}
          className="rounded-md bg-ink px-3 py-1 text-xs font-medium text-paper hover:opacity-90 disabled:opacity-40"
        >
          {busy ? "Checking…" : "Submit"}
        </button>
        {result && (
          <span className={`text-xs font-medium ${result.is_correct ? "text-moss" : "text-clay"}`}>
            {result.is_correct ? "Correct" : `Not quite — reference: ${result.correct_answer}`}
          </span>
        )}
      </div>
    </div>
  );
}
