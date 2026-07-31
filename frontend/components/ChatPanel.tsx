"use client";

import { useState } from "react";
import { askQuestion } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  text: string;
}

export default function ChatPanel({ documentId }: { documentId: number }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleAsk() {
    if (!input.trim() || busy) return;
    const question = input;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: question }]);
    setBusy(true);
    try {
      const res = await askQuestion(documentId, question);
      setMessages((m) => [...m, { role: "assistant", text: res.answer }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Something went wrong answering that." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="font-display text-lg text-ink">Ask about this material</h3>
      <div className="mt-3 max-h-72 space-y-3 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-sm text-ink-soft">Ask anything covered in this document.</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <p
              className={`inline-block max-w-[85%] rounded-lg px-3 py-2 text-left text-sm ${
                m.role === "user" ? "bg-ink text-paper" : "bg-paper text-ink"
              }`}
            >
              {m.text}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          placeholder="What does this material say about…"
          className="flex-1 rounded-md border border-border bg-paper px-3 py-2 text-sm text-ink"
        />
        <button
          onClick={handleAsk}
          disabled={busy}
          className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-paper disabled:opacity-50"
        >
          {busy ? "…" : "Ask"}
        </button>
      </div>
    </div>
  );
}
