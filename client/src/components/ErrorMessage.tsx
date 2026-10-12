"use client";

import { AlertCircle, RotateCcw, X } from "lucide-react";
import { toFriendlyError } from "@/lib/errors";

interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
  onDismiss: () => void;
}

export default function ErrorMessage({ message, onRetry, onDismiss }: ErrorMessageProps) {
  const { title, hint, details } = toFriendlyError(message);

  return (
    <div
      role="alert"
      className="mb-5 rounded-2xl border border-danger/30 bg-danger/[0.06] p-5"
    >
      <div className="flex items-start gap-3.5">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-semibold">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">{hint}</p>
          <details className="mt-2 text-sm">
            <summary className="cursor-pointer select-none text-subtle hover:text-muted">
              Technical details
            </summary>
            <p className="mt-2 break-words rounded-lg bg-surface-2 p-3 font-mono text-xs leading-relaxed text-muted">
              {details}
            </p>
          </details>
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={onRetry} className="btn-outline">
              <RotateCcw className="h-4 w-4" aria-hidden />
              Try again
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="btn-ghost !p-1.5"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
