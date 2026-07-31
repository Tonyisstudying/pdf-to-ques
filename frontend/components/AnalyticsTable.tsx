import type { ConceptAnalytics } from "@/lib/types";

export default function AnalyticsTable({ rows }: { rows: ConceptAnalytics[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-ink-soft">No concepts to analyze yet.</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-paper text-xs uppercase tracking-wide text-ink-soft">
          <tr>
            <th className="px-4 py-2">Concept</th>
            <th className="px-4 py-2">Questions</th>
            <th className="px-4 py-2">Attempts</th>
            <th className="px-4 py-2">Accuracy</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.concept_id} className="border-t border-border bg-card">
              <td className="px-4 py-2 text-ink">{r.concept_name}</td>
              <td className="px-4 py-2 text-ink-soft">{r.question_count}</td>
              <td className="px-4 py-2 text-ink-soft">{r.attempt_count}</td>
              <td className="px-4 py-2">
                {r.accuracy == null ? (
                  <span className="text-ink-soft">—</span>
                ) : (
                  <span className={accuracyColor(r.accuracy)}>{Math.round(r.accuracy * 100)}%</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function accuracyColor(accuracy: number) {
  if (accuracy >= 0.7) return "font-medium text-moss";
  if (accuracy >= 0.4) return "font-medium text-gold";
  return "font-medium text-clay";
}
