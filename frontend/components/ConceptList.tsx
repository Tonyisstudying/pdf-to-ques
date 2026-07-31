"use client";

import { useState } from "react";
import { generateQuiz } from "@/lib/api";
import type { Concept, QuizQuestion } from "@/lib/types";
import QuizPanel from "./QuizPanel";

export default function ConceptList({ concepts }: { concepts: Concept[] }) {
  const [quizzes, setQuizzes] = useState<Record<number, QuizQuestion[]>>({});
  const [loadingId, setLoadingId] = useState<number | null>(null);

  async function handleGenerate(conceptId: number) {
    setLoadingId(conceptId);
    try {
      const qs = await generateQuiz(conceptId, 2);
      setQuizzes((prev) => ({ ...prev, [conceptId]: qs }));
    } finally {
      setLoadingId(null);
    }
  }

  if (concepts.length === 0) {
    return <p className="text-sm text-ink-soft">No concepts extracted yet.</p>;
  }

  return (
    <div className="space-y-3">
      {concepts.map((c) => (
        <div key={c.id} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-lg text-ink">{c.name}</h3>
              <p className="mt-1 text-sm text-ink-soft">{c.definition}</p>
            </div>
            <button
              onClick={() => handleGenerate(c.id)}
              disabled={loadingId === c.id}
              className="shrink-0 rounded-md border border-gold px-3 py-1.5 text-xs font-medium text-gold transition hover:bg-gold hover:text-paper disabled:opacity-50"
            >
              {loadingId === c.id ? "Generating…" : quizzes[c.id] ? "Regenerate quiz" : "Generate quiz"}
            </button>
          </div>
          {quizzes[c.id] && <QuizPanel questions={quizzes[c.id]} />}
        </div>
      ))}
    </div>
  );
}
