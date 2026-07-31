"use client";

import type { Document } from "@/lib/types";

export default function DocumentList({
  documents,
  selectedId,
  onSelect,
}: {
  documents: Document[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  if (documents.length === 0) {
    return <p className="text-sm text-ink-soft">Nothing uploaded yet.</p>;
  }

  return (
    <ul className="space-y-1">
      {documents.map((doc) => (
        <li key={doc.id}>
          <button
            onClick={() => onSelect(doc.id)}
            className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
              selectedId === doc.id ? "bg-gold/15 font-medium text-ink" : "text-ink-soft hover:bg-paper"
            }`}
          >
            <span className="block truncate">{doc.filename}</span>
            <span className={`text-xs ${statusColor(doc.status)}`}>{doc.status}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function statusColor(status: string) {
  if (status === "ready") return "text-moss";
  if (status === "failed") return "text-clay";
  return "text-gold";
}
