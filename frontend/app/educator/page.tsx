"use client";

import { useEffect, useState } from "react";
import { getAnalytics, listDocuments } from "@/lib/api";
import type { ConceptAnalytics, Document } from "@/lib/types";
import DocumentList from "@/components/DocumentList";
import AnalyticsTable from "@/components/AnalyticsTable";
import ConceptMap from "@/components/ConceptMap";

export default function EducatorPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [rows, setRows] = useState<ConceptAnalytics[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listDocuments().then(setDocuments);
  }, []);

  useEffect(() => {
    if (selectedId == null) return;
    setLoading(true);
    getAnalytics(selectedId)
      .then(setRows)
      .finally(() => setLoading(false));
  }, [selectedId]);

  const accuracyByConceptId = Object.fromEntries(rows.map((r) => [r.concept_id, r.accuracy]));

  return (
    <div className="grid gap-8 md:grid-cols-[280px_1fr]">
      <aside>
        <h2 className="mb-2 text-xs uppercase tracking-wide text-ink-soft">Uploaded material</h2>
        <DocumentList documents={documents} selectedId={selectedId} onSelect={setSelectedId} />
      </aside>

      <section className="space-y-8">
        {selectedId == null ? (
          <p className="text-ink-soft">Select a document to see class performance.</p>
        ) : loading ? (
          <p className="text-ink-soft">Loading analytics…</p>
        ) : (
          <>
            <div>
              <h2 className="mb-3 font-display text-2xl text-ink">Concept mastery</h2>
              <AnalyticsTable rows={rows} />
            </div>
            <div>
              <h2 className="mb-3 font-display text-2xl text-ink">Concept map</h2>
              <ConceptMap
                concepts={rows.map((r) => ({
                  id: r.concept_id,
                  name: r.concept_name,
                  prerequisites: r.prerequisites,
                }))}
                accuracyByConceptId={accuracyByConceptId}
              />
              <Legend />
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function Legend() {
  return (
    <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink-soft">
      <LegendItem color="var(--color-moss)" label="Mastered (≥70%)" />
      <LegendItem color="var(--color-gold)" label="Developing (40–69%)" />
      <LegendItem color="var(--color-clay)" label="Struggling (<40%)" />
      <LegendItem color="var(--color-ink-soft)" label="No attempts yet" />
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
