"use client";

import { useRef, useState } from "react";
import { uploadDocument } from "@/lib/api";
import type { Document } from "@/lib/types";

export default function UploadPanel({ onUploaded }: { onUploaded: (doc: Document) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    try {
      const doc = await uploadDocument(file);
      onUploaded(doc);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <label className="mb-2 block text-xs uppercase tracking-wide text-ink-soft">
        Add material
      </label>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.pptx,.txt,.md"
        disabled={busy}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="block w-full text-sm text-ink file:mr-3 file:rounded-md file:border-0 file:bg-gold file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-paper hover:file:opacity-90 disabled:opacity-50"
      />
      {busy && <p className="mt-2 text-xs text-ink-soft">Parsing and extracting concepts…</p>}
      {error && <p className="mt-2 text-xs text-clay">{error}</p>}
    </div>
  );
}
