"use client";

import { useState } from "react";
import { Check, CheckCircle2, Circle, Copy } from "lucide-react";
import { AnalysisCategory, AnalysisItem } from "@/types";
import { findingId } from "@/lib/report";
import CategoryIcon from "./CategoryIcon";

interface CategoryCardProps {
  category: AnalysisCategory;
  items: AnalysisItem[];
  addressed: Set<string>;
  onToggle: (id: string) => void;
}

function FindingRow({
  category,
  item,
  index,
  done,
  onToggle,
}: {
  category: AnalysisCategory;
  item: AnalysisItem;
  index: number;
  done: boolean;
  onToggle: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${item.title}\n${item.description}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable; nothing to do.
    }
  };

  return (
    <li className="group flex gap-3 px-5 py-4 transition-colors hover:bg-surface-2/50 sm:gap-4 sm:px-6">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={done}
        aria-label={done ? `Mark "${item.title}" as open` : `Mark "${item.title}" as addressed`}
        title={done ? "Addressed" : "Mark as addressed"}
        className="mt-0.5 shrink-0 self-start rounded-full"
      >
        {done ? (
          <CheckCircle2 className="h-5 w-5 text-success" aria-hidden />
        ) : (
          <Circle className="h-5 w-5 text-subtle transition-colors group-hover:text-muted" aria-hidden />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <h4
          className={`text-[15px] font-semibold leading-snug ${
            done ? "text-subtle line-through decoration-subtle/50" : "text-ink"
          }`}
        >
          <span className={`mr-2 font-mono text-xs font-medium ${category.text}`}>
            {String(index + 1).padStart(2, "0")}
          </span>
          {item.title}
        </h4>
        <p
          className={`mt-1.5 text-[14px] leading-relaxed ${
            done ? "text-subtle" : "text-muted"
          }`}
        >
          {item.description}
        </p>
      </div>

      <button
        type="button"
        onClick={copy}
        aria-label={`Copy "${item.title}"`}
        className="btn-ghost -mt-1 h-8 w-8 shrink-0 self-start !p-0 opacity-100 sm:opacity-0 sm:focus-visible:opacity-100 sm:group-hover:opacity-100"
      >
        {copied ? (
          <Check className="h-4 w-4 text-success" aria-hidden />
        ) : (
          <Copy className="h-4 w-4" aria-hidden />
        )}
      </button>
    </li>
  );
}

export default function CategoryCard({
  category,
  items,
  addressed,
  onToggle,
}: CategoryCardProps) {
  const doneCount = items.filter((_, i) => addressed.has(findingId(category.key, i))).length;

  return (
    <section
      id={`cat-${category.key}`}
      aria-labelledby={`cat-${category.key}-title`}
      className="card scroll-mt-24 overflow-hidden"
    >
      <header className="flex items-center gap-3.5 border-b border-line px-5 py-4 sm:px-6">
        <CategoryIcon category={category} />
        <div className="min-w-0 flex-1">
          <h3 id={`cat-${category.key}-title`} className="text-base font-semibold">
            {category.label}
          </h3>
          <p className="text-sm text-muted">{category.description}</p>
        </div>
        <span className="shrink-0 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted">
          {doneCount}/{items.length} addressed
        </span>
      </header>
      <ul className="divide-y divide-line">
        {items.map((item, i) => {
          const id = findingId(category.key, i);
          return (
            <FindingRow
              key={id}
              category={category}
              item={item}
              index={i}
              done={addressed.has(id)}
              onToggle={() => onToggle(id)}
            />
          );
        })}
      </ul>
    </section>
  );
}
