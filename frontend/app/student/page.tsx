"use client";

import { useEffect, useState } from "react";
import { getConcepts, listDocuments } from "@/lib/api";
import type { Concept, Document } from "@/lib/types";
import UploadPanel from "@/components/UploadPanel";
import DocumentList from "@/components/DocumentList";
import ConceptList from "@/components/ConceptList";
import ChatPanel from "@/components/ChatPanel";
import ConceptMap from "@/components/ConceptMap";

export default function StudentPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [loading, setLoading] = useState(false);

  async function refreshDocuments() {
    setDocuments(await listDocuments());
  }

  useEffect(() => {
    refreshDocuments();
  }, []);

  useEffect(() => {
    if (selectedId == null) return;
    setLoading(true);
    getConcepts(selectedId)
      .then(setConcepts)
      .finally(() => setLoading(false));
  }, [selectedId]);

  return (
    <div className="grid gap-8 md:grid-cols-[280px_1fr]">
      <aside className="space-y-4">
        <UploadPanel
          onUploaded={(doc) => {
            refreshDocuments();
            setSelectedId(doc.id);
          }}
        />
        <div>
          <h2 className="mb-2 text-xs uppercase tracking-wide text-ink-soft">Your material</h2>
          <DocumentList documents={documents} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
      </aside>

      <section className="space-y-8">
        {selectedId == null ? (
          <p className="text-ink-soft">Select or upload material to get started.</p>
        ) : loading ? (
          <p className="text-ink-soft">Loading concepts…</p>
        ) : (
          <>
            <div>
              <h2 className="mb-3 font-display text-2xl text-ink">Concepts</h2>
              <ConceptList concepts={concepts} />
            </div>
            <ChatPanel documentId={selectedId} />
            <div>
              <h2 className="mb-3 font-display text-2xl text-ink">Concept map</h2>
              <ConceptMap concepts={concepts} />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
