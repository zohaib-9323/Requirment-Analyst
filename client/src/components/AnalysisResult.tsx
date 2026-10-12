"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Download, LayoutList } from "lucide-react";
import { AnalysisResult as AnalysisResultType, CategoryKey } from "@/types";
import { CATEGORIES } from "@/lib/constants";
import {
  buildMarkdown,
  buildPlainText,
  countFindings,
  downloadFile,
} from "@/lib/report";
import CategoryCard from "./CategoryCard";

interface AnalysisResultProps {
  result: AnalysisResultType;
  requirements: string;
}

export default function AnalysisResult({ result, requirements }: AnalysisResultProps) {
  const [filter, setFilter] = useState<CategoryKey | null>(null);
  const [addressed, setAddressed] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  const total = countFindings(result);
  const visible = CATEGORIES.filter((c) => (result[c.key]?.length || 0) > 0);
  const shown = filter ? visible.filter((c) => c.key === filter) : visible;
  const doneCount = addressed.size;
  const percent = total ? Math.round((doneCount / total) * 100) : 0;

  const toggle = (id: string) =>
    setAddressed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(buildPlainText(result));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable.
    }
  };

  const exportMd = () =>
    downloadFile(
      buildMarkdown(result, requirements, addressed),
      `requirements-analysis-${new Date().toISOString().slice(0, 10)}.md`,
      "text/markdown"
    );

  const filterButton = (key: CategoryKey | null, label: string, count: number, dot?: string) => {
    const active = filter === key;
    return (
      <button
        key={key ?? "all"}
        type="button"
        onClick={() => setFilter(key)}
        aria-pressed={active}
        className={`flex w-auto shrink-0 items-center gap-2.5 lg:w-full whitespace-nowrap rounded-xl px-3 py-2 text-left text-sm transition-colors ${
          active ? "bg-surface font-semibold text-ink shadow-soft ring-1 ring-line" : "text-muted hover:bg-surface-2 hover:text-ink"
        }`}
      >
        {dot ? (
          <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} aria-hidden />
        ) : (
          <LayoutList className="h-4 w-4 shrink-0" aria-hidden />
        )}
        <span className="flex-1">{label}</span>
        <span className="font-mono text-xs text-subtle">{count}</span>
      </button>
    );
  };

  return (
    <div className="pb-8 pt-10 sm:pt-14">
      {/* ── Summary ── */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        aria-labelledby="summary-title"
      >
        <p className="eyebrow">Analysis complete</p>
        <div className="mt-2 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 id="summary-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {total} things to talk about{" "}
              <span className="font-serif font-normal italic text-accent">before</span> you build
            </h1>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">
              Work through them with your team and tick each one off once it&apos;s
              answered or added to the spec. Export the list to share it.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={copyAll} className="btn-outline">
              {copied ? (
                <Check className="h-4 w-4 text-success" aria-hidden />
              ) : (
                <Copy className="h-4 w-4" aria-hidden />
              )}
              {copied ? "Copied" : "Copy all"}
            </button>
            <button type="button" onClick={exportMd} className="btn-primary !py-2">
              <Download className="h-4 w-4" aria-hidden />
              Export checklist
            </button>
          </div>
        </div>

        {/* Counts + progress */}
        <div className="card mt-7 grid grid-cols-2 gap-px overflow-hidden bg-line lg:grid-cols-[1.4fr_repeat(5,1fr)] [&>*:last-child]:col-span-2 lg:[&>*:last-child]:col-span-1">
          <div className="col-span-2 bg-surface p-5 lg:col-span-1">
            <p className="text-sm font-medium text-muted">Addressed</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {doneCount}
              <span className="text-base font-normal text-subtle"> / {total}</span>
            </p>
            <div
              role="progressbar"
              aria-label="Findings addressed"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2"
            >
              <div
                className="h-full rounded-full bg-success transition-[width] duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setFilter(filter === c.key ? null : c.key)}
              aria-pressed={filter === c.key}
              className={`p-5 text-left transition-colors ${
                filter === c.key ? c.bg : "bg-surface hover:bg-surface-2"
              }`}
            >
              <p className="flex items-center gap-2 text-sm font-medium text-muted">
                <span className={`h-2 w-2 rounded-full ${c.dot}`} aria-hidden />
                {c.shortLabel}
              </p>
              <p className={`mt-1 text-2xl font-semibold tabular-nums ${c.text}`}>
                {result[c.key]?.length || 0}
              </p>
            </button>
          ))}
        </div>
      </motion.section>

      {/* ── Body ── */}
      <div className="mt-10 grid min-w-0 gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Filter findings" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <p className="eyebrow mb-2 hidden px-3 lg:block">Categories</p>
          <div className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
            {filterButton(null, "All findings", total)}
            {visible.map((c) => filterButton(c.key, c.label, result[c.key].length, c.dot))}
          </div>

          <details className="mt-6 hidden rounded-xl border border-line p-3 text-sm lg:block">
            <summary className="cursor-pointer select-none font-medium text-muted">
              Your requirements
            </summary>
            <p className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap text-[13px] leading-relaxed text-muted">
              {requirements}
            </p>
          </details>
        </nav>

        <div className="min-w-0 space-y-5">
          {shown.map((category, i) => (
            <motion.div
              key={category.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.35 }}
            >
              <CategoryCard
                category={category}
                items={result[category.key]}
                addressed={addressed}
                onToggle={toggle}
              />
            </motion.div>
          ))}
          {shown.length === 0 && (
            <p className="card p-8 text-center text-muted">
              No findings — your requirements look thorough.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
