"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { CATEGORIES, EXPECTED_DURATION_MS } from "@/lib/constants";
import CategoryIcon from "./CategoryIcon";

const STEPS = [
  "Reading your requirements",
  ...CATEGORIES.map((c) => `Looking for ${c.label.toLowerCase()}`),
  "Writing up the findings",
];

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export default function LoadingState({
  requirements,
  onCancel,
}: {
  requirements: string;
  onCancel: () => void;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => setElapsed(Date.now() - start), 500);
    return () => clearInterval(id);
  }, []);

  // Progress is an estimate; ease toward 95% so it never claims to be done.
  const ratio = elapsed / EXPECTED_DURATION_MS;
  const progress = Math.min(95, 100 * (1 - Math.exp(-1.6 * ratio)));
  const step = Math.min(STEPS.length - 1, Math.floor(ratio * STEPS.length));
  const overdue = elapsed > EXPECTED_DURATION_MS * 1.2;

  return (
    <div className="mx-auto max-w-2xl pt-12 sm:pt-16">
      <div className="card p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Analysis in progress</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Reviewing your requirements…
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">
              {overdue
                ? "Taking a bit longer than usual — the AI model is still working. Hang tight."
                : "This usually takes 1–2 minutes. Keep this tab open and the results will appear here."}
            </p>
          </div>
          <button type="button" onClick={onCancel} className="btn-ghost shrink-0">
            <X className="h-4 w-4" aria-hidden />
            Cancel
          </button>
        </div>

        <div className="mt-7">
          <div className="flex items-center justify-between text-sm">
            <span aria-live="polite" className="font-medium">
              {STEPS[step]}
            </span>
            <span className="font-mono text-xs text-subtle">
              {formatTime(elapsed)}
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="Estimated progress"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2"
          >
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <ol className="mt-7 space-y-1">
          {STEPS.map((label, i) => {
            const done = i < step;
            const active = i === step;
            const cat = i > 0 && i <= CATEGORIES.length ? CATEGORIES[i - 1] : null;
            return (
              <li
                key={label}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                  active ? "bg-accent-soft font-medium text-ink" : done ? "text-muted" : "text-subtle/70"
                }`}
              >
                <span className="flex h-5 w-5 items-center justify-center">
                  {done ? (
                    <Check className="h-4 w-4 text-success" aria-label="Done" />
                  ) : active ? (
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-accent" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-line" />
                  )}
                </span>
                <span className="flex-1">{label}</span>
                {cat && (active || done) && <CategoryIcon category={cat} size="sm" />}
              </li>
            );
          })}
        </ol>
      </div>

      <details className="group mt-4 rounded-2xl border border-line px-5 py-3 text-sm">
        <summary className="cursor-pointer select-none font-medium text-muted marker:text-subtle">
          What you submitted
        </summary>
        <p className="mt-3 max-h-60 overflow-auto whitespace-pre-wrap leading-relaxed text-muted">
          {requirements}
        </p>
      </details>
    </div>
  );
}
