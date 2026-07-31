"use client";

import { useMemo } from "react";

interface ConceptNode {
  id: number;
  name: string;
  prerequisites: string[];
}

interface PositionedNode extends ConceptNode {
  x: number;
  y: number;
}

function normalizeConceptName(name: string): string {
  const normalized = name
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .trim()
    .split(/\s+/)
    .map((word) => {
      if (word.endsWith("ies") && word.length > 3) return `${word.slice(0, -3)}y`;
      if (word.endsWith("ses") && word.length > 3) return word.slice(0, -2);
      if (word.endsWith("s") && word.length > 3) return word.slice(0, -1);
      return word;
    });
  return normalized.join(" ");
}

export default function ConceptMap({
  concepts,
  accuracyByConceptId,
}: {
  concepts: ConceptNode[];
  accuracyByConceptId?: Record<number, number | null>;
}) {
  const size = 480;
  const center = size / 2;
  const radius = size / 2 - 64;

  const positioned = useMemo<PositionedNode[]>(() => {
    return concepts.map((c, i) => {
      const angle = (i / Math.max(concepts.length, 1)) * Math.PI * 2 - Math.PI / 2;
      return { ...c, x: center + radius * Math.cos(angle), y: center + radius * Math.sin(angle) };
    });
  }, [concepts, center, radius]);

  const byName = useMemo(() => {
    const map = new Map<string, PositionedNode>();
    positioned.forEach((p) => map.set(normalizeConceptName(p.name), p));
    return map;
  }, [positioned]);

  function colorFor(id: number) {
    const acc = accuracyByConceptId?.[id];
    if (acc == null) return "var(--color-ink-soft)";
    if (acc >= 0.7) return "var(--color-moss)";
    if (acc >= 0.4) return "var(--color-gold)";
    return "var(--color-clay)";
  }

  if (concepts.length === 0) {
    return <p className="text-sm text-ink-soft">No concepts yet — upload material to build the map.</p>;
  }

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto w-full max-w-[480px]"
      role="img"
      aria-label="Map of concepts and their prerequisite relationships"
    >
      {positioned.map((node) =>
        node.prerequisites.map((prereqName) => {
          const target = byName.get(normalizeConceptName(prereqName));
          if (!target) return null;
          return (
            <line
              key={`${node.id}-${prereqName}`}
              x1={node.x}
              y1={node.y}
              x2={target.x}
              y2={target.y}
              stroke="var(--color-border)"
              strokeWidth={1.5}
            />
          );
        })
      )}
      {positioned.map((node) => (
        <g key={node.id}>
          <circle cx={node.x} cy={node.y} r={10} fill={colorFor(node.id)} stroke="var(--color-card)" strokeWidth={2} />
          <text
            x={node.x}
            y={node.y + 22}
            textAnchor="middle"
            fill="var(--color-ink)"
            style={{ fontSize: 11, fontFamily: "var(--font-body)" }}
          >
            {node.name.length > 14 ? `${node.name.slice(0, 13)}…` : node.name}
          </text>
        </g>
      ))}
    </svg>
  );
}
