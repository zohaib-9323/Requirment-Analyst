"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, ClipboardPaste, Eraser } from "lucide-react";
import { MIN_LENGTH, SAMPLES } from "@/lib/constants";

interface RequirementFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export default function RequirementForm({
  value,
  onChange,
  onSubmit,
}: RequirementFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [canPaste, setCanPaste] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setCanPaste(!!navigator.clipboard?.readText);
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
  }, []);

  const trimmed = value.trim();
  const isValid = trimmed.length >= MIN_LENGTH;
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const tooShort = trimmed.length > 0 && !isValid;

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isValid) onSubmit();
  };

  const fill = (text: string) => {
    onChange(text);
    textareaRef.current?.focus();
  };

  const paste = async () => {
    try {
      fill(await navigator.clipboard.readText());
    } catch {
      textareaRef.current?.focus();
    }
  };

  return (
    <form onSubmit={submit} className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
        <div>
          <label htmlFor="requirements" className="text-[15px] font-semibold">
            What are you building?
          </label>
          <p id="requirements-help" className="mt-0.5 text-sm text-muted">
            Paste a PRD, user stories, or a few bullet points. More context means
            sharper questions.
          </p>
        </div>
        <div className="flex items-center gap-1">
          {canPaste && (
            <button type="button" onClick={paste} className="btn-ghost">
              <ClipboardPaste className="h-4 w-4" aria-hidden />
              Paste
            </button>
          )}
          {value && (
            <button type="button" onClick={() => fill("")} className="btn-ghost">
              <Eraser className="h-4 w-4" aria-hidden />
              Clear
            </button>
          )}
        </div>
      </div>

      <textarea
        ref={textareaRef}
        id="requirements"
        name="requirements"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
        }}
        aria-describedby="requirements-help requirements-status"
        aria-invalid={tooShort || undefined}
        placeholder={
          "e.g. Users can sign up with email or Google, create projects, and invite teammates.\nAdmins can see usage reports and manage billing…"
        }
        className="req-textarea block bg-transparent px-5 py-5 text-[15px] leading-7 text-ink placeholder:text-subtle/80 focus:outline-none sm:px-6"
      />

      {!value && (
        <div className="flex flex-wrap items-center gap-2 px-5 pb-5 sm:px-6">
          <span className="mr-1 text-sm text-subtle">Or try an example:</span>
          {SAMPLES.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => fill(s.text)}
              className="chip"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-line bg-surface-2/60 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p
          id="requirements-status"
          aria-live="polite"
          className={`text-sm ${tooShort ? "text-danger" : "text-subtle"}`}
        >
          {tooShort
            ? `Add a little more detail — at least ${MIN_LENGTH} characters.`
            : `${wordCount} ${wordCount === 1 ? "word" : "words"}`}
        </p>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1 text-xs text-subtle sm:flex">
            <span className="kbd">{isMac ? "⌘" : "Ctrl"}</span>
            <span className="kbd">Enter</span>
          </span>
          <button
            type="submit"
            disabled={!isValid}
            className="btn-primary w-full sm:w-auto"
          >
            Analyze requirements
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </form>
  );
}
